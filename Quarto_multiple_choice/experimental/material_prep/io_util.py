import json
import re
from collections.abc import Sequence
from pathlib import Path

from pydantic import BaseModel

from ai_eval.eval_datamodels import QaQuestion
from material_prep.datamodels import ExtractedSectionMarkdown


def clean_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]

    # trash before json
    text = re.sub(r"^[\s\S]+{", "{", text)
    return text.strip()


def load_extracted_sections(
    path: Path,
    *,
    verbose: bool = True,
) -> list[ExtractedSectionMarkdown]:
    """Load NDJSON of records."""
    records = [
        ExtractedSectionMarkdown(**json.loads(s)) for s in path.read_text().splitlines()
    ]
    if verbose:
        print(f"Loaded {len(records)} records")
    return records


def load_qas_ndjson(path: Path, verbose: bool = True) -> list[QaQuestion]:
    """Load NDJSON of records."""
    records = load_ndjson_generic(path, QaQuestion)
    if verbose:
        print(f"Loaded {len(records)} records")
    return records


def load_qas_list_json(path: Path, verbose: bool = True) -> list[QaQuestion]:
    """Load list json of records."""

    raw_list = json.loads(path.read_text())
    records = [QaQuestion(**r) for r in raw_list]
    if verbose:
        print(f"Loaded {len(records)} QA questions")
    return records


def save_records_list_json(path: Path, records: Sequence[BaseModel]) -> None:
    _ = path.write_text(json.dumps([r.model_dump(mode="json") for r in records]))


def append_ndjson(file: Path, records: Sequence[BaseModel]) -> None:
    with file.open("a") as fout:
        for r in records:
            _ = fout.write(r.model_dump_json())
            _ = fout.write("\n")


def load_ndjson_generic[T](path: Path, typ: type[T]) -> list[T]:
    """Load NDJSON of records."""
    return [typ(**json.loads(s)) for s in path.read_text().splitlines()]
