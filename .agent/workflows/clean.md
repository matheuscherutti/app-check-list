---
description: Clean and optimize project code (Auto-fix linters and formatting)
---

# 🧹 Project Cleanup Workflow

Use this command to automatically fix linting issues and format your code according to the project rules.

## Steps

// turbo
1. Run the Auto Fixer script
   `python .agent/scripts/auto_fixer.py [paths...]`
   *(Example: `python .agent/scripts/auto_fixer.py src/components/Login.tsx`)*

2. Verify changes with the selective checklist
   `python .agent/scripts/checklist.py [paths...]`

## 🎯 When to use
- After finishing a significant piece of logic.
- Before committing or creating a Pull Request.
- Before running `/deploy`.
- Whenever code feels "messy".

## 🛡️ Support
- **Languages**: JavaScript, TypeScript, Python, HTML, CSS.
- **Tools used**: Ruff (Python), ESLint (JS/TS), Prettier (Web).
