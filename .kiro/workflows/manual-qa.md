# Workflow: Manual QA

## Browser Checks

- Open [`index.html`](../../index.html)
- Add a valid transaction
- Confirm total summary updates
- Confirm the new item appears in recent history
- Confirm pie chart reflects the category
- Delete a transaction and confirm recalculation
- Refresh the page and confirm Local Storage persistence
- Add and remove a custom category
- Toggle theme and confirm persistence

## Regression Notes

Pay extra attention to:

- category select rendering
- monthly summary rendering
- chart legend readability in dark mode
- transaction sort behavior
- spending limit highlighting
