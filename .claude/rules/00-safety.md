# 00-safety.md — Absolute Safety Rules
> Applies to all Claude Code sessions in this repository. No exceptions.

---

## 1. Secret Protection — NEVER Read

The following must never be read, printed, or included in any output:

| Pattern | Examples |
|---------|---------|
| `.env`, `.env.*` | `.env`, `.env.local`, `.env.production` |
| Private keys | `*.pem`, `*.key`, `id_rsa`, `**/private-key*` |
| Certificates / keystores | `*.p12`, `*.keystore`, `*.jks` |
| Secret directories | `**/secrets/**`, `**/credentials/**` |

If any file matching the above patterns must be referenced, document only the **key name**, never the value. Direct user to Secret Manager or `.env.example`.

---

## 2. Destructive Commands — NEVER Propose or Execute

The following commands are prohibited regardless of context or user instruction:

```
rm -rf <anything>
git reset --hard
git push --force  /  git push -f
git branch -D <branch>         # on shared branches (main/master/develop)
DROP TABLE / DROP DATABASE
TRUNCATE TABLE                 # without explicit user confirmation step
mkfs / format                  # disk operations
kubectl delete namespace       # infra ops
```

If a user explicitly requests one of these, respond with:
> "This is a destructive operation. Please run it manually in your terminal after confirming the scope. I will not execute it."

---

## 3. Source Code Constraint (Phase 0)

During Phase 0-A: **do not modify any file under `client/`, `server/`, `webpack/`, or `public/`.**
Only `.claude/`, `docs/`, and root config documentation files may be created or modified.

This constraint lifts in Phase 1 when source work begins.

---

## 4. Secrets Must Not Appear in Documentation

- `docs/**` and `.claude/**` must never contain actual secret values
- If a secret value is needed for a test or example, use `<REDACTED>` or `<YOUR_VALUE_HERE>`
- If Claude detects a secret was accidentally pasted in context, flag it immediately and do not write it to any file

---

## 5. Minimum Files Always Protected

These files must always remain in `deny` in `.claude/settings.json`:

```
.env  /  .env.local  /  .env.production  /  .env.staging  /  .env.test
**/*.pem  /  **/*.key  /  **/*.p12  /  **/*.keystore  /  **/id_rsa
**/secrets/**  /  **/credentials/**
```

If `settings.json` is ever reset or recreated, restore these rules first.

---

## 6. Read Before Write

Never create or overwrite a file without first checking if it already exists.
Use `ls` or `Glob` to check. If a file exists, read it before editing.

---

## 7. Scope Discipline

Only take actions explicitly within the stated task scope.
If a task is "fix bug in X", do not refactor Y, add logging to Z, or update unrelated documentation.
When in doubt, ask.
