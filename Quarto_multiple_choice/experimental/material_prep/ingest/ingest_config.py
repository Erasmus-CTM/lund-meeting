import tomllib
from pathlib import Path
from typing import Literal

from pydantic import BaseModel


class IngestConfig(BaseModel):
    input_root: Path
    chunker: Literal["regex", "greedyline", "greedyword"]
    chunker_options: dict[str, object]


def load_ingest_config(
    path: Path | str = "./material_prep/ingest_config.toml",
) -> IngestConfig:
    raw = tomllib.loads(Path(path).read_text())
    return IngestConfig(**raw)
