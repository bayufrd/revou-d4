# Kiro Workspace

This folder contains workspace-level guidance and lightweight project context for Kiro-style AI-assisted development.

## Purpose

The `.kiro/` directory in this repository is used to keep agent instructions, project context, implementation notes, and repeatable workflows close to the codebase.

## Current Workspace

- Project: Expense & Budget Visualizer
- Stack: HTML, CSS, Vanilla JavaScript
- Storage: Browser Local Storage
- Charting: Chart.js via CDN
- Deployment target: GitHub Pages

## Suggested Layout

```text
.kiro/
├── README.md
├── agent.md
├── settings.json
├── context/
│   ├── product.md
│   ├── architecture.md
│   └── repository-map.md
├── specs/
│   └── expense-budget-visualizer.md
├── prompts/
│   ├── implement-feature.md
│   ├── review-change.md
│   └── release-checklist.md
└── workflows/
    ├── shipping.md
    └── manual-qa.md
```

## Notes

- Keep instructions concise and repository-specific.
- Prefer updating files in this directory instead of scattering AI guidance across the root.
- Store reusable prompts and checklists here so they can be committed with the project.
