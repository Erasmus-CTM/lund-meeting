from typing import Literal

from plotly.graph_objs.layout import yaxis
import polars as pl
from plotly import express as px
from plotly import graph_objects as go
from plotly import io as pio

# Which columns do we want to plot? For editor completion convenience.
type PlotCol = Literal["human_rating", "llm_rating", "latency_ms", "ans_length"]

# Convenient plot titles
TITLES: dict[tuple[PlotCol, ...], str] = {
    ("latency_ms", "human_rating"): "latency-performance tradeoff",
    ("latency_ms", "llm_rating"): "latency-performance tradeoff",
    ("ans_length", "latency_ms"): "Time per character",
}


def set_template() -> None:

    t = pio.templates["plotly_dark"]
    t.update(
        layout={"font_family": "Comic Mono", "width": 600, "autosize": False},
    )
    pio.templates.default = t


def rating_correlation(df_wide: pl.DataFrame) -> go.Figure:
    return (
        px.scatter(
            df_wide,
            y="llm_rating",
            x="human_rating",
            color="model",
            hover_data="answer",
            trendline="ols",
            trendline_scope="overall",
        )
        .update_layout(
            title="Rating correlation",
        )
        .update_traces(marker_size=10, opacity=0.8)
    )


def group_scatter(
    df_wide: pl.DataFrame,
    x: PlotCol,
    y: PlotCol,
    trendline: bool = False,
) -> go.Figure:
    return (
        px.scatter(
            df_wide,
            y=y,
            x=x,
            color="model_spec",
            trendline="ols" if trendline else None,
        )
        .update_layout(
            title=TITLES.get((x, y), "title"),
        )
        .update_traces(
            marker_size=10,
        )
    )


def agg_mean_scatter(
    df_wide: pl.DataFrame,
    y: PlotCol,
    y_range: tuple[float, float] = (0, 1),
    trendline: bool = False,
) -> go.Figure:
    return (
        px.scatter(
            df_wide.group_by("model_spec")
            .agg(
                pl.col(y).mean(),
                pl.col("model_size").mean(),
            )
            .sort("model_spec"),
            x="model_size",
            y=y,
            color="model_spec",
            trendline="ols" if trendline else None,
        )
        .update_layout(
            yaxis_title=f"Average {y}",
            yaxis_range=y_range,
            xaxis_title="Model size (M)",
            title=f"Average {y}",
        )
        .update_traces(
            marker_size=15,
        )
    )
