"""V2 pipeline configuration (Romance-Factory generator_v2).

See Linear THE-144 / World Builder — requirements 1.4, 9.4, 11.15.
"""

from __future__ import annotations

from dataclasses import dataclass

_COMPLEX_FIELDS: frozenset[str] = frozenset(
    {
        "world_setting_catalog",
    }
)


@dataclass
class V2Config:
    """Configuration loaded for the generator_v2 pipeline."""

    genre: str | None = None
    world: str | None = None

    # --- Complex structures (large JSON / nested maps; merge & validation aware) ---
    world_setting_catalog: dict | None = None

    # --- Agent retrieval: top_k limits ---
    retrieval_top_k_world: int = 3


__all__ = ["V2Config", "_COMPLEX_FIELDS"]
