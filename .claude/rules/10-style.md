# 10-style — Code Style Rules

> Evidence: `.eslintrc`, code patterns in `client/` and `server/`

---

## Naming

- Variables and functions: `camelCase` — enforced by ESLint `camelcase: error`
- React components and files: `PascalCase` (`LoginForm.js`, `Dashboard.js`)
- Non-component JS files: `camelCase.js` (client) or `kebab-case.js` (server)
- Action type constants: `UPPER_SNAKE_CASE` (e.g. `ENTITY_FETCH`)
- DB columns: `snake_case` (e.g. `first_name`, `created_at`)

## Formatting (enforced by ESLint + Prettier on pre-commit)

- Single quotes `'` — no double quotes
- Semicolons required
- Curly braces always required (no braceless `if`)
- `===` only — never `==`
- Unix line endings (LF)
- Space around infix operators; spaced comments `// text`
- Newline before `return`

## Module System

- ESM (`import`/`export`) in all `client/` and `server/` source files
- Default export: components, controllers, models, middlewares, reducers
- Named exports: action creators, utility functions, controller methods

## Comments

- JSDoc on all exported functions with `@param` and `@returns`
- Inline comments only where logic is non-obvious
- No commented-out code committed

> Detail: `docs/standards/coding.md`
