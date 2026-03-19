import re
from dataclasses import dataclass
from pathlib import Path

from ingest.chunker import Chunk, Chunker


@dataclass
class RegexChunker(Chunker):
    """Modified from Andrey (https://github.com/aacchhee/rag_app/)"""

    max_chars: int = 4000
    overlap_chars: int = 300

    def process(
        self,
        text: str,
        source: Path,
    ) -> list[Chunk]:
        """
        Simple, robust chunker for .md/.qmd:
        - strips YAML front matter
        - splits by headings (#, ##, ###...)
        - further splits long sections by character count with overlap
        Returns list of dicts: {title, text, source}
        """
        text = self._strip_yaml_front_matter(text).strip()
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
                [
                    Chunk(title="Preamble", content=c, source=source)
                    for c in self._split_long(preamble)
                ],
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
                [
                    Chunk(title=htitle, content=c, source=source)
                    for c in self._split_long(body)
                ],
            )

        return chunks

    @staticmethod
    def _strip_yaml_front_matter(text: str) -> str:
        # Removes Quarto/YAML front matter if present
        # ---\n ... \n---\n
        return re.sub(r"(?s)\A---\n.*?\n---\n", "", text, count=1)

    def _split_long(self, body: str) -> list[str]:
        # Split body into windows of max_chars with overlap_chars overlap
        out: list[str] = []
        body = body.strip()
        if len(body) <= self.max_chars:
            out.append(body)
            return out

        start = 0
        while start < len(body):
            end = min(len(body), start + self.max_chars)
            window = body[start:end].strip()
            if window:
                out.append(window)
            if end == len(body):
                break
            start = max(0, end - self.overlap_chars)

        return out
