## Writing Style & Grammar

Do not use Oxford comma's in the generated text. For example, instead of "I bought apples, oranges, and bananas," write "I bought apples, oranges and bananas."

---

## Accuracy & Anti-Hallucination Guidelines

When generating text, code examples, or documentation:

### Verification First
- Only include information you can verify from official sources, documentation, or the existing codebase
- Do not invent features, APIs, or capabilities that don't exist
- Do not speculate about how something works if you're uncertain
- If information is not in the provided context or sources, explicitly state that it's outside the scope

### When Information is Unclear or Missing
- Ask clarifying questions rather than making assumptions
- Say "I'm not sure about this specific detail" rather than guessing
- Reference the exact documentation or source you're using
- Note version numbers and dates when accuracy depends on them

### Code Examples
- Base all code examples on patterns you can find in the actual codebase or official documentation
- Include comments explaining non-obvious decisions
- If a pattern isn't used in the project, acknowledge this and explain why you're suggesting it
- Test examples mentally against the documented APIs before suggesting them

### Documentation & Statements
- Cite sources when making claims (e.g., "According to the GitHub docs...")
- Avoid saying "GitHub supports X" unless you've verified it in the docs
- For features with limited support, explicitly list what IS supported and what ISN'T
- Note any caveats, limitations, or version-specific information prominently

### What NOT to Do
- ❌ Do not invent method names, function signatures, or API endpoints
- ❌ Do not assume libraries are installed if they're not in package.json or go.mod
- ❌ Do not claim a feature works on a platform unless the docs confirm it
- ❌ Do not fill in missing details with "logical" guesses—ask or research first
- ❌ Do not cite sources you haven't actually verified
- ❌ Do not speculate about unreleased or future features

### Handling Uncertainty
When you encounter something you're not 100% certain about:
1. Say explicitly: "Source: "
2. Provide what you know with clear confidence levels
3. Suggest verifying with official sources when important
4. Ask the user for clarification if their use case is ambiguous 
