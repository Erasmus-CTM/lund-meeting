from pathlib import Path
import json
import re
import faiss
import numpy as np
import time

from ingest.chunker import chunk_markdown
from ingest.embed import embed_texts
from ingest.pdfer import pdf_to_markdown
from config import Config


def extract_unit(path: Path) -> str | None:
    """Extract unit number from path like 'unit01/file.tex' → '01'."""
    for part in path.parts:
        match = re.match(r"^unit(\d+)$", part, re.IGNORECASE)
        if match:
            return match.group(1)
    return None


def collect_files(repo_dir: Path) -> list[Path]:
    """
    Recursively collect all .qmd, .md, .tex, .latex, and .pdf files from the notes directory.
    """
    files: list[Path] = []

    # Recursively find all .qmd, .md, and .pdf files
    files.extend(sorted(repo_dir.rglob("*.qmd")))
    files.extend(sorted(repo_dir.rglob("*.md")))
    files.extend(sorted(repo_dir.rglob("*.pdf")))
    files.extend(sorted(repo_dir.rglob("*.tex")))
    files.extend(sorted(repo_dir.rglob("*.latex")))

    return files


def main():
    Config.validate()

    # NOTES_REPO_DIR is validated to be non-None above
    repo_dir = Path(Config.NOTES_REPO_DIR)  # type: ignore[arg-type]
    out_dir = Path(Config.VECTOR_DB_PATH)
    out_dir.mkdir(parents=True, exist_ok=True)

    files = collect_files(repo_dir)
    if not files:
        raise RuntimeError(
            f"No files found under {repo_dir}. Check repo layout / paths."
        )

    print(f"[ingest] Found {len(files)} files to process")

    all_chunks = []
    for i, f in enumerate(files):
        rel = str(f.relative_to(repo_dir))
        unit = extract_unit(f.relative_to(repo_dir))
        print(f"[ingest] [{i + 1}/{len(files)}] Reading: {rel}")

        try:
            if f.suffix.lower() == ".pdf":
                # Process PDF with page-aware chunking
                print(f"[ingest] [{i + 1}/{len(files)}] Converting PDF: {rel}")
                start_pdf = time.time()
                page_chunks = pdf_to_markdown(f)
                print(
                    f"[ingest] [{i + 1}/{len(files)}] PDF conversion done in {time.time() - start_pdf:.1f}s (found {len(page_chunks)} pages)"
                )

                # Process each page separately with page metadata
                print(f"[ingest] [{i + 1}/{len(files)}] Chunking: {rel}")
                start_chunk = time.time()
                for page_data in page_chunks:
                    chunks = chunk_markdown(
                        page_data["text"],
                        source_path=rel,
                        page=page_data["page"],
                        file_type="pdf",
                        unit=unit,
                    )
                    # Filter out tiny chunks
                    chunks = [c for c in chunks if len(c["text"].strip()) >= 50]
                    all_chunks.extend(chunks)
                print(
                    f"[ingest] [{i + 1}/{len(files)}] Got chunks in {time.time() - start_chunk:.1f}s"
                )
            else:
                # Process markdown/qmd
                try:
                    text = f.read_text(encoding="utf-8")
                except UnicodeDecodeError:
                    text = f.read_text(encoding="utf-8", errors="replace")

                # Determine file type
                file_type = "qmd" if f.suffix.lower() == ".qmd" else "md"

                print(f"[ingest] [{i + 1}/{len(files)}] Chunking: {rel}")
                start_chunk = time.time()
                chunks = chunk_markdown(
                    text, source_path=rel, file_type=file_type, unit=unit
                )
                # Filter out tiny chunks
                chunks = [c for c in chunks if len(c["text"].strip()) >= 50]
                all_chunks.extend(chunks)
                print(
                    f"[ingest] [{i + 1}/{len(files)}] Got {len(chunks)} chunks in {time.time() - start_chunk:.1f}s"
                )
        except Exception as e:
            print(f"[ingest] WARNING: Skipping {rel}: {e}")
            continue

    if not all_chunks:
        raise RuntimeError("No chunks produced (after filtering).")

    print(f"[ingest] Total chunks: {len(all_chunks)}")
    print(f"[ingest] Embedding {len(all_chunks)} chunks...")
    start_embed = time.time()

    texts = [c["text"] for c in all_chunks]
    embeddings = embed_texts(texts)

    print(f"[ingest] Embedding done in {time.time() - start_embed:.1f}s")

    print(f"[ingest] Building FAISS index...")
    start_index = time.time()
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)
    print(f"[ingest] Index built in {time.time() - start_index:.1f}s")

    print(f"[ingest] Writing files...")
    start_write = time.time()
    faiss.write_index(index, str(out_dir / "index.faiss"))
    with open(out_dir / "meta.json", "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)

    with open(out_dir / "info.json", "w", encoding="utf-8") as f:
        json.dump(
            {
                "repo_dir": str(repo_dir),
                "files_indexed": [str(p.relative_to(repo_dir)) for p in files],
                "chunks": len(all_chunks),
                "embedding_dim": dim,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )

    # Generate config.json with unique units
    units = sorted(
        {c["unit"] for c in all_chunks if c.get("unit")}, key=lambda x: int(x)
    )
    with open(out_dir / "config.json", "w", encoding="utf-8") as f:
        json.dump({"units": units}, f, ensure_ascii=False, indent=2)
    print(f"[ingest] Files written in {time.time() - start_write:.1f}s")

    print(f"[ingest] files: {len(files)} | chunks: {len(all_chunks)} | dim: {dim}")
    print(f"[ingest] wrote: {out_dir / 'index.faiss'}")
    print(f"[ingest] wrote: {out_dir / 'meta.json'}")


if __name__ == "__main__":
    main()
