--- Can be useful for merging options
---@generic T
---@param base T
---@param override T
---@return T
function merge(base, override)
    if type(base) ~= "table" then return override end
    local out = {}

    -- first, take from base table
    for k, v in pairs(base) do
        out[k] = v
    end
    -- second, take from override table
    for k, v in pairs(override or {}) do
        out[k] = merge(out[k], v)
    end
    return out
end
