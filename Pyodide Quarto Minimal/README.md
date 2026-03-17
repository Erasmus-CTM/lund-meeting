# Pyodide Quarto Minimal

This is a minimal Quarto project showcasing Python code execution directly in the browser using Pyodide and Quarto.

The Extension was not written by us, but rather made by the Community and can be found [here](https://github.com/coatless-quarto/pyodide).

## Requirements

- **Quarto**  https://quarto.org/docs/get-started/
- **Text editor** (VS Code, RStudio, JupyterLab, etc.)

## Setup

### 1. Create a Quarto Website Project

```bash
mkdir my-quarto-project
cd my-quarto-project
quarto create-project website
```

### 2. Add Pyodide Extension

```bash
quarto add coatless-quarto/pyodide
```

### 3. Write Python Code in .qmd Files

```markdown
---
title: "My Example"
---

```{python}
import numpy as np
result = [i**2 for i in range(5)]
print(result)
```
```

Code runs directly in the browser—no server needed!

## Project Structure

```
.
├── _quarto.yml
├── index.qmd
├── about.qmd
├── styles.css
└── _extensions/coatless-quarto/pyodide/
```

## Preview & Deploy

```bash
quarto preview      # Test locally
quarto render       # Build for production
```

Result in `_site/` folder → Deploy to GitHub Pages, Netlify, Vercel, etc.

## Resources

- [Quarto](https://quarto.org)
- [Pyodide Quarto Extension](https://github.com/coatless-quarto/pyodide)
- [Pyodide](https://pyodide.org)
