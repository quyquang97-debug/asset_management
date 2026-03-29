# 20-architecture — Architecture Rules

> Evidence: `server/app.js`, `server/routes/`, `server/controllers/`, `client/actions/`, `client/reducers/`

---

## Layer Boundaries (Backend)

- **Route file**: URL mapping + Joi validation + Swagger JSDoc only. No business logic.
- **Controller**: Call model methods, format JSON response. No raw SQL, no direct DB queries.
- **Model**: Bookshelf table definition. No business rules, no HTTP concerns.
- **Middleware**: Cross-cutting only (auth, logging, error handling). No route-specific logic.

## Layer Boundaries (Frontend)

- **Component**: Render UI, handle local events. No direct API calls.
- **Container**: Connect Redux state to component props. No JSX rendering logic beyond wiring.
- **Action**: Dispatch API calls via services, dispatch to reducer. No UI logic.
- **Service (`httpService`)**: Construct API paths, wrap httpUtil calls. No Redux imports.
- **Reducer**: Pure state derivation from action. No side effects, no API calls.

## Dependency Direction

- Dependencies flow **downward only**: route → controller → model
- FE: action → service → httpUtil; reducer receives actions, no upward dependencies
- No circular imports

## What Goes Where

| Need | Location |
|------|---------|
| New API endpoint | `server/routes/` + `server/controllers/` + `server/utils/validator.js` |
| New DB table | `server/migrations/` (new file) + `server/models/` |
| New Redux action type | `client/constants/actionType.js` |
| New API service call | `client/services/httpService.js` or new service file |
| New utility function | `client/utils/` (FE) or `server/utils/` (BE) |
| Cross-cutting BE concern | `server/middlewares/` |

> Detail: `docs/architecture/overview.md`, `docs/architecture/key-flows.md`
