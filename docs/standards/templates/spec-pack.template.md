# Spec Pack — {{TICKET_ID}}: {{TITLE}}

> Created: {{DATE}} | Author: {{AUTHOR}} | Status: Draft / Approved

---

## 1. Background

<!-- Why does this ticket exist? What problem does it solve? -->

## 2. Scope

**In scope:**
-

**Out of scope:**
-

## 3. Requirements

### Functional
- [ ]
- [ ]

### Non-functional
- [ ] Performance:
- [ ] Security: (Joi validation? isAuthenticated?)
- [ ] Logging: (what to log, what NOT to log)

## 4. API Contract (if BE change)

```
METHOD /api/{{path}}
Authorization: Bearer <token>   ← required? yes/no

Request body:
{
}

Response 200:
{
  "error": false,
  "data": {}
}

Response 4xx:
{
  "error": { "code": xxx, "message": "..." }
}
```

## 5. State / Redux Contract (if FE change)

```
Action type: ENTITY_{{ACTION}}
Reducer: {{reducerName}}
Store shape after action:
  state.{{entity}}: ...
```

## 6. DB Schema Change (if any)

Migration file: `server/migrations/{{timestamp}}_{{name}}.js`

```
Table: {{table_name}}
Add column: {{column}} {{type}} {{constraints}}
```

## 7. Risks & Assumptions

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| | | |

## 8. Open Questions

- [ ]
