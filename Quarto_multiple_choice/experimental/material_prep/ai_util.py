import json

from openai import OpenAI

from material_prep import io_util


def request_json(
    client: OpenAI,
    prompt: str,
    model: str,
    temperature: float = 0,
) -> dict[str, object]:
    """Request a json response."""

    response = client.chat.completions.create(
        model=model,
        temperature=temperature,
        messages=[{"role": "user", "content": prompt}],
    )

    content = response.choices[0].message.content
    assert content is not None

    raw = io_util.clean_json(content)
    data = json.loads(raw)
    assert isinstance(data, dict), "expects dicts for now"

    return data
