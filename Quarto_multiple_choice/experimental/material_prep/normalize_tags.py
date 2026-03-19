"""
When LLMs are free to pick tags, we get some that are very similar
(e.g. 'floating point' & 'floating-point').

Can we use heuristics (and more AI?) to normalize the tags?
"""

import re
from collections.abc import Iterable


def simple_normalize(tag: str) -> str:
    return re.sub(r"[ _,.]", "-", tag.lower().strip())


def tag_map_heuristic(tags_og: Iterable[str]) -> dict[str, str]:
    # first, simple cleanup
    # lowercase, space free
    return {t: simple_normalize(t) for t in tags_og}
