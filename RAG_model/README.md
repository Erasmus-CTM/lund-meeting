# Deployment Instructions (Local macOS + Ollama)

This is the minimal, repeatable path to run the app locally on macOS with Ollama.

## 1) Create and activate a virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 2) Configure LLM + embeddings (Ollama) + Repo directory

You can manually set the variables or use the .env file

```bash
export LLM_API_KEY=ollama
export CHAT_URL=http://localhost:11434/v1/chat/completions
export CHAT_MODEL=llama3.1:8b
export EMBEDDINGS_URL=http://localhost:11434/v1/embeddings
export EMBEDDINGS_MODEL=nomic-embed-text
export LLM_TIMEOUT=300

export NOTES_REPO_DIR="./example_notes"
```

Pull models if needed:
```bash
ollama pull llama3.1:8b
ollama pull nomic-embed-text
```

## 4) Build the vector store
```bash
python -m ingest.ingest
```
This creates `vector_store/index.faiss` and metadata files.

## 5) Run the backend
```bash
FLASK_APP=app.py flask run --port 8000
```

## 6) Verify health
```bash
curl -s http://127.0.0.1:8000/health
```

## 7) Use the API
```bash
curl -s http://127.0.0.1:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is a partial derivative?","extra_mode":"auto","week":2}'
```

Notes:
- If `faiss-cpu` fails to install via pip on macOS, install it with conda instead.
- For local testing with slower Ollama models, increase `LLM_TIMEOUT` substantially.
- For production/systemd deployments, also set `GUNICORN_TIMEOUT` in `/etc/rag.env` or `/etc/rag2.env`; otherwise Gunicorn can still kill the request around 30 seconds.
- if on mac, this can be used to verify gpu usage of ollama:

```bash
sudo powermetrics --samplers gpu_power -i 1000 | \
awk '
/GPU HW active residency:/ {busy=$5}
/GPU Power:/ {
    p=$3; u=$4
    if(u=="mW"){p=p/1000}
    printf "\r%.2f W | %s GPU   ", p, busy
    fflush()
}'
```

# RAG Notes Assistant (Backend)

Flask + Gunicorn backend for a **notes-first** RAG (Retrieval-Augmented Generation) assistant.

- **Pass 1 (notes-first):** retrieve relevant chunks from your course notes (FAISS) and answer primarily from those notes.
- **Pass 2 (optional extra):** add general context *without contradicting* the notes answer.


## What happens when the user clicks **Ask**

1. **User input (browser)**
   - The user enters a question.
   - The user selects `extra_mode` (`never`, `auto`, or `always`).

2. **Frontend sends request**
   - JavaScript sends `POST /ask` with JSON:
     - `question` (string)
     - `extra_mode` (string)
     - (optionally) `include_extra` (boolean, depending on UI)

3. **Nginx reverse proxy**
   - Nginx receives the HTTPS request on `/ask`.
   - It proxies the request to Gunicorn via the Unix socket `unix:/run/rag/rag.sock`.

4. **Gunicorn → Flask**
   - Gunicorn forwards the request to the Flask app.
   - Flask routes it to the `/ask` handler and parses the JSON payload (with defaults).

5. **Retrieve relevant note chunks (RAG retrieval)**
   - The backend calls the embeddings endpoint to embed the user question.
   - FAISS searches the vector index for the top-k most relevant chunks.
   - The backend prepares:
     - `sources[]` (metadata used for citations)
     - `source_blocks` (text snippets injected into the model prompt)

6. **Pass 1: Notes-first answer**
   - The backend calls the chat model with a prompt that prioritizes answering from the retrieved notes.
   - The raw model output is sanitized (e.g. remove `think` traces).
   - Coverage is computed:
     - Prefer `COVERAGE: full|partial|none` if the model provided it
     - Otherwise fall back to a retrieval-based heuristic

7. **Pass 2: Extra context (optional)**
   - If enabled by `extra_mode`:
     - `never`: skip pass 2
     - `always`: always run pass 2
     - `auto`: run pass 2 only if notes coverage is not `full`
   - Pass 2 adds general context without contradicting the notes answer.

8. **Backend returns JSON**
   - Flask returns JSON with:
     - `answer_notes`
     - `answer_extra` (or `null`)
     - `coverage`
     - `sources`

9. **Frontend renders response**
   - The UI displays the notes-based answer first (with citations).
   - If present, the UI shows the extra context section.
   - If MathJax is enabled, the page typesets LaTeX math in the rendered output.


---

## Request flow (Ask button)


```mermaid
flowchart TD
  A["User in browser<br/>types question + chooses extra_mode"] --> B["Frontend JS<br/>POST /ask (JSON)"]
  B --> C["Nginx (HTTPS)<br/>proxy /ask"]
  C --> D["Gunicorn<br/>unix:/run/rag/rag.sock"]
  D --> E["Flask: /ask handler<br/>parse JSON + defaults"]

  E --> F["Embed query<br/>POST /v1/embeddings"]
  F --> G["FAISS vector search<br/>top-k chunks"]
  G --> H["Build source_blocks + sources[]"]

  H --> I["Pass 1: Notes-first prompt<br/>question + retrieved chunks"]
  I --> J["LLM chat completions<br/>POST /v1/chat/completions"]
  J --> K["Sanitize + extract COVERAGE<br/>remove think-tags etc."]
  K --> L["coverage = model_coverage<br/>or retrieval_coverage"]

  L --> M{"Do pass 2?<br/>include_extra & extra_mode"}
  M -->|never| R["Skip extra"]
  M -->|always| N["Pass 2: Extra prompt<br/>question + notes answer"]
  M -->|"auto & coverage!=full"| N

  N --> O["LLM chat completions<br/>POST /v1/chat/completions"]
  O --> P["Sanitize extra<br/>ensure header"]
  R --> Q["Build JSON response<br/>answer_notes, coverage, sources"]
  P --> Q

  Q --> S["Frontend renders<br/>notes + sources + extra (optional)"]
  S --> T["MathJax typeset<br/>(if enabled)"]
```


---

## API

### POST /ask

Request JSON:

    {
      "question": "What is a partial derivative?",
      "extra_mode": "auto"
    }

- `extra_mode`: `"never"` | `"auto"` | `"always"`

Response JSON (shape):

    {
      "answer_notes": "…",
      "answer_extra": "… or null",
      "coverage": "full|partial|none",
      "sources": [
        {
          "tag": "[S1]",
          "source": "_includes/module2/m2_2.md",
          "chunk_id": 74,
          "score": 0.744
        }
      ]
    }

### GET /health

Returns:

    {"status":"ok"}

---

## Notes

- The FAISS index + metadata live under `vector_store/` (generated by the ingest pipeline).
- Typical deployment: **Nginx → Gunicorn (Unix socket) → Flask**.
