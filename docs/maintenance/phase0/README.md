# README cho Phase 0-A (Safety Rails / Storage Locations / Evidence)

## Mục đích

- Chuẩn bị safety rails cho vận hành LLM (.claude) và tránh tai nạn (lộ secrets / destructive operations)
- Cố định vị trí lưu trữ dưới docs để deliverables không bị phân tán
- Để lại công việc đã làm ở Phase 0, lý do của nó và kết quả review dưới dạng Evidence

## Phạm vi

- .claude/ (CLAUDE.md / settings.json / rules)
- docs/ (architecture / standards / changes / maintenance)
- Các file evidence cho Phase 0 (plan / log / decisions / risk / review)

## Ngoài phạm vi

- Thay đổi source code của ứng dụng (implementation bắt đầu từ Phase 1 trở đi)
- Viết hoặc commit secrets (keys, API keys, passwords, v.v.)

## Quy tắc cập nhật (Quan trọng)

- Thay đổi ở Phase 0 về nguyên tắc phải đi qua PR (cần review)
- Khi cập nhật, cũng phải cập nhật phase0-execution-log.md / phase0-decisions.md / phase0-review.md
- Trong periodic inspection (Phase 9), phải rà lại xem chúng có lệch khỏi thực tế không

## Cái gì là “authoritative” (Single Source of Truth)

- Safety rails: .claude/settings.json và .claude/rules/00-safety.md
- Lý do các quyết định của Phase 0: phase0-decisions.md
- Phán định hoàn thành: phase0-review.md