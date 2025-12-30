# Thực hiện yêu cầu với quy trình kiểm tra lần lượt các file liên quan sau:
1. Models
2. Validators
3. Services , nhớ sử dụng các middlewares nếu thấy cần thiết (auth, validator,...), sử dụng các custom error trong utils/errors nếu cần.
4. Controllers
5. Routes
6. Cập nhật/tạo tài liệu {tên model}_api.md trong docs/ có ví dụ đi kèm.
# Quy tắc đặt tên : {tên model}.{tên folder số ít}.js
Ví dụ : user.validator.js, company.service.js...

# Xây dựng code đơn giản, dễ hiểu, clean