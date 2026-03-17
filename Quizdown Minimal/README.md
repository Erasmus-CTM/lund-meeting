# Quizdown Minimal

A minimal Quarto project showcasing interactive quizzes created with the Quizdown extension.

The Quizdown extension was not written by us, but rather made by the community and can be found [here](https://github.com/parmsam/quarto-quizdown).

## Requirements

- **Quarto**  https://quarto.org/docs/get-started/
- **Text editor** (VS Code, RStudio, JupyterLab, etc.)

## Setup

### 1. Create a Quarto Website Project

> If in VS Code, go to New File
> -> Quarto Project
> -> Website

Or Create the Files yourself.

### 2. Add Quizdown Extension

```bash
quarto add parmsam/quarto-quizdown
```

### 3. Write Quizzes in .qmd Files

Add the `quizdown` filter to your document and create quizzes:

````markdown
---
title: "My Quiz"
filters:
  - quizdown
---

```quizdown
# Question Title

Your question text here.

- [x] Correct answer
- [ ] Incorrect answer
- [ ] Another incorrect answer

> Hint or explanation text.
```
````

Quizzes render interactively in the browser—no server needed!

## Project Structure

```
.
├── _quarto.yml
├── index.qmd
├── README.md
├── _extensions/
│   └── parmsam/
│       └── quizdown/
└── _site/
    └── (rendered output)
```

## Quiz Format Guide

Quizdown supports multiple question types. Here's how to create each:

### Multiple Choice 

Multiple answers can be selected. Use `-` for bullet-style options.

```quizdown
# Which of these are programming languages?

- [x] Python
- [x] JavaScript
- [ ] HTML
- [x] Java

> Hint: HTML is a markup language, not a programming language.
```

### Single Choice 

Only one answer can be selected. Use `1.`, `2.`, etc. for numbered options.

```quizdown
# What is the capital of France?

1. [ ] London
1. [ ] Berlin
1. [x] Paris
1. [ ] Rome

> Paris is located on the Seine River.
```

### Sequence 

Put items in the correct order. Use numbered items without brackets.

```quizdown
# Put the planets in order from closest to farthest from the Sun.

1. Mercury
2. Venus
3. Earth
4. Mars
5. Jupiter

> The asteroid belt separates the inner and outer planets.
```

## Enhanced Features

**Code blocks, LaTeX formulas, and images** can be embedded directly in Quizdown questions just like anywhere else in Markdown:

- Use ` ~~~python` (or any language) for code snippets
- Use `$...$` for inline math and `$$...$$` for display math
- Use `![alt text](path/to/image.jpg)` for images

All these elements work seamlessly within quiz blocks!

## Tips

- **Hints**: Use `> text` to add hints or explanations
- **Multiple quizzes**: You can have multiple quiz blocks in one document
- **Feedback**: Hints appear when the quiz is submitted

## Preview & Deploy

```bash
quarto preview      # Test locally
quarto render       # Build for production
```

Result in `_site/` folder → Deploy to GitHub Pages, Netlify, Vercel, etc.

## Resources

- [Quarto](https://quarto.org)
- [Quizdown Extension](https://github.com/parmsam/quarto-quizdown)
