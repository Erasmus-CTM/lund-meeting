import re
from typing import List, Dict, Optional


def _strip_yaml_front_matter(text: str) -> str:
    # Removes Quarto/YAML front matter if present
    # ---\n ... \n---\n
    return re.sub(r"(?s)\A---\n.*?\n---\n", "", text, count=1)


def chunk_markdown(
    text: str,
    source_path: str,
    max_chars: int = 4000,
    overlap_chars: int = 300,
    page: Optional[int] = None,
    file_type: str = "unknown",
    unit: Optional[str] = None,
) -> List[Dict]:
    """
    Simple, robust chunker for .md/.qmd:
    - strips YAML front matter
    - splits by headings (#, ##, ###...)
    - further splits long sections by character count with overlap
    Returns list of dicts: {title, text, source, page, file_type, unit}
    """
    text = _strip_yaml_front_matter(text).strip()
    if not text:
        return []

    # Split on headings; keep headings
    # This yields segments starting with a heading line (or the initial content).
    parts = re.split(r"(?m)^(#{1,6})\s+(.+?)\s*$", text)
    # re.split produces: [preamble, hlevel, htitle, body, hlevel, htitle, body, ...]
    chunks = []

    preamble = parts[0].strip()
    if preamble:
        chunks.extend(
            _split_long(
                title="Preamble",
                body=preamble,
                source_path=source_path,
                max_chars=max_chars,
                overlap_chars=overlap_chars,
                page=page,
                file_type=file_type,
                unit=unit,
            )
        )

    i = 1
    while i + 2 < len(parts):
        _hlevel = parts[i]
        htitle = parts[i + 1].strip()
        body = parts[i + 2].strip()
        i += 3

        if not body:
            continue

        chunks.extend(
            _split_long(
                title=htitle,
                body=body,
                source_path=source_path,
                max_chars=max_chars,
                overlap_chars=overlap_chars,
                page=page,
                file_type=file_type,
                unit=unit,
            )
        )

    return chunks


def _split_long(
    title: str,
    body: str,
    source_path: str,
    max_chars: int,
    overlap_chars: int,
    page: Optional[int] = None,
    file_type: str = "unknown",
    unit: Optional[str] = None,
) -> List[Dict]:
    # Split body into windows of max_chars with overlap_chars overlap
    out = []
    body = body.strip()
    if len(body) <= max_chars:
        out.append(
            {
                "title": title,
                "text": body,
                "source": source_path,
                "page": page,
                "file_type": file_type,
                "unit": unit,
            }
        )
        return out

    start = 0
    while start < len(body):
        end = min(len(body), start + max_chars)
        window = body[start:end].strip()
        if window:
            out.append(
                {
                    "title": title,
                    "text": window,
                    "source": source_path,
                    "page": page,
                    "file_type": file_type,
                    "unit": unit,
                }
            )
        if end == len(body):
            break
        start = max(0, end - overlap_chars)

    return out
