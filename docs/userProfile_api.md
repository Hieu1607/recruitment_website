# UserProfile API Documentation

Base URL: `http://localhost:5000/api/v1`

Authentication: Protected endpoints require JWT in `Authorization: Bearer <token>` header.

---

## GET /profiles/me (Protected)
Get the authenticated user's profile. Auto-creates profile if not exists.

**Headers:**
```
Authorization: Bearer <token>
```

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/profiles/me" \
  -H "Authorization: Bearer <token>"
```

**Example Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 5,
    "user_id": 10,
    "full_name": "Nguyen Van A",
    "phone": "0912345678",
    "address": "123 Nguyen Trai, Hanoi",
    "dob": "1995-05-15",
    "skills": "JavaScript, React, Node.js",
    "experience": "3 years as Frontend Developer at Company X",
    "education": "Bachelor of Computer Science, VNU",
    "avatar_url": "https://example.com/avatars/user10.jpg",
    "cv_url": "https://example.com/cv/user10.pdf"
  }
}
```

**Error (401 Unauthorized):**
```json
{ "success": false, "error": "Unauthorized" }
```

---

## PUT /profiles/me (Protected)
Update the authenticated user's profile. Creates profile if not exists.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "full_name": "Nguyen Van B",
  "phone": "0987654321",
  "address": "456 Le Loi, HCM",
  "dob": "1996-12-20",
  "skills": "Python, Django, PostgreSQL",
  "experience": "5 years backend development",
  "education": "Master of IT, HUST",
  "avatar_url": "https://example.com/avatar-new.jpg",
  "cv_url": "https://example.com/cv-new.pdf"
}
```

**Field Validations:**
- `full_name`: max 255 characters
- `phone`: max 20 characters
- `address`: max 500 characters
- `dob`: ISO date (YYYY-MM-DD)
- `skills`, `experience`, `education`: max 5000 characters each
- `avatar_url`, `cv_url`: must be valid URLs

**Example Request:**
```bash
curl -X PUT "http://localhost:5000/api/v1/profiles/me" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Nguyen Van B",
    "phone": "0987654321",
    "skills": "Python, Django, PostgreSQL",
    "experience": "5 years backend development"
  }'
```

**Example Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 5,
    "user_id": 10,
    "full_name": "Nguyen Van B",
    "phone": "0987654321",
    "address": "123 Nguyen Trai, Hanoi",
    "dob": "1995-05-15",
    "skills": "Python, Django, PostgreSQL",
    "experience": "5 years backend development",
    "education": "Bachelor of Computer Science, VNU",
    "avatar_url": "https://example.com/avatars/user10.jpg",
    "cv_url": "https://example.com/cv/user10.pdf"
  }
}
```

**Error (400 Validation):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "avatar_url", "message": "avatar_url must be a valid URL", "value": "not-a-url" }
  ]
}
```

---

## GET /profiles/:userId (Public)
Get user profile by user ID. Public endpoint for viewing candidate profiles.

**URL Parameters:**
- `userId`: integer, min 1

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/profiles/10"
```

**Example Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 5,
    "user_id": 10,
    "full_name": "Nguyen Van A",
    "phone": "0912345678",
    "address": "123 Nguyen Trai, Hanoi",
    "dob": "1995-05-15",
    "skills": "JavaScript, React, Node.js",
    "experience": "3 years as Frontend Developer",
    "education": "Bachelor of Computer Science, VNU",
    "avatar_url": "https://example.com/avatars/user10.jpg",
    "cv_url": "https://example.com/cv/user10.pdf"
  }
}
```

**Error (404 Not Found):**
```json
{ "success": false, "error": "Profile not found" }
```

**Error (400 Invalid ID):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "userId", "message": "Invalid user ID", "value": "abc" }
  ]
}
```

---

## Common Use Cases

### 1. User completes their profile after registration
```bash
# After login, get token
TOKEN="<your_token>"

# Get current profile (will auto-create if empty)
curl -X GET "http://localhost:5000/api/v1/profiles/me" \
  -H "Authorization: Bearer $TOKEN"

# Update profile with details
curl -X PUT "http://localhost:5000/api/v1/profiles/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Tran Thi C",
    "phone": "0911222333",
    "dob": "1998-03-10",
    "skills": "Java, Spring Boot, MySQL",
    "education": "Bachelor IT, NEU"
  }'
```

### 2. Employer views candidate profile
```bash
# Public endpoint, no auth needed
curl -X GET "http://localhost:5000/api/v1/profiles/15"
```

---

## Notes

- Each user has **one** profile (user_id is unique)
- Profile is **auto-created** on first GET/PUT if not exists
- All update fields are **optional** - send only what you want to change
- `user_id` cannot be changed via API
- Use valid URLs for `avatar_url` and `cv_url`
