# Dựa vào file cấu trúc dữ liệu trong src/models , xây dựng tác vụ CRUD với quy trình sau:
1. Xây dựng test trong tests/ 
2. Xây dựng validator trong src/valdators.
3. Xây dựng các services trong src/services, nhớ sử dụng các middlewares nếu thấy cần thiết (auth, validator,...), sử dụng các custom error trong utils/errors nếu cần.
4. Xây dựng controllers trong src/controllers
5. Xây dựng routes trong src/routes
6. Hoàn thiện vào các file index.js khi cần thiết
7. Kiểm tra cập nhật package.json và Dockerfile nếu cần.
8. Tạo tài liệu {tên model}_api.md trong docs/ có ví dụ đi kèm.
# Quy tắc đặt tên : {tên model}.{tên folder số ít}.js
Ví dụ : user.validator.js, company.service.js...

# Xây dựng code đơn giản, dễ hiểu, clean