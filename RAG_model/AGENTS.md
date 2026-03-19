# Agent Instructions

Guidelines for AI agents working with this RAG Notes Assistant codebase.

## Project Overview

Flask-based RAG (Retrieval-Augmented Generation) assistant for course notes. Uses FAISS for vector search and OpenAI-compatible LLM APIs for embeddings and chat completions.

**Key Components:**
- `app.py`: Flask API with `/ask` and `/health` endpoints
- `config.py`: Environment-based configuration with validation
- `rag/`: Retrieval and LLM modules
- `ingest/`: Pipeline for processing notes (PDF, Markdown, Quarto) into FAISS index

## Build/Lint/Test Commands

```bash
# Setup (run first)
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run the app (development)
python app.py                    # Flask dev server on port 5000

# Run with Gunicorn (production-style)
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app

# Lint and format (ruff)
ruff check .                     # Check all files
ruff check --fix .               # Auto-fix issues
ruff format .                    # Format all files
ruff format --check .            # Check formatting without changes

# Run a single file through ruff
ruff check app.py
ruff format app.py

# Type checking (if mypy is installed)
mypy app.py config.py

# Run ingestion pipeline
python -m ingest.ingest          # Processes notes into vector_store/
```

**Note:** No test suite currently exists. When adding tests, use pytest:
```bash
# Single test file
pytest tests/test_example.py -v

# Single test function
pytest tests/test_example.py::test_function_name -v
```

## Code Style Guidelines

### Imports
- **Order**: stdlib → third-party → local
- Group with a single blank line between sections
- Prefer explicit imports over `from module import *`

```python
import json
import os
from pathlib import Path

import numpy as np
import faiss
from flask import Flask

from config import Config
from rag.retriever import Retriever
```

### Formatting
- Use **ruff** for linting and formatting (replaces black/flake8)
- Line length: 88 characters (ruff default, matches black)
- Double quotes for strings
- Trailing commas in multi-line collections

### Naming Conventions
- `snake_case`: functions, variables, module names
- `PascalCase`: classes
- `UPPER_SNAKE_CASE`: constants, module-level settings
- `_leading_underscore`: private/internal functions

### Type Hints
- Use Python 3.10+ union syntax: `str | None`, `list[int]`
- Function signatures should include return types
- Use `from __future__ import annotations` if needed for forward references

```python
def process_data(items: list[str], limit: int | None = None) -> dict[str, Any]:
    ...
```

### Error Handling
- Use specific exceptions: `RuntimeError`, `ValueError`, `KeyError`
- Configuration errors should raise `RuntimeError` with descriptive messages
- HTTP errors: check status codes and raise with context

```python
if r.status_code >= 400:
    raise RuntimeError(f"Request failed {r.status_code}: {r.text[:2000]}")
```

### Documentation
- Docstrings for modules, classes, and public functions
- Google-style or plain text (current codebase uses plain)
- Keep docstrings concise; explain "why" not just "what"

```python
def sanitize_llm_text(s: str) -> str:
    """
    Removes chain-of-thought tags and cleans up common truncated endings.
    Keeps LaTeX intact.
    """
```

### Logging
- Use `logging` module, not print statements (except in CLI scripts like ingest)
- In Flask routes: `app.logger.info()`
- In other modules: `logging.getLogger("gunicorn.error")` or module-level logger

### Configuration
- Environment variables in `config.py` via `os.getenv()`
- Provide defaults where sensible
- Validate required vars in `Config.validate()`
- Use helper functions: `_env_int()`, `_env_float()`, `_env_str()`

### Flask Patterns
- Use route decorators with HTTP methods: `@app.get()`, `@app.post()`
- Return `jsonify()` for JSON responses
- Include appropriate HTTP status codes
- Input validation: check for missing/invalid fields, return 400 errors

```python
@app.post("/ask")
def ask():
    data = request.get_json(force=True) or {}
    q = (data.get("question") or "").strip()
    if not q:
        return jsonify(error="Missing 'question'"), 400
```

## Environment Setup

Create `.env` file (see `.env.example`):

```bash
# Required
CHAT_URL=https://api.openai.com/v1/chat/completions
CHAT_MODEL=gpt-4o
EMBEDDINGS_URL=https://api.openai.com/v1/embeddings
EMBEDDINGS_MODEL=text-embedding-3-small
LLM_API_KEY=sk-...
NOTES_REPO_DIR=/path/to/notes

# Optional (have defaults)
VECTOR_DB_PATH=./vector_store
DEBUG=false
RAG_TOP_K_DEFAULT=3
```

## Common Tasks

**Add new endpoint:**
1. Add route in `app.py`
2. Return JSON with appropriate status codes
3. Add input validation

**Modify ingestion:**
1. Edit files in `ingest/`
2. Run `python -m ingest.ingest` to rebuild index
3. Check `vector_store/` output

**Update configuration:**
1. Add env var to `.env.example`
2. Add to `config.py` class with default
3. Add to `validate()` if required
4. Update `rag/settings.py` if RAG-specific

## File Organization

```
app.py              # Flask application entry point
config.py           # Configuration management
requirements.txt    # Dependencies
rag/                # Retrieval and LLM logic
  __init__.py
  llm.py            # Chat completions API
  retriever.py      # FAISS search
  settings.py       # RAG-specific settings
ingest/             # Document processing pipeline
  chunker.py        # Markdown chunking
  embed.py          # Embedding API calls
  ingest.py         # Main ingestion script
  pdfer.py          # PDF to markdown conversion
ops/                # Deployment scripts and nginx config
```

## Important Notes

- This is Python 3.14+ (uses modern union syntax `str | None`)
- FAISS index + metadata stored in `vector_store/` (gitignored)
- No tests exist currently—add pytest if implementing tests
- ruff cache in `.ruff_cache/` (gitignored)
- Never commit `.env` or API keys
- Document uploads only support PDF; served via `/docs/<filename>`
