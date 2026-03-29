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
