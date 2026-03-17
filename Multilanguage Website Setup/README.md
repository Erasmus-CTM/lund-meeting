# Multilingual Website Setup

This Setup will allow you to run a multilanguage Website with Quarto. 
As it's not an implemented feature of Quarto so far we will have to use a little trick to make it work neatly.

## Quick Start

If you just want to get a result fast, use the Python Script it will render all languages, add a Button to switch in between languages and finnaly open a local server at `http://localhost:8000/en/` and a browser with the site opened on the local server.

```bash
python build_multilingual_site.py
```

---

## Project Structure

```
├── _quarto.yml                    # Base config (shared)
├── _quarto-english.yml            # English profile → _site/en/
├── _quarto-deutsch.yml            # German profile → _site/de/
├── _quarto-swedish.yml            # Swedish profile → _site/sv/
├── _quarto-danish.yml             # Danish profile → _site/da/
├── _quarto-norwegian.yml          # Norwegian profile → _site/no/
├── build_multilingual_site.py     # Automation script
├── Testkapitel.qmd                # Content
├── Zusammenfassung.qmd            # Content
└── _site/                         # Generated output (all language variants)
```

---

## Overview: How the System Works

### 1. The Core Concept: Quarto Profiles

This project uses **Quarto profiles** to render the same content in multiple languages.

**Base Configuration (`_quarto.yml`)**
- Contains shared settings for all languages (appearance, fonts, structure, etc.)

**Language-Specific Profiles (`_quarto-[language].yml`)**
- Each profile **extends** the base configuration
- Defines a **unique output directory** where that language's HTML will be generated
- Sets language-specific metadata (navigation labels, HTML `lang` attribute, etc.)

**Example:** The `_quarto-english.yml` file specifies:
```yaml
project:
  output-dir: "_site/en"    # English renders here
language: en                 # Language metadata
```

Similarly, `_quarto-deutsch.yml` specifies `output-dir: "_site/de"`, and so on for each language.

### 2. The Content: Shared `.qmd` Files

The files `Testkapitel.qmd` and `Zusammenfassung.qmd` are the **same source files** used for all languages. Each time you render with a different profile, Quarto uses the same `.qmd` files but outputs them with the language-specific configuration from that profile.

### 3. The Result: Separate Language Websites

When rendered, you get 5 independent, complete websites:
```
_site/en/   → English website
_site/de/   → German website  
_site/sv/   → Swedish website
_site/da/   → Danish website
_site/no/   → Norwegian website
```

Each contains the same pages and structure, but with language-specific metadata and navigation.

---

## Manual Rendering (What Happens Behind the Scenes)

To build the multilingual website **without the Python script**, you would run:

```bash
quarto render --profile english
quarto render --profile deutsch
quarto render --profile swedish
quarto render --profile danish
quarto render --profile norwegian
```

Each command:
1. Takes the same `.qmd` source files
2. Applies the language-specific profile configuration
3. Outputs the rendered HTML to that language's directory

After running all 5 commands, you'd have 5 complete websites in `_site/`.

---

## The Challenge: Language Switching

Simply having 5 separate websites isn't enough for a good user experience. Users need to:
- Switch languages from **any page** (not just the homepage)
- Stay on the **same page**, just in a different language
- Navigate intuitively between languages

Without additional work, there's no way for users to switch from `_site/en/Testkapitel.html` to `_site/de/Testkapitel.html`. They'd have to manually type the URL.

---

## What the Python Script Does

The `build_multilingual_site.py` script automates the entire process and solves the language-switching problem:

### Step 1: Render All Profiles Automatically

```python
for profile in ["english", "deutsch", "swedish", "danish", "norwegian"]:
    subprocess.run(["quarto", "render", "--profile", profile])
```

Instead of manually running 5 commands, the script runs them all for you. You get all 5 languages built in one go.

### Step 2: Inject a Language Dropdown Into Every Page

After rendering, the script:
1. **Scans all `.html` files** in every language folder
2. **Finds the navigation bar** in each page
3. **Replaces it** with an enhanced navbar that includes a language dropdown menu

The dropdown appears on every page and lists all 5 languages.

### Step 3: Make Language Switching Smart

The key part: each language link in the dropdown uses a **regex pattern** to swap the language code in the URL:

```javascript
onclick="window.location.href = window.location.href.replace(/\/(en|de|sv|da|no)\//,'/de/')"
```

**How it works:**
- User is on: `http://localhost:8000/en/Testkapitel.html`
- They click "Deutsch"
- The regex finds `/en/` in the URL and replaces it with `/de/`
- They're now on: `http://localhost:8000/de/Testkapitel.html` (same page, different language!)

This works for **any page** - users can switch languages and stay exactly on the site they were on before.

### Step 4: Start a Preview Server

The script starts a local HTTP server on port 8000
- Opens your browser automatically
- Allows you to test language switching immediately aswell as preview the website


---

## Requirements

- Python 3.7+
- Quarto (installed and in PATH): `quarto --version`
- BeautifulSoup4: `pip install beautifulsoup4`

---

## Adding a New Language

### Step 1: Create a New Profile

Copy an existing profile as template (they're all identical except for the output directory):

```bash
cp _quarto-english.yml _quarto-spanish.yml
```

Edit `_quarto-spanish.yml` and update the output directory:

```yaml
project:
  output-dir: "_site/es"
```

(The rest of the profile content remains the same)

### Step 2: Update the Main Configuration

Add your new language to the profiles section in `_quarto.yml`:

```yaml
profiles:
  spanish:
    extends: _defaults
```

### Step 3: Add to the Build Script

In `build_multilingual_site.py`, update the profiles list:

```python
profiles = ["english", "deutsch", "swedish", "danish", "norwegian", "spanish"]
```

Also update the regex pattern that detects language codes in the dropdown:

```javascript
/\/(en|de|sv|da|no|es)\//  # Add 'es' for Spanish
```

### Step 4: Handle Translated Content (Optional)

If you have content that should only appear in specific languages, use Quarto's content visibility syntax in your `.qmd` files:

```markdown
::: {.content-visible when="profile == 'spanish'"}
Este contenido solo aparece en la versión en español.
:::

::: {.content-visible when="profile != 'spanish'"}
This content appears in all languages except Spanish.
:::
```

This allows you to have language-specific sections within the same source files.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Quarto not found" | Install Quarto or add it to your system PATH |
| "Port 8000 already in use" | Change the PORT variable in `build_multilingual_site.py` |
| No language dropdown appearing | Verify pages have `<ul class="navbar-nav navbar-nav-scroll ms-auto">` navbar |

---

## Deployment

Upload the entire `_site/` directory to your web server. All language variants are included and fully independent.

Or Use Github Pages