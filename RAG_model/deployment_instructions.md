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
