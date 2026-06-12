# Spec: Expense & Budget Visualizer

## Objective

Maintain a lightweight expense tracker that can be opened directly in the browser and deployed without a build step.

## Must Keep Working

- Add transaction
- Validate required fields
- Delete transaction
- Persist data to Local Storage
- Recompute totals after every change
- Update chart after every change
- Render custom categories
- Preserve sorting, limit, and theme features

## Technical Boundaries

- HTML, CSS, and Vanilla JavaScript only
- Keep one stylesheet at [`css/style.css`](../css/style.css)
- Keep one script at [`js/script.js`](../js/script.js)
- Use CDN-based Chart.js integration
- Keep repository static-host friendly

## Manual Acceptance Checklist

- Open [`index.html`](../index.html) in browser
- Add valid transaction and confirm it appears in list
- Submit invalid form and confirm validation feedback
- Delete one transaction and confirm totals change
- Add custom category and confirm it becomes selectable
- Refresh page and confirm saved data remains
- Toggle theme and confirm preference persists
