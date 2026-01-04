import validator from "validator";

const DEFAULT_MAX_TAGS = 10;
const DEFAULT_MAX_LEN = 60;

function extractHashtags(text = "", opts = {}) {
    const maxTags = opts.maxTags || DEFAULT_MAX_TAGS;
    const maxLen = opts.maxLen || DEFAULT_MAX_LEN;

    if (!text.trim()) return [];

    const regex = /#([\p{L}\p{N}_-]{1,60})/gu;
    const found = new Set();
    let match;

    while ((match = regex.exec(text)) !== null) {
        let tag = match[1].toLowerCase();
        if (tag.length > maxLen) continue;
        tag = validator.escape(tag);
        found.add(tag);
        if (found.size >= maxTags) break;
    }

    return [...found];
}

function normalizeHashtags(tags = [], opts = {}) {
    const maxTags = opts.maxTags || DEFAULT_MAX_TAGS;
    const maxLen = opts.maxLen || DEFAULT_MAX_LEN;

    const clean = [];
    const seen = new Set();

    for (let tag of tags) {
        if (!tag) continue;

        tag = tag.toLowerCase().replace(/^#/, "");
        if (tag.length > maxLen) continue;

        tag = validator.escape(tag);
        if (!seen.has(tag)) {
            seen.add(tag);
            clean.push(tag);
            if (clean.length >= maxTags) break;
        }
    }

    return clean;
}

export { extractHashtags, normalizeHashtags };
