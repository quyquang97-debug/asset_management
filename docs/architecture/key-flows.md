# Key Flows

> Evidence-based: rút ra từ code đọc 2026-03-28

---

## 1. Authentication Flow (Login)

```
[LoginForm] onSubmit
  → dispatch(authAction.login(credentials))         [client/actions/authAction.js]
    → authService.login(credentials)                [client/services/authService.js]
      → POST /api/auth/login                        [HTTP]
        → auth.route.js: validate(schema.login)     [server/routes/auth.route.js]
          → authController.login()                  [server/controllers/auth.controller.js]
            → User.query({where: {email}}).fetch()
            → bcrypt.compareSync(password, hash)
            → jwt.sign({id, email}, TOKEN_SECRET_KEY)
          ← { success: true, token, email }
      ← store token in localStorage                 [client/utils/jwtUtil.js]
      ← dispatch(push('/dashboard'))                [connected-react-router]
```

**Evidence:** `server/controllers/auth.controller.js:14-47`, `server/routes/auth.route.js`, `client/services/authService.js`

**Known gap:** JWT has no `expiresIn` → tokens never expire. (`auth.controller.js:22-25`)

---

## 2. Authenticated Request Flow (CRUD)

```
[Component] user action
  → dispatch(crudAction.fetchAll(entity))           [client/actions/crudAction.js]
    → httpService.fetchEntity(entity)               [client/services/httpService.js]
      → httpUtil.fetch(entity.toLowerCase())        [client/utils/httpUtil.js]
        → GET /api/{entity}  (Authorization: Bearer <token>)
          → isAuthenticated middleware               [server/middlewares/authenticate.js]
            → jwt.verify(token, TOKEN_SECRET_KEY)
            → User.query({where:{id}}).fetch()
            → req.currentUser = user; next()
          → userController.findAll()                [server/controllers/user.controller.js]
            → User.forge().fetchAll()
          ← { error: false, data: [...] }
    ← dispatch(commonAction.fetch(entity, data))
      → crudReducer: ENTITY_FETCH                  [client/reducers/crudReducer.js]
        → state[entity] = data
[Component] re-renders from store
```

**Evidence:** `server/middlewares/authenticate.js:14-46`, `server/controllers/user.controller.js:12-23`, `client/actions/crudAction.js:22-31`

---

## 3. Input Validation Flow

```
[HTTP Request] → route handler
  → validate(schema.storeUser) middleware           [server/config/joi.validate.js]
    → schema.validate(req.body, {abortEarly: false})
    → if error: next(error)                         → joiErrorHandler → 400
    → if ok: next()                                 → controller
```

**Evidence:** `server/routes/user.route.js:122`, `server/config/joi.validate.js`, `server/utils/validator.js`

**Note:** Validation only applies to routes that explicitly use `validate(schema.X)`. Routes without it receive no validation.

---

## 4. Error Handling Flow

```
Controller .catch(err)
  → res.status(500).json({ error: err })           [inline in controller]

Unhandled middleware error
  → genericErrorHandler(err, req, res, next)        [server/middlewares/errorHandler.js]
    → logger.error(err)                             [server/config/winston.js]
    → res.status(err.status || 500).json({ error: { code, message } })

Unknown route
  → notFound(req, res, next)                        [server/middlewares/errorHandler.js:11]
    → res.status(404).json({ error: { code: 404, message: 'Not Found' } })
```

**Evidence:** `server/middlewares/errorHandler.js`, `server/controllers/user.controller.js:20-23`

**Gap:** Controllers catch errors inline and return raw `err` object (`error: err`) — inconsistent with the structured `{ error: { code, message } }` format from `genericErrorHandler`.

---

## 5. Frontend State Flow (Redux)

```
[Action Creator] returns thunk
  → dispatch → redux-thunk executes
    → API call (httpService)
      → on success: dispatch(commonAction.fetch/selectItem/...)
      → on error:   dispatch(commonAction.failure(error))
        → [authReducer or crudReducer]
          → returns new state slice
[Connected Component] receives updated props via mapStateToProps
```

**Evidence:** `client/actions/crudAction.js`, `client/actions/commonAction.js`, `client/reducers/crudReducer.js`

---

## 6. App Startup Flow

---

## 7. Multi-table DB Transaction Flow (PATCH /status)

> Added 2026-03-29 — first use: REPAIRREQUESTS module

```
[UpdateStatusModal] onSubmit
  → dispatch(repairRequestAction.updateStatus(id, { status, repairDate, cost, performedBy, description }))
    → repairRequestService.updateStatus(id, data)        [client/services/repairRequestService.js]
      → PATCH /api/repairRequests/{id}/status  (Bearer JWT)
        → isAuthenticated middleware
        → validate(schema.updateRepairRequestStatus)      [server/utils/validator.js]
        → repairRequestController.updateStatus()          [server/controllers/repairRequest.controller.js]
          → fetch current record (get current status + asset_id)
          → validate allowed transition server-side:
              open → in_progress | cancelled  (only)
              in_progress → done              (only)
              done | cancelled → anything     (rejected 400)
          → knex.transaction(trx => {
              UPDATE repair_requests SET status, updated_by, updated_at WHERE id    [trx]
              IF status = 'done':
                INSERT asset_maintenances (asset_id, repair_request_id,
                  type='repair', maintenance_date, description, cost, performed_by)  [trx]
              IF status = 'in_progress':
                UPDATE assets SET status = 'IN_REPAIR' WHERE id = asset_id          [trx]
            })
          → COMMIT (all or nothing)
        ← { error: false, data: updatedRecord }
    ← dispatch({ type: REPAIR_REQUEST_UPDATE_STATUS_SUCCESS })
      → repairRequestReducer: refresh item in list
[RepairRequestList] grid row updates status + row color
```

**Key rule:** Any INSERT/UPDATE failure inside the transaction triggers full ROLLBACK — no partial state.

**Evidence:** `server/controllers/repairRequest.controller.js`

---

## 8. POST-based Paginated Search Flow

> Added 2026-03-29 — first use: REPAIRREQUESTS module (differs from GET fetchAll pattern in §2)

```
[RepairRequestList] onSearch / onPageChange / onSortChange
  → dispatch(repairRequestAction.search({ assetId, requestedBy, status,
                                           page, pageSize, sortField, sortDir }))
    → repairRequestService.search(payload)               [client/services/repairRequestService.js]
      → POST /api/repairRequests/search  (Bearer JWT)
        → isAuthenticated middleware
        → validate(schema.searchRepairRequests)
        → repairRequestController.search()
          → Knex query:
              SELECT rr.*, a.asset_code, a.name AS asset_name, e.full_name AS requested_by_name
              FROM repair_requests rr
              JOIN assets a ON rr.asset_id = a.id
              JOIN employees e ON rr.requested_by = e.id
              WHERE (assetId? AND requestedBy? AND status?)
              ORDER BY {sortField} {sortDir}
              LIMIT pageSize OFFSET (page-1)*pageSize
          → COUNT(*) same WHERE (for total)
        ← { error: false, data: { items: [...], total, page, pageSize } }
    ← dispatch({ type: REPAIR_REQUEST_SEARCH_SUCCESS,
                 payload: { items, total, page, pageSize } })
      → repairRequestReducer updates: items, total, page, pageSize
[RepairRequestList] re-renders table rows + pagination display
```

**Difference from §2 (GET fetchAll):** Uses POST with a body; returns paginated + total count;
sort is server-side via `sortField`/`sortDir` params; default sort = `request_date DESC`.

**Evidence:** `server/controllers/repairRequest.controller.js`

---

```
npm run build
  → rimraf dist
  → webpack (dev or prod config)
    → bundle client/ → dist/
  → babel-node server/app.js
    → dotenv.config()                               [server/config/express.js:12]
    → if NODE_ENV=development: attach webpack HMR
    → app.use(requestLogger)
    → app.use('/api', routes)
    → app.get('*') → serve public/index.html        [SPA fallback]
    → app.listen(APP_PORT, APP_HOST)
```

**Evidence:** `server/app.js`, `server/config/express.js`, `package.json` scripts
