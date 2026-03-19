from abc import ABCMeta, abstractmethod
from pathlib import Path
from typing import override

from attr import dataclass
from ingest.chunker import Chunk, Chunker


@dataclass
class GreedyChunker(Chunker, metaclass=ABCMeta):
    sep: str
    min_parts: int = 10
    overlap: int = 0

    @abstractmethod
    def _split(self, text: str) -> list[str]: ...

    @override
    def process(self, text: str, source: Path) -> list[Chunk]:

        chunks_contents: list[str] = []
        current: list[str] = []

        for w in map(str.strip, self._split(text)):
            if len(current) < self.min_parts:
                current.append(w)  # keep building
            else:
                # completed a chunk
                chunks_contents.append(self.sep.join(current))
                # keep some if overlap
                current = [*current[-self.overlap :], w] if self.overlap else [w]

        if current:  # one last
            chunks_contents.append(self.sep.join(current))

        return [
            Chunk(
                title=f"part-{i}",
                content=c.strip(),
                source=source,
            )
            for i, c in enumerate(chunks_contents)
        ]


class GreedyWordChunker(GreedyChunker):
    @override
    def _split(self, text: str) -> list[str]:
        return text.split(" ")


class GreedyLineChunker(GreedyChunker):
    def __init__(self, min_parts: int = 3, overlap: int = 1) -> None:
        super().__init__("\n", min_parts, overlap)

    @override
    def _split(self, text: str) -> list[str]:
        return text.splitlines()


if __name__ == "__main__":
    # "simple example"
    text = "Hello world!\n what is up? 123 cool.\n\n Now once upon a time"
    chunks = GreedyLineChunker(2, 1).process(
        text,
        Path(__file__),
    )
    for c in chunks:
        print(f"{c.title:<12}: {c.content!r}")
