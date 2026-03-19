from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Chunk:
    title: str
    content: str
    source: Path


class Chunker(ABC):
    """Base class for chunking up text content."""

    @abstractmethod
    def process(self, text: str, source: Path) -> list[Chunk]: ...
