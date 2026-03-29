# Coding Standards

> Evidence-based: rút ra từ `.eslintrc`, code patterns đọc 2026-03-28

---

## Naming

| Item | Convention | Evidence |
|------|-----------|---------|
| Variables, functions | `camelCase` | `.eslintrc: "camelcase": [2, {"properties": "never"}]` |
| React components | `PascalCase` | `LoginForm.js`, `Dashboard.js`, `SummaryBox.js` |
| Constants / action types | `UPPER_SNAKE_CASE` | `client/constants/actionType.js`: `ENTITY_FETCH`, `ENTITY_CREATE` |
| Files — components | `PascalCase.js` | `LoginForm.js`, `MiniDrawer.js` |
| Files — non-components | `camelCase.js` | `crudAction.js`, `httpService.js`, `commonUtil.js` |
| Files — config/server | `kebab-case.js` | `user.route.js`, `auth.controller.js`, `joi.validate.js` |
| DB columns | `snake_case` | `first_name`, `last_name`, `created_at` (migration + model) |

---

## Quotes & Formatting

| Rule | Value | Evidence |
|------|-------|---------|
| Quotes | Single `'` | `.eslintrc: "quotes": [2, "single"]` |
| Semicolons | Required | `.eslintrc: "semi": 2` |
| Curly braces | Always required | `.eslintrc: "curly": 2` |
| Equality | `===` only | `.eslintrc: "eqeqeq": 2` |
| Linebreak style | Unix (LF) | `.eslintrc: "linebreak-style": [2, "unix"]` |
| Infix operators | Spaces required | `.eslintrc: "space-infix-ops": 2` |
| Comments | Spaced (`// text`) | `.eslintrc: "spaced-comment": 2` |
| Line before `return` | Required | `.eslintrc: "newline-before-return": 2` |
| Template literals | Allowed alongside single quotes | `.eslintrc: allowTemplateLiterals: true` |

Prettier runs on pre-commit (lint-staged) for `client/**` only: trailing comma ES5, single quote.

---

## Module System

- **ESM** (`import`/`export`) throughout — enabled by Babel (`@babel/preset-env`, `@babel/register`)
- No `require()` in `client/` or `server/` source — only in `knexfile.js` and webpack configs (CommonJS context)
- Default exports for: components, controllers, models, middlewares, reducers
- Named exports for: action creators, utility functions, controller methods

**Evidence:** All `server/` and `client/` files use `import`/`export`

---

## JSDoc Comments

All exported functions should have JSDoc with `@param` and `@returns`.

```js
/**
 * Find user by id
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export function findById(req, res) { ... }
```

**Evidence:** `server/controllers/user.controller.js` — all functions documented. `client/utils/commonUtil.js` — all functions documented with `@example`.

---

## Error Response Shape (Backend)

All API error responses must follow one of two shapes:

```js
// Structured (preferred — from errorHandler.js)
{ error: { code: number, message: string } }

// Inline (legacy — avoid in new code)
{ error: true, data: { message: string } }
```

**Evidence:** `server/middlewares/errorHandler.js:16-18`, `server/controllers/user.controller.js:38-40`

Success response shape:
```js
{ error: false, data: <payload> }   // findAll, findById, update, destroy
{ success: true, data: <payload> }  // store, login
```

---

## React Component Conventions

- Prefer **functional components** — all new components in `client/components/` are functional
- Use `withStyles(styles)` from MUI for component-local styles
- Define `propTypes` for all props
- Wrap forms with `reduxForm({ form: 'UniqueName', validate })` + `withStyles`

**Evidence:** `client/components/auth/LoginForm.js:86-94`, `client/components/dashboard/Dashboard.js:16-46`

---

## What to Avoid

- No `var` — use `const` or `let`
- No `==` — use `===` (enforced by ESLint `eqeqeq`)
- No bare `catch(err) => res.json({ error: err })` — use structured error shape
- No inline styles except for MUI `withStyles` patterns
- No direct DOM manipulation in React components
