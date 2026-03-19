import json
import sys
from pathlib import Path

from jinja2 import Template
from openai import OpenAI
from pydantic import ValidationError

sys.path.append(".")

from ai_eval.eval_datamodels import QaQuestion
from material_prep import ai_util, io_util
from material_prep.datamodels import (
    ContentClass,
    ExtractedSectionMarkdown,
)

from .hashing import stable_hash

INPUT_FILE = Path("./tmp/extracted_sections.ndjson")
OUT_FILE_ND = Path("./tmp/gen_qa.ndjson")
OUT_FILE_LIST = Path("./tmp/gen_qa.json")
CLIENT = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
PROMPT_GENQA: Template = Template(
    Path("material_prep/prompts/section_to_qa2.jinja").read_text(),
)

MODEL = "Gemma3:1b"


def section_to_qa(s: ExtractedSectionMarkdown) -> QaQuestion | None:
    """Generate a QA question."""

    try:
        data = ai_util.request_json(
            CLIENT,
            PROMPT_GENQA.render(section_text=s.content),
            MODEL,
            temperature=0,
        )
        print(f"{data=}")

        h = stable_hash(data, 8)

        return QaQuestion(
            example_id=f"{s.source.stem}_{h}",
            author=MODEL,
            question=data["question"],
            context=s.content,
            answer=data["answer"],
            source=str(s.source),
        )

    except (json.JSONDecodeError, ValidationError) as e:
        print("Skipping section:", e)
        return None


def filter_and_generate() -> None:

    if OUT_FILE_ND.exists():
        if input(f"{OUT_FILE_ND} exists, overwrite? (y/n) ").lower().strip() == "y":
            OUT_FILE_ND.unlink()
        else:
            print("Abort")
            sys.exit(1)

    records = io_util.load_extracted_sections(INPUT_FILE)

    filtered = [
        r
        for r in records
        if r.self_contained
        and r.classification in {ContentClass.EXAMPLE, ContentClass.PROSE}
    ]
    print(f"Filtered -> {len(filtered)} records")

    results: list[QaQuestion] = []
    for i, rec in enumerate(filtered):
        print(f"item {i + 1}/{len(filtered)}")
        q = section_to_qa(rec)
        if q is not None:
            results.append(q)

            io_util.append_ndjson(OUT_FILE_ND, [q])

    print(f"Wrote {len(results)} to {OUT_FILE_ND}")
    io_util.save_records_list_json(OUT_FILE_LIST, results)
    print(f"Wrote {len(results)} to {OUT_FILE_LIST}")


if __name__ == "__main__":
    filter_and_generate()
