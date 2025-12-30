# Xây dựng các endpoint chatbot với 3 endpoint khác nhau dành cho 3 loại đối tượng.

## Message chung (lưu ý trường nào không có giữ liệu thì để trống): 
'''
Với vai trò là 1 trợ lý tuyển dụng và hướng nghiệp thông minh, dựa trên thông tin được cung cấp, trả lời câu hỏi sau.  
Trả lời với format gọn gàng, không sử dụng emoji.  
Thông tin người tìm việc: {thông tin người tìm việc}'
Thông tin công ty: {thông tin công ty}
Thông tin công việc : {thông tin công việc}
Câu hỏi: {câu hỏi}
'''

## Đối tượng và kịch bản
1. Khách
- Không cần xác thực user
- Đầu vào : Câu hỏi.
- Gửi message đến LLM.

2. Ứng viên (jobseeker)
- Xác thực role là jobseeker
- Đầu vào : Câu hỏi, userId của ứng viên đó
- Trích xuất thông tin trong userProfile từ userId đó
- Gửi message đến LLM.

3. Chủ doanh nghiệp (employer)
- Xác thực role là employer
- Đầu vào : Câu hỏi, companyId của ứng viên đó, jobId (Optional) , jobApplication (Optional)
- Lấy thông tin công ty từ companyId, lấy thông tin userId từ jobApplication rồi lấy thông tin người tìm việc từ userProfile nếu có; lấy thông tin công việc từ jobId nếu có.
- Gửi message đến LLM.

### Công nghệ sử dụng:
Sử dụng Groq với ví dụ mẫu, sử dụng mô hình như trong ví dụ
import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": ""
    }
  ],
  "model": "openai/gpt-oss-20b",
  "temperature": 0.3,
  "max_completion_tokens": 8192,
  "top_p": 1,
  "stream": true,
  "reasoning_effort": "medium",
  "stop": null
});

for await (const chunk of chatCompletion) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}

Hoặc sử dụng kiến thức cá nhân của bạn về dịch vụ của Groq.

## Thực hiện yêu cầu với quy trình kiểm tra lần lượt các file liên quan sau:
1. Models
2. Validators
3. Services , nhớ sử dụng các middlewares nếu thấy cần thiết (auth, validator,...), sử dụng các custom error trong utils/errors nếu cần.
4. Controllers
5. Routes
6. Cập nhật/tạo tài liệu {tên model}_api.md trong docs/ có ví dụ đi kèm.
7. Cập nhật migrations nếu cần
## Quy tắc đặt tên : {tên model}.{tên folder số ít}.js
Ví dụ : user.validator.js, company.service.js...

## Xây dựng code đơn giản, dễ hiểu, clean