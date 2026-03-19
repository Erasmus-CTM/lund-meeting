import enum
from pathlib import Path

from pydantic import BaseModel, ConfigDict


class ContentClass(enum.Enum):
    PROSE = "prose"
    EXAMPLE = "example"
    EXERCISE = "exercise"
    UNKNOWN = "unknown"

    @classmethod
    def from_str(cls, s: str) -> "ContentClass":
        strtoclass = {v.name: v for v in ContentClass}
        return strtoclass[s]


class ExtractedSectionMarkdown(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source: Path
    # line_range: tuple[int, int] # MAYBE good?
    content: str
    classification: ContentClass
    tags: set[str]
    self_contained: bool
