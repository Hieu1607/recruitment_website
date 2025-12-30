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
    "cv_url": [
      "https://example.com/cv/user10_cv1.pdf",
      "https://example.com/cv/user10_cv2.pdf"
    ]
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
Content-Type: multipart/form-data
```

**Request Body (form-data, all fields optional):**
- `full_name` (text): Full name (max 255 characters)
- `phone` (text): Phone number (max 20 characters)
- `address` (text): Address (max 500 characters)
- `dob` (text): Date of birth in ISO format (YYYY-MM-DD)
- `skills` (text): Skills description (max 5000 characters)
- `experience` (text): Experience description (max 5000 characters)
- `education` (text): Education description (max 5000 characters)
- `avatar` (file): Avatar image file (JPEG, PNG, GIF, WebP, max 10MB)
- `cv` (file): CV file(s) - Can upload up to 5 CV files (PDF, DOC, DOCX, max 10MB each). New CVs will be added to existing ones.

**Example Request (Single CV):**
```bash
curl -X PUT "http://localhost:5000/api/v1/profiles/me" \
  -H "Authorization: Bearer <token>" \
  -F "full_name=Nguyen Van B" \
  -F "phone=0987654321" \
  -F "skills=Python, Django, PostgreSQL" \
  -F "experience=5 years backend development" \
  -F "avatar=@/path/to/avatar.jpg" \
  -F "cv=@/path/to/cv.pdf"
```

**Example Request (Multiple CVs):**
```bash
curl -X PUT "http://localhost:5000/api/v1/profiles/me" \
  -H "Authorization: Bearer <token>" \
  -F "full_name=Nguyen Van B" \
  -F "cv=@/path/to/cv_english.pdf" \
  -F "cv=@/path/to/cv_vietnamese.pdf" \
  -F "cv=@/path/to/cv_detailed.pdf"
```
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
    "avatar_url": "http://localhost:9000/avatars/user_10/1640261400000_avatar.jpg",
    "cv_url": [
      "http://localhost:9000/resumes/user_10/1640261400000_cv_english.pdf",
      "http://localhost:9000/resumes/user_10/1640261401000_cv_vietnamese.pdf",
      "http://localhost:9000/resumes/user_10/1640261402000_cv_detailed.pdf"
    ]
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
    "avatar_url": "http://localhost:9000/avatars/user_10/1640261400000_avatar.jpg",
    "cv_url": [
      "http://localhost:9000/resumes/user_10/1640261400000_cv.pdf"
    ]
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

## DELETE /profiles/me (Protected)
Delete the authenticated user's profile and associated files (avatar, CV).

**Headers:**
```
Authorization: Bearer <token>
```

**Example Request:**
```bash
curl -X DELETE "http://localhost:5000/api/v1/profiles/me" \
  -H "Authorization: Bearer <token>"
```

**Example Response (200):**
```json
{
  "success": true,
  "message": "Profile deleted successfully",
  "data": null
}
```

**Error (404 Not Found):**
```json
{ "success": false, "error": "Profile not found" }
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

# Update profile with details and files
curl -X PUT "http://localhost:5000/api/v1/profiles/me" \
  -H "Authorization: Bearer $TOKEN" \
  -F "full_name=Tran Thi C" \
  -F "phone=0911222333" \
  -F "dob=1998-03-10" \
  -F "skills=Java, Spring Boot, MySQL" \
  -F "education=Bachelor IT, NEU" \
  -F "avatar=@/path/to/profile_photo.jpg" \
  -F "cv=@/path/to/resume.pdf"
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
