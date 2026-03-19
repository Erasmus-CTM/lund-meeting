-- Fail early if wrong format
if not quarto.doc.is_format("html") then
    error("Only HTML works!")
end
assert(quarto.doc.is_format("html"), "Only HTML works!")

local choice = require("_extensions.py-activity.choice")

-- Count and index activities
local act_count = 0


--- Extract attributes (# | key:value) from code text
--- @param text string
--- @return table config, string code
local function parse_config(text)
    local config = {}
    local code_lines = {}

    -- Iterate over lines
    for line in text:gmatch("([^\r\n]*)[\r\n]?") do
        -- Is this line an attribute?
        local key, value = line:match("^#|%s*(%S-)%s*:%s*(.-)%s*$")
        if key and value then
            config[key] = value
        else
            table.insert(code_lines, line) -- normal code line
        end
    end

    return config, table.concat(code_lines, "\n")
end

--- Load defaults from yaml
--- @return table
local function load_default_options()
    -- load
    f = io.open("./_extensions/py-activity/defaults.json", "r")
    local defaults = quarto.json.decode(f:read("a"))
    f:close()
    assert(type(defaults), "table")
    return defaults
end

--- Extract document content for AI context
--- @param doc pandoc.Pandoc
--- @return string
local function extract_document_content(doc)
    local content_parts = {}
    
    -- Walk through the document and extract text
    for _, block in ipairs(doc.blocks) do
        -- Skip code blocks (we don't want to include Python code in the context)
        if block.t ~= "CodeBlock" then
            local text = pandoc.utils.stringify(block)
            if text and text ~= "" then
                table.insert(content_parts, text)
            end
        end
    end
    
    return table.concat(content_parts, "\n\n")
end

--- Render a code exercise block
---@param config table
---@param code string
---@param act_id integer
---@return pandoc.Div activity_element
function render_code_exercise(config, code, act_id)
    return pandoc.Div(
        {
            pandoc.RawBlock("html",
                '<textarea class="activity-editor">' .. code .. '</textarea>'
            ),
            pandoc.Para({
                pandoc.RawInline("html", '<button class="submit">Run</button>')
            }),
            ---@diagnostic disable-next-line: missing-fields
            pandoc.Div({}, { class = "output-box" }),
        },
        -- seems to work??
        ---@diagnostic disable-next-line: missing-fields
        {
            class = "activity",
            ["data-act-id"] = tostring(act_id),
            ["data-act-type"] = "code",
            ["data-config"] = quarto.json.encode(config), -- make config accessible in runtime?
        }
    -- TODO: Maybe flatten the config to plain data rather than json?
    -- or at least ensure it is only one level deep, for simpler parse/hydrate
    )
end

-- Main entry ??
function CodeBlock(el)
    local config, code = parse_config(el.text)

    -- for printing and inserting in data-attribute
    local attrs_json = quarto.json.encode(config)

    -- Only process codeblocks with specified activity
    if not config["activity"] then
        quarto.log.output("skip codeblock (attrs=" .. attrs_json .. ")")
        return nil
    end
    quarto.log.output("processing activity " .. act_count .. " (attrs=" .. attrs_json .. ")")

    act_count = act_count + 1

    -- Build output
    return render_code_exercise(config, code, act_count);
end

-- Main entry ??
function Div(div)
    if div.classes[1] == "activity-choice" then
        local act = choice.parse_choice_activity(div)
        quarto.log.output("processing activity " .. act_count)

        act_count = act_count + 1

        return choice.render_choice_activity(act, act_count)
    end
end

-- HTML for AI settings form
local AI_SETTINGS_FORM_HTML = [[
<div class="callout callout-note" style="margin-bottom: 1.5em;">
<div class="callout-header" onclick="this.parentElement.classList.toggle('callout-collapsed')" style="cursor: pointer; display: flex; align-items: center; gap: 0.5em;">
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
<strong>AI Assistant Setup</strong>
<span style="margin-left: auto; font-size: 0.85em;">(click to expand)</span>
</div>
<div class="callout-body">
<p>Get your free API key from <a href="https://openrouter.ai/keys" target="_blank">OpenRouter</a> to enable AI assistance.</p>
<form id="ai-settings-form" class="ai-settings">
<div class="form-group">
<label for="baseUrl">Provider URL:</label>
<input type="url" id="baseUrl" name="baseUrl" value="https://openrouter.ai/api/v1" required>
</div>
<div class="form-group">
<label for="apiKey">API Key:</label>
<input type="password" id="apiKey" name="apiKey" placeholder="sk-or-v1-..." required>
<small>Your key is stored locally in your browser only.</small>
</div>
<div class="form-group">
<label for="model">Model:</label>
<input type="text" id="model" name="model" value="openai/gpt-4o-mini" required>
<small>See available models at <a href="https://openrouter.ai/models" target="_blank">openrouter.ai/models</a></small>
</div>
<div class="form-actions">
<button type="submit" class="btn-primary">Save Settings</button>
<button type="button" id="test-connection" class="btn-secondary">Test Connection</button>
</div>
<div id="connection-status" class="status-message" style="display: none; margin-top: 1em; padding: 0.75em; border-radius: 4px;"></div>
</form>
</div>
</div>
<style>
.callout-collapsed .callout-body { display: none; }
.ai-settings { max-width: 500px; }
.ai-settings .form-group { margin-bottom: 16px; }
.ai-settings label { display: block; font-weight: 600; margin-bottom: 4px; }
.ai-settings input { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
.ai-settings small { display: block; color: #666; margin-top: 4px; font-size: 12px; }
.ai-settings .form-actions { display: flex; gap: 8px; margin-top: 16px; }
.ai-settings button { padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; border: none; }
.ai-settings .btn-primary { background: #2563eb; color: white; }
.ai-settings .btn-primary:hover { background: #1d4ed8; }
.ai-settings .btn-secondary { background: #f3f4f6; color: #333; border: 1px solid #d1d5db; }
.ai-settings .btn-secondary:hover { background: #e5e7eb; }
.status-message.success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
.status-message.error { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
</style>
]]

function Pandoc(doc)
    local options = load_default_options()
    quarto.log.output("\nDefault options", options)

    -- Extract document content for AI context
    local doc_content = extract_document_content(doc)
    options.documentContext = doc_content
    quarto.log.output("\nExtracted document content length:", #doc_content)

    -- Add AI settings form at the top of document
    table.insert(
        doc.blocks,
        1,
        pandoc.RawBlock("html", AI_SETTINGS_FORM_HTML)
    )

    -- Add options JSON (at the *almost* top of document)
    table.insert(
        doc.blocks,
        2,
        pandoc.RawBlock(
            "html",
            string.format(
                '<script type="application/json" id="global-options">%s</script>',
                quarto.json.encode(options)
            )
        )
    )

    -- Add runtime JS and CSS
    -- NOTE: This looks much simpler than other extensions.
    -- perhaps we need to add more (pyodide, monaco) dependencies here
    quarto.doc.add_html_dependency({
        name = "py-activity",
        version = "0.1.0",
        stylesheets = { "assets/runtime/py-activity-runtime.css" },
        scripts = {
            { path = "assets/runtime/py-activity-runtime.js", attribs = { type = "module" } },
        }
    })
    return doc
end
