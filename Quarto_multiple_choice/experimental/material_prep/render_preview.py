import html
import subprocess
import sys
from pathlib import Path

sys.path.append(".")

from material_prep import io_util
from material_prep.datamodels import ExtractedSectionMarkdown, QaQuestion

INPUT_FILE_SECTIONS = Path("./tmp/extracted_sections.ndjson")
OUTPUT_FILE_SECTIONS = Path("./tmp/sections_overview.html")

INPUT_FILE_QA = Path("./tmp/gen_qa.ndjson")
OUTPUT_FILE_QA = Path("./tmp/qa_overview.html")


def html_scaffold(title: str, content: str) -> str:

    style = """body {
    font-family: monospace;
    background: #f5f5f5;
}
.section {
    background: white;
    padding: 16px;
    margin: 20px;
    border-radius: 8px;
    box-shadow: 0 0 5px rgba(0,0,0,0.1);
    max-width: 900px;
}
.meta {
    margin-bottom: 10px;
}
.badge {
    display: inline-block;
    padding: 4px 8px;
    margin-right: 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    color: white;
}
.PROSE { background: #3b82f6; }
.EXAMPLE { background: #10b981; }
.EXERCISE { background: #f59e0b; }
.UNKNOWN { background: #6b7280; }
.tag {
    display: inline-block;
    background: #e5e7eb;
    padding: 2px 6px;
    margin-right: 4px;
    border-radius: 4px;
    font-size: 11px;
}
pre {
    white-space: pre-wrap;
    word-wrap: break-word;
}"""

    return f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{title}</title>
<style>
{style}
</style>
</head>
<body>
<h1>{title}</h1>
{content}
</body></html>
"""


def render_section_preview(records: list[ExtractedSectionMarkdown]) -> str:
    """Quick and dirty html."""
    parts = []

    for r in records:
        safe_content = html.escape(r.content)
        classification = r.classification.name
        tags_html = "".join(
            f'<span class="tag">{html.escape(tag)}</span>' for tag in sorted(r.tags)
        )

        parts.append(f"""
<div class="section">
    <div class="meta">
        <span class="badge {classification}">{classification}</span>
        {tags_html}
        <div style="margin-top:5px; font-size: 12px; color: #555;">
            Source: {html.escape(str(r.source))}
        </div>
        <div>
            {"self-contained" if r.self_contained else "NOT self-contained"}
        </div>
    </div>
    <pre>{safe_content}</pre>
</div>
""")

    return html_scaffold("Section preview", "\n".join(parts))


def render_qa_preview(records: list[QaQuestion]) -> str:
    """Quick and dirty html."""
    parts = []

    for r in records:
        parts.append(f"""
<div class="section">
    <div class="meta">
        <div style="margin-top:5px; font-size: 12px; color: #555;">
            Answer source: {html.escape(str(r.source))}
        </div>

    </div>
    <pre><b>Context</b>
{html.escape(r.context)}</pre>
    <pre><b>Q</b>
{html.escape(r.question)}</pre>
    <pre><b>A</b>
{html.escape(r.answer)}</pre>
</div>
""")  # noqa: PERF401

    return html_scaffold("QA preview", "\n".join(parts))


def render_save_sections() -> None:
    OUTPUT_FILE_SECTIONS.write_text(
        render_section_preview(io_util.load_extracted_sections(INPUT_FILE_SECTIONS)),
        encoding="utf-8",
    )
    print(f"Wrote {OUTPUT_FILE_SECTIONS}")


def render_save_qa() -> None:
    OUTPUT_FILE_QA.write_text(
        render_qa_preview(io_util.load_qas_ndjson(INPUT_FILE_QA)),
        encoding="utf-8",
    )
    print(f"Wrote {OUTPUT_FILE_QA}")


if __name__ == "__main__":
    render_save_sections()
    render_save_qa()

    subprocess.run(
        ["chromium", str(OUTPUT_FILE_SECTIONS), str(OUTPUT_FILE_QA)],
        check=False,
    )
