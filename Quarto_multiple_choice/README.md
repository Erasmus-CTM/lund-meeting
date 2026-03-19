# Py-activity Extension For Quarto

This is a quarto extension. It processes "activities".

Currently it:

- Parses attributes in the format `# | key:value`.
- for code-blocks with `# | activity:...` it renders some HTML
- injects JS and CSS

## Example

Here is the source code for a minimal example: [example.qmd](example.qmd).

## Usage

First, compile the typescript-project in `runtime` (requires installing node.js).

```bash
cd runtime
npm install
npm run build

# manually copy some html-snippet for quarto to use
cp ai_settings.html ../py-activity-quarto/_extensions/py-activity/assets/

```

Files in `_extensions/py-activity/assets/runtime` should be generated.

Second, preview the example

```bash
cd py-activity-quarto
quarto preview py-act-example.qmd
```

## Testing

There is some sort of unit-test. Runnable like:

```bash
cd py-activity-quarto # to make the import work...
quarto pandoc lua _extensions/py-activity/test.lua # bundled lua
```
