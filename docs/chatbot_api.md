# Chatbot API Documentation

API endpoints for chatbot functionality with three different user types: Guest, Jobseeker, and Employer.

## Base URL
```
/api/v1/chatbot
```

## Endpoints

### 1. Guest Chatbot

Chat with the AI assistant without authentication.

**Endpoint:** `POST /api/chatbot/guest`

**Authentication:** None required

**Request Body:**
```json
{
  "question": "Làm thế nào để viết CV tốt?"
}
```

**Validation Rules:**
- `question`: Required, string, 1-2000 characters

**Success Response:**
```json
{
  "success": true,
  "message": "Chat completed successfully",
  "data": {
    "question": "Làm thế nào để viết CV tốt?",
    "answer": "Để viết một CV tốt, bạn cần...[AI response]"
  }
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:5000/api/v1/chatbot/guest \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Làm thế nào để viết CV tốt?"
  }'
```

**Example using JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/v1/chatbot/guest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: 'Làm thế nào để viết CV tốt?'
  })
});

const data = await response.json();
console.log(data);
```

---

### 2. Jobseeker Chatbot

Chat with AI assistant with your profile information included for personalized advice.

**Endpoint:** `POST /api/chatbot/jobseeker`

**Authentication:** Required (Jobseeker role)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "question": "Công việc nào phù hợp với kỹ năng của tôi?"
}
```

**Validation Rules:**
- `question`: Required, string, 1-2000 characters

**Success Response:**
```json
{
  "success": true,
  "message": "Chat completed successfully",
  "data": {
    "question": "Công việc nào phù hợp với kỹ năng của tôi?",
    "jobseekerInfo": "Họ tên: Nguyễn Văn A, Kỹ năng: JavaScript, React, Node.js, Kinh nghiệm: 2 năm",
    "answer": "Dựa trên kỹ năng của bạn...[AI response]"
  }
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:5000/api/v1/chatbot/jobseeker \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "question": "Công việc nào phù hợp với kỹ năng của tôi?"
  }'
```

**Example using JavaScript:**
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/v1/chatbot/jobseeker', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    question: 'Công việc nào phù hợp với kỹ năng của tôi?'
  })
});

const data = await response.json();
console.log(data);
```

---

### 3. Employer Chatbot

Chat with AI assistant with company, job, and candidate information for recruitment assistance.

**Endpoint:** `POST /api/chatbot/employer`

**Authentication:** Required (Employer role)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "question": "Ứng viên này có phù hợp với vị trí không?",
  "companyId": 1,
  "jobId": 5,
  "jobApplicationId": 10
}
```

**Validation Rules:**
- `question`: Required, string, 1-2000 characters
- `companyId`: Required, positive integer
- `jobId`: Optional, positive integer
- `jobApplicationId`: Optional, positive integer

**Success Response:**
```json
{
  "success": true,
  "message": "Chat completed successfully",
  "data": {
    "question": "Ứng viên này có phù hợp với vị trí không?",
    "companyInfo": "Tên công ty: ABC Tech, Ngành nghề: Technology, Quy mô: 100-500",
    "jobInfo": "Tiêu đề: Senior Developer, Yêu cầu: 5 năm kinh nghiệm, Mức lương: 2000-3000 USD",
    "jobseekerInfo": "Họ tên: Nguyễn Văn B, Kỹ năng: React, Node.js, Kinh nghiệm: 6 năm",
    "answer": "Dựa trên thông tin được cung cấp...[AI response]"
  }
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:5000/api/v1/chatbot/employer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "question": "Ứng viên này có phù hợp với vị trí không?",
    "companyId": 1,
    "jobId": 5,
    "jobApplicationId": 10
  }'
```

**Example using JavaScript:**
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/v1/chatbot/employer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    question: 'Ứng viên này có phù hợp với vị trí không?',
    companyId: 1,
    jobId: 5,
    jobApplicationId: 10
  })
});

const data = await response.json();
console.log(data);
```

**Example with only company info:**
```javascript
const response = await fetch('http://localhost:5000/api/v1/chatbot/employer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    question: 'Làm thế nào để thu hút ứng viên tốt hơn?',
    companyId: 1
  })
});
```

---

## Error Responses

### Validation Error
```json
{
  "success": false,
  "errors": [
    {
      "field": "question",
      "message": "Question is required"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "error": "Authorization header is missing"
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "error": "Access denied. Jobseeker role required"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "error": "Company not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Failed to get response from chatbot service"
}
```

---

## Notes

1. **Guest Endpoint**: Open to everyone, provides general career advice without personalized information.

2. **Jobseeker Endpoint**: 
   - Requires authentication with jobseeker role
   - Automatically includes user's profile information (skills, experience, education, etc.)
   - Provides personalized career guidance

3. **Employer Endpoint**: 
   - Requires authentication with employer role
   - Must provide `companyId` (required)
   - Can optionally include `jobId` to get advice about a specific job
   - Can optionally include `jobApplicationId` to evaluate a specific candidate
   - Provides recruitment and hiring assistance

4. **AI Model**: Uses Groq's LLM service with `llama-3.3-70b-versatile` model

5. **Environment Variable**: Requires `GROQ_API_KEY` to be set in the environment

6. **Response Format**: All responses are in Vietnamese and formatted cleanly without emojis

7. **Rate Limiting**: Consider implementing rate limiting for production use to prevent abuse

8. **Error Handling**: All errors are properly caught and returned with appropriate HTTP status codes
