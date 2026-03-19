"""Evaluate each run."""

import sys
from pathlib import Path

sys.path.append(".")

from ai_eval import judges
from ai_eval.eval_datamodels import EvalCase, EvalTrace, FloatTraceMetric
from material_prep import io_util

judge_sys_prompt = Path("ai_eval/prompts/judge_qa_sys.txt").read_text()
judge_msg_template = Path("ai_eval/prompts/judge_qa_msg.txt").read_text()

DATASET_NAME = "general_qa_python"
JUDGES: list[judges.Judge] = [
    judges.IsConcise(),
    judges.HumanRatingJudge(),
    # judges.LLMJudge(
    #     "gemma3:1b-it-qat",
    #     judge_sys_prompt,
    #     judge_msg_template,
    #     name="llm_rating_mini",
    # ),
    judges.LLMJudge("rnj-1:8b", judge_sys_prompt, judge_msg_template),
]


def compute_run_metrics() -> None:
    """Compute metrics for each run."""
    # load runs and dataset
    traces_file = Path(f"./tmp/traces/{DATASET_NAME}.ndjson")
    data_file = Path(f"./ai_eval/data/{DATASET_NAME}.json")
    traces = io_util.load_ndjson_generic(traces_file, EvalTrace)
    examples_by_id = {e.example_id: e for e in io_util.load_qas_list_json(data_file)}
    print(f"loaded {len(traces)} runs, {len(examples_by_id)} examples")

    # where to store results
    metrics_file = Path(f"./tmp/metrics/{DATASET_NAME}.ndjson")
    metrics_file.parent.mkdir(exist_ok=True)

    # avoid recomputing done results
    done_metrics: set[tuple[str, str, str]] = (
        {
            m.fingerprint
            for m in io_util.load_ndjson_generic(metrics_file, FloatTraceMetric)
        }
        if metrics_file.exists()
        else set()
    )

    for judge in JUDGES:
        print(f" --- Judge: {judge.name} ---")
        for i, trace in enumerate(traces):
            fingerprint = (trace.run_id, trace.example_id, judge.name)
            if fingerprint in done_metrics:
                print(f"ALREADY DONE {fingerprint}")
                continue
            print(f"{i + 1:3d}/{len(traces)} -> {fingerprint}")
            case = EvalCase(trace, examples_by_id[trace.example_id])

            io_util.append_ndjson(metrics_file, [judge.evaluate(case)])


if __name__ == "__main__":
    compute_run_metrics()
