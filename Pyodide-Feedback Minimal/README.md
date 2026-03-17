# Pyodide Quarto Minimal

This is a minimal Quarto project showcasing Python code execution directly in the browser using Pyodide, aswell as some added AI-Feedback so that users can use AI to fix Coding mistakes they may have made.

The base of this Extension is not written by us and can be found [here](https://github.com/coatless-quarto/pyodide) it will not have the AI-Feedback part though, that has been written by us. You can find the Changed Files in this Repo if you want use it just download and copy and paste it. 

## Requirements

- **Quarto** https://quarto.org/docs/get-started/
- **Text editor** (VS Code, RStudio, JupyterLab, etc.)
- **API-Key** You need an API Key, plus the Base-URL of the Page you are using.

## Setup

### 1. Create a Quarto Website Project

> If in VS Code, go to New File
> -> Quarto Project
> -> Website

Or Create the Files yourself.

### 2. Add Pyodide Extension

```bash
quarto add coatless-quarto/pyodide
```

### 3. Write Python Code in .qmd Files


````markdown
```{python}
import numpy as np
result = [i**2 for i in range(5)]
print(result)
```
````

Code runs directly in the browser—no server needed!

### 4. Ask for Feedback 

You can press the Button "Feedback" and after a short while there will be a AI written Feedback to your Code, for a better Example try adding failures and see how the AI helps you to fix that.

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
quarto render       # Build for production
quarto preview      # Test locally
```

Result in `_site/` folder → Deploy to GitHub Pages, Netlify, Vercel, etc.

## Resources

- [Quarto](https://quarto.org)
- [Pyodide Quarto Extension](https://github.com/coatless-quarto/pyodide)
- [Pyodide](https://pyodide.org)
