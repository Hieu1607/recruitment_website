# Job API Documentation

Base URL

```
http://localhost:5000/api
```

Authentication

Protected endpoints require a JWT in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## GET /jobs (Public)
List jobs with pagination and filters.

Query parameters
- `page` (optional, default 1)
- `limit` (optional, default 10, max 100)
- `search` (optional): searches `title`, `description`, `requirements`
- `location` (optional)
- `company_id` (optional): integer

Example request

```bash
curl -X GET "http://localhost:5000/api/jobs?page=1&limit=5&search=frontend&location=Hanoi"
```

Example response (200)

```json
{
	"success": true,
	"message": "Jobs retrieved successfully",
	"data": [
		{
			"id": 101,
			"company_id": 1,
			"title": "Frontend Developer",
			"level": "Junior",
			"salary": "1000-1500 USD",
			"location": "Hanoi",
			"deadline": "2025-12-31",
			"description": "Build UI components using React.",
			"requirements": "JS, React, CSS",
			"benefits": "Health insurance, annual bonus",
			"created_at": "2025-12-14T05:00:00.000Z",
			"updated_at": "2025-12-14T05:00:00.000Z"
		}
	],
	"pagination": {
		"currentPage": 1,
		"totalPages": 10,
		"totalItems": 50,
		"itemsPerPage": 5,
		"hasNextPage": true,
		"hasPrevPage": false
	}
}
```

---

## GET /jobs/:id (Public)
Get a job by ID.

Example request

```bash
curl -X GET "http://localhost:5000/api/jobs/101"
```

Example response (200)

```json
{
	"success": true,
	"message": "Job retrieved successfully",
	"data": {
		"id": 101,
		"company_id": 1,
		"title": "Frontend Developer",
		"level": "Junior",
		"salary": "1000-1500 USD",
		"location": "Hanoi",
		"deadline": "2025-12-31",
		"description": "Build UI components using React.",
		"requirements": "JS, React, CSS",
		"benefits": "Health insurance, annual bonus",
		"created_at": "2025-12-14T05:00:00.000Z",
		"updated_at": "2025-12-14T05:00:00.000Z"
	}
}
```

Error response (404)

```json
{ "success": false, "error": "Job not found" }
```

---

## POST /jobs (Protected)
Create a job owned by the authenticated user's company.

Headers

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

Request body

```json
{
	"company_id": 1,
	"title": "Backend Developer",
	"level": "Mid",
	"salary": "1500-2000 USD",
	"location": "HCM",
	"deadline": "2026-01-15",
	"description": "Build REST APIs using Node.js",
	"requirements": "Node.js, Express, PostgreSQL",
	"benefits": "MacBook, health care"
}
```

Example request

```bash
curl -X POST "http://localhost:5000/api/jobs" \
	-H "Authorization: Bearer <token>" \
	-H "Content-Type: application/json" \
	-d '{
		"company_id": 1,
		"title": "Backend Developer",
		"level": "Mid",
		"salary": "1500-2000 USD",
		"location": "HCM",
		"deadline": "2026-01-15",
		"description": "Build REST APIs using Node.js",
		"requirements": "Node.js, Express, PostgreSQL",
		"benefits": "MacBook, health care"
	}'
```

Example response (201)

```json
{
	"success": true,
	"message": "Job created successfully",
	"data": {
		"id": 202,
		"company_id": 1,
		"title": "Backend Developer",
		"level": "Mid",
		"salary": "1500-2000 USD",
		"location": "HCM",
		"deadline": "2026-01-15",
		"description": "Build REST APIs using Node.js",
		"requirements": "Node.js, Express, PostgreSQL",
		"benefits": "MacBook, health care",
		"created_at": "2025-12-14T06:00:00.000Z",
		"updated_at": "2025-12-14T06:00:00.000Z"
	}
}
```

Error responses

- 400 (Validation failed)

```json
{
	"success": false,
	"message": "Validation failed",
	"errors": [
		{ "field": "company_id", "message": "company_id is required and must be a positive integer", "value": 0 },
		{ "field": "title", "message": "title is required", "value": "" }
	]
}
```

- 403 (Ownership)

```json
{ "success": false, "error": "You do not own this company" }
```

---

## PUT /jobs/:id (Protected)
Update a job. Only the owner can update.

Headers

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

Example request

```bash
curl -X PUT "http://localhost:5000/api/jobs/202" \
	-H "Authorization: Bearer <token>" \
	-H "Content-Type: application/json" \
	-d '{ "title": "Senior Backend Developer", "salary": "2000-2500 USD" }'
```

Example response (200)

```json
{
	"success": true,
	"message": "Job updated successfully",
	"data": {
		"id": 202,
		"company_id": 1,
		"title": "Senior Backend Developer",
		"level": "Mid",
		"salary": "2000-2500 USD",
		"location": "HCM",
		"deadline": "2026-01-15",
		"description": "Build REST APIs using Node.js",
		"requirements": "Node.js, Express, PostgreSQL",
		"benefits": "MacBook, health care",
		"created_at": "2025-12-14T06:00:00.000Z",
		"updated_at": "2025-12-14T07:00:00.000Z"
	}
}
```

Error responses: 404 (Job not found), 403 (Permission denied)

---

## DELETE /jobs/:id (Protected)
Delete a job. Only the owner can delete.

Headers

```
Authorization: Bearer <your_jwt_token>
```

Example request

```bash
curl -X DELETE "http://localhost:5000/api/jobs/202" \
	-H "Authorization: Bearer <token>"
```

Example response (200)

```json
{ "success": true, "message": "Job deleted successfully", "data": null }
```

Error responses: 404 (Job not found), 403 (Permission denied)

---

## Validation Notes
- `company_id`: positive integer
- `title`: required, max 255
- `deadline`: ISO date (YYYY-MM-DD)
- Long text fields (`description`, `requirements`, `benefits`) have length caps for simplicity
