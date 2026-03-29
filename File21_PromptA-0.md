# File21_PromptA-0 — Phase 0-A Execution Report
> Repo: `express-react-boilerplate` | Date: 2026-03-28 | Status: PASS

---

## Mục tiêu Phase 0-A

- Sắp xếp skeleton vận hành của `.claude/` và `docs/` để các phase sau không bị lạc
- Cấu hình permissions (deny/ask/allow) để tránh secrets và dangerous operations
- Chuẩn bị "hiến pháp" (`CLAUDE.md`) và "rules chống tai nạn" (`00-safety.md`)
- Ghi lại toàn bộ công việc, lý do và kết quả review vào Evidence Pack

---

## Plan (trước khi thực thi)

### Files to Read

| File | Lý do |
|------|-------|
| `.claude/settings.json` | Xác nhận nội dung hiện tại, tìm gaps trước khi update |
| `CLAUDE.md` (root) | Tránh duplicate trong `.claude/CLAUDE.md` |
| `package.json` | Scripts, stack confirmation |
| `.env.example` | Key names cho deny policy evidence |
| `readme.md` | (ask-gated — bỏ qua; `package.json` đủ) |

### Files to Create / Update

| # | File | Action |
|---|------|--------|
| 1 | `.claude/settings.json` | Update: bổ sung deny patterns còn thiếu + destructive cmd deny |
| 2 | `.claude/CLAUDE.md` | Create: Claude Code-specific directives |
| 3 | `.claude/rules/00-safety.md` | Create: absolute prohibitions |
| 4 | `docs/architecture/.gitkeep` | Create dir |
| 5 | `docs/standards/.gitkeep` | Create dir |
| 6 | `docs/changes/.gitkeep` | Create dir |
| 7 | `docs/maintenance/.gitkeep` | Create dir |
| 8 | `docs/maintenance/phase0/artifacts/.gitkeep` | Create dir |
| 9 | `docs/maintenance/phase0/README.md` | Create: operational policy |
| 10 | `docs/maintenance/phase0/phase0-plan.md` | Create |
| 11 | `docs/maintenance/phase0/phase0-execution-log.md` | Create |
| 12 | `docs/maintenance/phase0/phase0-decisions.md` | Create |
| 13 | `docs/maintenance/phase0/phase0-risk-register.md` | Create |
| 14 | `docs/maintenance/phase0/phase0-review.md` | Create |

### Checkpoints

| ID | Checkpoint | Điều kiện |
|----|-----------|----------|
| CP-1 | Đọc xong các file cần thiết | Không bắt đầu tạo file trước |
| CP-2 | `.claude/` hoàn chỉnh | Không có secrets; JSON valid |
| CP-3 | `docs/` skeleton tạo xong | Không có source code bị sửa |
| CP-4 | Evidence Pack hoàn chỉnh (6 file) | Execution log khớp thực tế |
| CP-5 | Self-review done | Pass/fail ghi vào `phase0-review.md` |

### Risks

| Risk | Likelihood | Impact | Biện pháp |
|------|-----------|--------|-----------|
| `.claude/CLAUDE.md` duplicate root `CLAUDE.md` | Cao | Medium | Đọc root trước; `.claude/CLAUDE.md` = Claude Code-specific only |
| `settings.json` invalid JSON | Thấp | High | Validate với `node -e "JSON.parse(...)"` sau khi write |
| Docs overwrite file có sẵn | Thấp | Medium | `ls docs/` trước khi tạo |
| Deny pattern quá rộng | Thấp | Medium | Glob test sau update |
| Secret lọt vào docs/ | Thấp | Critical | Hard constraint: key names only, không viết values |
| Lệnh phá hủy được đề xuất | Không | Critical | Prohibited trong plan và 00-safety.md |

---

## Execution Log

### Step 1 — Read Phase [CP-1]

| File | Kết quả |
|------|---------|
| `.claude/settings.json` | Đọc — gaps: thiếu `id_rsa`, `*.p12`, `*.keystore`, `**/credential*`; không có destructive cmd deny |
| `CLAUDE.md` (root) | Đọc — đầy đủ; `.claude/CLAUDE.md` sẽ không duplicate |
| `.env.example` | Đọc — 7 key groups (DB, JWT, App, Log); values là placeholders, không có secret thật |
| `docs/` | Kiểm tra — chưa tồn tại |

**CP-1: PASS**

### Step 2 — Update `.claude/settings.json`

Thay đổi so với phiên bản trước:
- Thêm deny secrets: `**/credential*`, `**/credentials/**`, `**/id_rsa`, `**/id_rsa.pub`, `**/*.p12`, `**/*.keystore`, `**/*.jks`, `.env.test`
- Thêm deny Bash destructive: `rm -rf*`, `git reset --hard*`, `git push --force*`, `git push -f*`, `DROP TABLE*`, `DROP DATABASE*`, `format *`, `mkfs*`
- Mở rộng allow: `Read(.claude/**)`, `Read(docs/**)`, `npm run build:prod`, `npm run webpack:prod`, `npm run migrate:rollback`, `git show*`, `node -e "JSON.parse*"`
- Xóa `$schema` (URL không hợp lệ — IDE warning)

### Step 3 — Create `.claude/CLAUDE.md`

Nội dung: absolute prohibitions, permission model summary, storage locations, authoritative sources. Không duplicate root `CLAUDE.md`.

### Step 4 — Create `.claude/rules/00-safety.md`

7 rules: secret protection, destructive command prohibition, Phase 0 source constraint, docs secret prohibition, minimum protected files, read-before-write, scope discipline.

**CP-2: PASS** — `.claude/` hoàn chỉnh; JSON valid; không có secrets.

### Step 5 — Create `docs/` Skeleton

Tạo: `docs/architecture/`, `docs/standards/`, `docs/changes/`, `docs/maintenance/`, `docs/maintenance/phase0/artifacts/` — tất cả bằng `.gitkeep`.

Không có source file nào bị sửa.

**CP-3: PASS**

### Step 6 — Create Evidence Pack (6 files)

`README.md` → `phase0-plan.md` → `phase0-execution-log.md` → `phase0-decisions.md` → `phase0-risk-register.md` → `phase0-review.md`

**CP-4: PASS**

### Step 7 — Validate

```
JSON valid   ← node -e "JSON.parse(...)"
14 files created/updated, đúng vị trí
Không có source code nào bị sửa
```

**CP-5: PASS**

---

## Files Created / Updated — Final List

| File | Action |
|------|--------|
| `.claude/settings.json` | Updated |
| `.claude/CLAUDE.md` | Created |
| `.claude/rules/00-safety.md` | Created |
| `docs/architecture/.gitkeep` | Created |
| `docs/standards/.gitkeep` | Created |
| `docs/changes/.gitkeep` | Created |
| `docs/maintenance/.gitkeep` | Created |
| `docs/maintenance/phase0/artifacts/.gitkeep` | Created |
| `docs/maintenance/phase0/README.md` | Created |
| `docs/maintenance/phase0/phase0-plan.md` | Created |
| `docs/maintenance/phase0/phase0-execution-log.md` | Created |
| `docs/maintenance/phase0/phase0-decisions.md` | Created |
| `docs/maintenance/phase0/phase0-risk-register.md` | Created |
| `docs/maintenance/phase0/phase0-review.md` | Created |

---

## deny/ask/allow Policy — Giải thích

### deny — Secrets (không thể override)

| Pattern | Lý do |
|---------|-------|
| `.env`, `.env.*` | DB credentials, JWT secret — confirmed từ `.env.example` |
| `**/secrets/**`, `**/credentials/**`, `**/credential*` | Secret directories với nhiều naming convention |
| `**/id_rsa`, `**/id_rsa.pub` | SSH keys (thường có trong deployment) |
| `**/*.pem`, `**/*.key` | TLS/SSL certificates và private keys |
| `**/*.p12`, `**/*.keystore`, `**/*.jks` | Java-style keystores (mobile/backend cert mgmt) |

### deny — Artifacts/Dependencies (~370 MB non-source)

| Target | Size | Lý do |
|--------|------|-------|
| `node_modules/**` | 336 MB | npm deps, không phải project code |
| `dist/**` | 25 MB | Webpack output, 138k+ lines minified |
| `public/swagger/**` | 8.8 MB | Vendored Swagger UI |
| `logs/**` | 10 KB (tăng) | Runtime output — user paste thay vì đọc |
| `.git/objects/**` | 18.4 MB | Git internals |

**Áp dụng cho cả 3 tool: Read + Grep + Glob** (gap từ Prompt C đã được fix).

### deny — Destructive Bash

`rm -rf*` / `git reset --hard*` / `git push --force*` / `DROP TABLE*` / `DROP DATABASE*` / `mkfs*` / `format *`

Lý do: Bash tool có thể thực thi shell command trực tiếp. Deny là technical control bổ sung cho directive trong `00-safety.md`. Limitation: string-based matching, bypassable — human vẫn là final control.

### ask — Category C (valuable but not routine)

| File | Khi nào cần |
|------|------------|
| `package-lock.json` | Debug transitive dep version |
| `readme.md` | Onboarding hoặc viết docs |
| `server/migrations/**` | Làm việc với DB schema/models |
| `.babelrc`, `.eslintrc`, `.prettierrc` | Thay đổi build/lint/format config |
| `public/index.html` | Sửa SPA shell hoặc CSP headers |

### allow — Source + Safe Ops

`client/**`, `server/**`, `webpack/**`, `package.json`, `knexfile.js`, `.env.example`, `.claude/**`, `docs/**`, npm run scripts, git read commands.

---

## Key Decisions

| ID | Quyết định | Lý do tóm tắt |
|----|-----------|--------------|
| D-01 | 3-tier deny/ask/allow | deny = không override được; ask = preserves access khi cần; allow = routine không cần hỏi |
| D-02 | Broad secret deny patterns | Bao phủ tất cả naming conventions; trade-off `*.key` rộng được accept |
| D-03 | Destructive Bash deny | Technical control bổ sung cho directive; limitation acknowledged |
| D-04 | Grep/Glob deny gap fix | Live test xác nhận: Glob trả về 100+ node_modules files khi chỉ có Read deny |
| D-05 | Storage location design | Tách living docs / change artifacts / maintenance evidence |
| D-06 | Hai CLAUDE.md không duplicate | Root = full context; `.claude/` = Claude Code directives |
| D-07 | No source code in Phase 0 | Baseline sạch cho Phase 1; evidence pack đáng tin |

---

## Risk Register — Tóm tắt

| ID | Risk | Status |
|----|------|--------|
| R-01 | CLAUDE.md duplicate | Mitigated |
| R-02 | settings.json invalid JSON | Mitigated — JSON valid confirmed |
| R-03 | docs/ overwrite existing file | Resolved — dir không tồn tại trước |
| R-04 | Deny pattern quá rộng | Accepted / Monitor trong Phase 1 |
| R-05 | Secret trong docs | Controlled — key names only |
| R-06 | Destructive command | Double-mitigated (directive + technical) |
| R-07 | Grep/Glob bypass Read deny | Fixed — live test confirmed |
| R-08 | Evidence pack incomplete | Resolved — 6/6 files complete |
| R-09 | Bash deny bypassable | Accepted — documented |
| R-10 | readme.md không đọc | Accepted — package.json đủ |

**Open items cho Phase 1:** Monitor `**/*.key` false positives; consider pre-commit hook cho destructive commands.

---

## Self-Review Checklist

| Category | Result |
|----------|--------|
| Secrets deny hoàn chỉnh | PASS |
| Destructive Bash deny | PASS |
| Không có secrets trong file nào | PASS |
| Read + Grep + Glob deny đồng nhất | PASS |
| `client/**` + `server/**` freely readable | PASS |
| Category C là ask (không phải deny) | PASS |
| `docs/` skeleton đầy đủ | PASS |
| Evidence pack 6/6 files | PASS |
| Source code không bị sửa | PASS |
| JSON valid | PASS |

---

## Input Checklist để bàn giao sang Phase 1

- [x] `.claude/settings.json` valid JSON, đầy đủ deny/ask/allow
- [x] `.claude/rules/00-safety.md` với 7 absolute rules
- [x] Root `CLAUDE.md` đầy đủ (stack, commands, reading protocol, fix procedure, log SOP)
- [x] `docs/` skeleton sẵn sàng (5 directories)
- [x] Evidence pack đầy đủ 6 file, có nội dung thực chất
- [x] Không có source code nào bị sửa trong Phase 0
- [x] Không có secrets trong bất kỳ file nào
- [ ] Project owner review và approve evidence pack ← **chờ human**
- [ ] Scope và objective của Phase 1 được định nghĩa ← **chờ conversation tiếp theo**

---

## Completion Gate

**Phase 0-A: PASS**

Tất cả constraint giữ nguyên. Safety rails active. Evidence pack hoàn chỉnh. Sẵn sàng cho Phase 1.
