# JobApplication API Documentation

Base URL: `http://localhost:5000/api/v1`

Authentication: Protected endpoints require JWT in `Authorization: Bearer <token>` header.

---

## POST /applications (Protected)
Apply for a job. Each user can only apply once per job.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "job_id": 101
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/v1/applications" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "job_id": 101 }'
```

**Example Response (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": 1,
    "job_id": 101,
    "user_id": 10,
    "status": "applied",
    "created_at": "2025-12-16T10:30:00.000Z"
  }
}
```

**Error (409 - Already Applied):**
```json
{
  "success": false,
  "error": "You have already applied for this job"
}
```

**Error (404 - Job Not Found):**
```json
{ "success": false, "error": "Job not found" }
```

---

## GET /applications/my-applications (Protected)
List authenticated user's job applications with pagination and filters.

**Query Parameters:**
- `page` (optional, default 1)
- `limit` (optional, default 10, max 100)
- `status` (optional): applied, under_review, interview_scheduled, offered, rejected
- `job_id` (optional): filter by specific job

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/applications/my-applications?page=1&limit=10&status=under_review" \
  -H "Authorization: Bearer <token>"
```

**Example Response (200):**
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": [
    {
      "id": 1,
      "job_id": 101,
      "user_id": 10,
      "status": "under_review",
      "created_at": "2025-12-16T10:30:00.000Z",
      "job": {
        "id": 101,
        "title": "Frontend Developer",
        "company_id": 1,
        "location": "Hanoi",
        "salary": "1000-1500 USD"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## GET /applications/job/:jobId (Protected)
Get all applications for a job. Only job owner (employer) can view.

**URL Parameters:**
- `jobId`: integer, positive

**Query Parameters:**
- `page` (optional, default 1)
- `limit` (optional, default 10, max 100)
- `status` (optional): applied, under_review, interview_scheduled, offered, rejected
- `user_id` (optional): filter by specific applicant

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/applications/job/101?page=1&limit=20&status=applied" \
  -H "Authorization: Bearer <token>"
```

**Example Response (200):**
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": [
    {
      "id": 1,
      "job_id": 101,
      "user_id": 10,
      "status": "applied",
      "created_at": "2025-12-16T10:30:00.000Z"
    },
    {
      "id": 2,
      "job_id": 101,
      "user_id": 11,
      "status": "applied",
      "created_at": "2025-12-16T10:45:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 2,
    "itemsPerPage": 20,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Error (403 - Not Job Owner):**
```json
{ "success": false, "error": "You do not own this job" }
```

---

## GET /applications/:id (Public)
Get single application details by ID.

**URL Parameters:**
- `id`: integer, positive

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/applications/1"
```

**Example Response (200):**
```json
{
  "success": true,
  "message": "Application retrieved successfully",
  "data": {
    "id": 1,
    "job_id": 101,
    "user_id": 10,
    "status": "under_review",
    "created_at": "2025-12-16T10:30:00.000Z"
  }
}
```

**Error (404):**
```json
{ "success": false, "error": "Application not found" }
```

---

## PUT /applications/:id (Protected)
Update application status. Only job owner (employer) can update.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "interview_scheduled"
}
```

**Valid Statuses:**
- `applied` - Initial status
- `under_review` - Being reviewed
- `interview_scheduled` - Interview scheduled
- `offered` - Job offered
- `rejected` - Rejected

**Example Request:**
```bash
curl -X PUT "http://localhost:5000/api/v1/applications/1" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "status": "interview_scheduled" }'
```

**Example Response (200):**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "id": 1,
    "job_id": 101,
    "user_id": 10,
    "status": "interview_scheduled",
    "created_at": "2025-12-16T10:30:00.000Z"
  }
}
```

**Error (403 - Permission Denied):**
```json
{ "success": false, "error": "You do not have permission to update this application" }
```

---

## DELETE /applications/:id (Protected)
Delete application. Applicant or job owner can delete.

**Headers:**
```
Authorization: Bearer <token>
```

**Example Request:**
```bash
curl -X DELETE "http://localhost:5000/api/v1/applications/1" \
  -H "Authorization: Bearer <token>"
```

**Example Response (200):**
```json
{ "success": true, "message": "Application deleted successfully", "data": null }
```

**Error (403 - Permission Denied):**
```json
{ "success": false, "error": "You do not have permission to delete this application" }
```

---

## Common Workflows

### 1. User applies for jobs
```bash
TOKEN="<your_token>"

# Apply for job ID 101
curl -X POST "http://localhost:5000/api/v1/applications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "job_id": 101 }'

# View my applications
curl -X GET "http://localhost:5000/api/v1/applications/my-applications" \
  -H "Authorization: Bearer $TOKEN"

# Check pending interviews
curl -X GET "http://localhost:5000/api/v1/applications/my-applications?status=interview_scheduled" \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Employer reviews job applications
```bash
EMPLOYER_TOKEN="<employer_token>"

# Get all applications for job 101
curl -X GET "http://localhost:5000/api/v1/applications/job/101" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN"

# Get only applied status
curl -X GET "http://localhost:5000/api/v1/applications/job/101?status=applied" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN"

# Move to under review
curl -X PUT "http://localhost:5000/api/v1/applications/1" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "under_review" }'

# Schedule interview
curl -X PUT "http://localhost:5000/api/v1/applications/1" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "interview_scheduled" }'
```

---

## Notes

- Status flow: `applied` → `under_review` → `interview_scheduled` → `offered` or `rejected`
- Each user can apply only **once** per job
- User can withdraw application by **deleting** it
- Employer can update status or delete applications
- Applications include related job info in list endpoints
