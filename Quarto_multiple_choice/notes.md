# py activity ai

This repo contains a few things

- Quarto extension (`py-activity-quarto`) for interactive "activities"
  - Depends the browser runtime (`runtime`) 
- Experimental things:
  - Course material preparation
  - AI evaluation 

Below follows some random notes abourt 

## Interactive Activities

- Interactive python-based **activities** (for example code/choice-exercises)
- Browser runtime. Features include AI-integration.
- Maybe allow hooking into an extension like quarto-live or coatless-pyodide
  - If depending on another extension: stick to public apis, document deps, provide fallback, use our own pandoc filters

How to author?

- Quarto extension with minimal "extra-markup"
- Suggestion: classic `# | key:value` directives
- Multiple choice inspired by quizdown

Exercise AI

- Ai feedback provider is separate from ui code.
- "Works" with local models
- Sends requests to any OpenAI-compatible provider (Ollama/own server/external)

### TODO 

- Code editor (Monaco?). just that or use pyodide extension's setup.

### Known Issues

- titles inside activity? If there is a H2 inside an activity, quarto replaces div with section. Maybe thats fine, but migth be problematic for styling
- be careful to avoid double quoting in config directives

## Course material preparation

- Processing course material to allow customized RAG.
- Can also be used for automatic tagging, segment extraction, etc.
- This material can be used as context to AI (with or without vector-retrieval), or provided to students in specific UIs.

## AI evaluation

- Before deploying AI powered material to students, we should investigate its performance.
- Simple QA-style dataset.
- Separate RAG-specific metrics (todo?)

## Additional ideas

- Allow bundling pyodide? incase one wants to use it in a lockdown-exam with blocked jsdelivr...
- Use the new "responses" API?
- Streaming would be nice, but maybe tricky and expensive?
- Progress storage (IndexDB?)
  - stable activity ids! hashed content?
- Richer multiple choice? hook into quizdown extension?