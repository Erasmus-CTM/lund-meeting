local M = {}

-- Pandoc gives us unicode characters for the task list
M.EMPTY = "☐"
M.CHECKED = "☒"

---@class ChoiceOption
---@field id integer              -- stable option id
---@field blocks pandoc.Block[]   -- rendered option content


---@class ChoiceActivity
---@field question pandoc.Block[]   -- question text
---@field code pandoc.CodeBlock|nil -- optionally render a codeblock
---@field options ChoiceOption[]
---@field correct_ids integer[]



---Parse a choice activity from a Div
---@param div pandoc.Div
---@return ChoiceActivity
function M.parse_choice_activity(div)
    local question = {}
    local code = nil
    local options = {}
    local correct_ids = {}

    local option_id = 0

    for _, block in ipairs(div.content) do
        if block.t == "Para" or block.t == "Plain" then
            table.insert(question, block)
        elseif block.t == "CodeBlock" then
            code = block
        elseif block.t == "BulletList" then
            for _, item in ipairs(block.content) do
                -- item is pandoc.Block[]
                local first = item[1]

                local correct = false

                -- Detect [x] / [ ]
                if first
                    and first.t == "Plain"
                    and first.content[1]
                    and first.content[1].t == "Str"
                then
                    local marker = first.content[1].text
                    if marker == M.CHECKED then
                        correct = true
                        table.remove(first.content, 1)
                    elseif marker == M.EMPTY then
                        table.remove(first.content, 1)
                    end
                end

                if correct then
                    table.insert(correct_ids, option_id)
                end

                table.insert(options, {
                    id = option_id,
                    blocks = item,
                })

                option_id = option_id + 1
            end
        end
    end

    local mode = (#correct_ids > 1) and "multi" or "single"

    return {
        question = question,
        code = code,
        options = options,
        correct_ids = correct_ids,
        mode = mode,
    }
end

---Render a choice activity to HTML blocks
---@param act ChoiceActivity
---@param act_id integer
---@return pandoc.Block[]
function M.render_choice_activity(act, act_id)
    local blocks = {}

    -- Root container
    local attrs = pandoc.Attr(
        "",
        { "activity" },
        {
            ["data-act-id"] = tostring(act_id),
            ["data-act-type"] = "choice",
            ["data-correct"] = pandoc.json.encode(act.correct_ids),
        }
    )

    local content = {}

    -- Prompt
    for _, b in ipairs(act.question) do
        table.insert(content, b)
    end

    -- Optional code block
    if act.code then
        table.insert(content, act.code)
    end

    -- Options list
    local items = {}

    for _, opt in ipairs(act.options) do

        local checkbox = pandoc.RawInline("html", '<input type="checkbox" name="opt' .. opt.id .. '"/>');

        ---insert works!
        ---@diagnostic disable-next-line: undefined-field
        opt.blocks:insert(1, checkbox)
        table.insert(items, opt.blocks)
    end

    table.insert(content, pandoc.BulletList(items))

    table.insert(blocks, pandoc.Div(content, attrs))
    return blocks
end

return M
