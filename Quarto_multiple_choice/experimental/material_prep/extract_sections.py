"""
Script for extracting sections and tagging them using an LLM
"""

import json
import re
import sys
from pathlib import Path

from jinja2 import Template
from openai import OpenAI
from pydantic import ValidationError

sys.path.append(".")

from material_prep import ai_util, io_util
from material_prep.datamodels import ContentClass, ExtractedSectionMarkdown
from material_prep.normalize_tags import simple_normalize

INPUT_FOLDER = Path("~/projects/ctm_project/convertingappendixdontpanik").expanduser()
OUT_FILE = Path("./tmp/extracted_sections.ndjson")
OUT_FILE.parent.mkdir(exist_ok=True)

# ignore short results
MIN_SECT_CHARS = 300

# optionally stop early when testing it out
MAX_SECTIONS: int | None = 2

CLIENT = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")


pat_sec = re.compile(r"^##", re.DOTALL | re.MULTILINE)
PROMPT_CLASSIFY: Template = Template(
    Path("material_prep/prompts/classify_section.jinja").read_text(),
)
# print prompt example
print(PROMPT_CLASSIFY.render(section_text="SECTION GOES HERE"))


def classify_section_llm(
    section_text: str,
    source: Path,
) -> ExtractedSectionMarkdown | None:

    try:
        data = ai_util.request_json(
            CLIENT,
            PROMPT_CLASSIFY.render(section_text=section_text),
            "Gemma3:4b",
            temperature=0,
        )
        print(f"{data=}")

        cls = ContentClass.from_str(data.get("classification", "UNKNOWN"))

        return ExtractedSectionMarkdown(
            source=source,
            content=section_text,
            classification=cls,
            tags={simple_normalize(t) for t in data.get("tags", [])},
            self_contained=data["self_contained"],
        )

    except (json.JSONDecodeError, ValidationError) as e:
        print("Skipping section:", e)
        return None


def process_md(f: Path, min_sect_chars: int) -> list[ExtractedSectionMarkdown]:
    text = f.read_text()
    sects = [s for s in pat_sec.split(text) if len(s) > min_sect_chars]
    print(f"found {len(sects)} sections")
    results: list[ExtractedSectionMarkdown] = []
    for i, s in enumerate(sects):
        print(f"sect {i + 1}/{len(sects)}")

        r = classify_section_llm(s, f.relative_to(INPUT_FOLDER))
        if r is not None:
            results.append(r)

    return results


def main() -> None:
    assert INPUT_FOLDER.exists(), "want to look in an existing folder"
    print("hi")
    files_qmd = INPUT_FOLDER.glob("**/*.qmd")
    # files_qmd = root.glob("**/appendix_d1.qmd")
    if OUT_FILE.exists():
        print("DELETES OLD OUTPUT")
        OUT_FILE.unlink()

    print("found files")
    count = 0
    for f in files_qmd:
        print(f"\n---{f.name}---")
        extracted = process_md(f, min_sect_chars=MIN_SECT_CHARS)
        count += len(extracted)

        io_util.append_ndjson(OUT_FILE, extracted)
        if MAX_SECTIONS and count >= MAX_SECTIONS:
            print(f"Early stop (at {count})")
            break


if __name__ == "__main__":
    main()
