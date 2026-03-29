# phase0-risk-register

| Risk ID | Risk                                                | Likelihood | Impact | Sign (early detection)        | Countermeasure (mitigation / avoidance)        | Owner | Status |
| ------- | --------------------------------------------------- | ---------: | -----: | ----------------------------- | ---------------------------------------------- | ----- | ------ |
| R-001   | Một file secret bị đọc do thiếu deny rule           |     Medium |   High | AI cố chạm vào .env           | Thêm deny patterns, tăng cường review          |       | Open   |
| R-002   | Rules bị phình to và ngừng được tuân theo           |       High | Medium | rules trở nên dài / trùng lặp | Giữ rules ngắn, chuyển chi tiết sang standards |       | Open   |
| R-003   | Evidence không được cập nhật và trở thành hình thức |     Medium | Medium | phase0-review đã cũ           | Review ở Phase 9, ghi rõ update procedure      |       | Open   |