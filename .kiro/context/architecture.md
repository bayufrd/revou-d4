# Architecture Context

## Application Shape

This project is a static client-side web application.

- [`index.html`](../index.html) provides layout and semantic structure
- [`css/style.css`](../css/style.css) contains all styles
- [`js/script.js`](../js/script.js) contains all interactive behavior
- Chart rendering uses Chart.js from CDN
- Persistence uses browser Local Storage

## Runtime Model

The app loads saved state from Local Storage on startup, then renders:

- total spending
- monthly summary
- category options and tags
- transaction list
- pie chart
- theme state

After each mutation, the script updates storage and re-renders affected UI.

## Data Model

### Transaction

```json
{
  "id": "string",
  "itemName": "string",
  "amount": 25000,
  "category": "Food",
  "date": "2026-06-12",
  "createdAt": 1710000000000
}
```

### Stored Collections

- transactions array
- categories array
- current sort option
- spending limit value
- current theme

## Constraints

- No build tooling required
- No backend API
- No framework migration
- Maintain compatibility with GitHub Pages
- Preserve single-file CSS and JS structure
