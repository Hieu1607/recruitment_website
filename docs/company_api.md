# Recruitment Website API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Company Endpoints

### 1. Get All Companies (Public)
Retrieve a paginated list of companies with optional filters.

**Endpoint:** `GET /companies`

**Query Parameters:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 100)
- `search` (optional): Search term for company name or description (max: 255 chars)
- `type` (optional): Filter by company type (max: 100 chars)
- `size` (optional): Filter by company size. Valid values: `1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1001-5000`, `5000+`

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/companies?page=1&limit=10&search=tech&size=51-200"
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Tech Solutions Inc",
      "description": "Leading technology consulting firm",
      "size": "51-200",
      "type": "Technology",
      "address": "123 Tech Street, Silicon Valley, CA",
      "website": "https://techsolutions.com",
      "logo_company_url": "https://techsolutions.com/logo.png",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "name": "Innovation Tech Labs",
      "description": "Research and development company",
      "size": "51-200",
      "type": "Technology",
      "address": "456 Innovation Ave, San Francisco, CA",
      "website": "https://innovationlabs.com",
      "logo_company_url": "https://innovationlabs.com/assets/logo.jpg",
      "createdAt": "2024-01-16T14:20:00.000Z",
      "updatedAt": "2024-01-16T14:20:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 2. Get Company by ID (Public)
Retrieve detailed information about a specific company.

**Endpoint:** `GET /companies/:id`

**URL Parameters:**
- `id` (required): Company ID (integer, min: 1)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/companies/1"
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Company retrieved successfully",
  "data": {
    "id": 1,
    "name": "Tech Solutions Inc",
    "description": "Leading technology consulting firm specializing in cloud solutions and digital transformation",
    "size": "51-200",
    "type": "Technology",
    "address": "123 Tech Street, Silicon Valley, CA 94025",
    "website": "https://techsolutions.com",
    "logo_company_url": "https://techsolutions.com/logo.png",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Company not found"
}
```

---

### 3. Create Company (Protected)
Create a new company profile. Requires authentication. Each user can only create one company.

**Endpoint:** `POST /companies`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: multipart/form-data
```

**Request Body (form-data):**
- `name` (text, required): Company name (2-255 characters)
- `description` (text, optional): Company description (max 5000 characters)  
- `size` (text, optional): Company size (`1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1001-5000`, `5000+`)
- `type` (text, optional): Company type (max 100 characters)
- `address` (text, optional): Company address (max 500 characters)
- `website` (text, optional): Company website URL
- `logo_company_url` (file, optional): Company logo image file (JPEG, PNG, GIF, WebP, max 10MB)

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/companies" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "name=Tech Solutions Inc" \
  -F "description=Leading technology consulting firm" \
  -F "size=51-200" \
  -F "type=Technology" \
  -F "address=123 Tech Street, Silicon Valley, CA 94025" \
  -F "website=https://techsolutions.com" \
  -F "logo_company_url=@/path/to/company_logo.png"
```
```

**Example Response (201 Created):**
```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "id": 15,
    "name": "Tech Solutions Inc",
    "description": "Leading technology consulting firm",
    "size": "51-200",
    "type": "Technology",
    "address": "123 Tech Street, Silicon Valley, CA 94025",
    "website": "https://techsolutions.com",
    "logo_company_url": "http://localhost:9000/company-logos/company_15/1640261400000_logo.png",
    "user_id": 42,
    "createdAt": "2024-12-14T10:30:00.000Z",
    "updatedAt": "2024-12-14T10:30:00.000Z"
  }
}
```

**Error Response (400 Bad Request - User already has a company):**
```json
{
  "success": false,
  "error": "User already has a company registered"
}
```

**Error Response (400 Bad Request - Validation errors):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Company name is required",
      "value": ""
    },
    {
      "field": "website",
      "message": "Invalid website URL format",
      "value": "not-a-valid-url"
    }
  ]
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

### 4. Get My Company (Protected)
Retrieve the authenticated user's company.

**Endpoint:** `GET /companies/my/company`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/companies/my/company" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Your company retrieved successfully",
  "data": {
    "id": 15,
    "name": "Tech Solutions Inc",
    "description": "Leading technology consulting firm",
    "size": "51-200",
    "type": "Technology",
    "address": "123 Tech Street, Silicon Valley, CA 94025",
    "website": "https://techsolutions.com",
    "user_id": 42,
    "createdAt": "2024-12-14T10:30:00.000Z",
    "updatedAt": "2024-12-14T10:30:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "No company found for this user"
}
```

---

### 5. Update Company (Protected)
Update an existing company. Only the company owner can update their company.

**Endpoint:** `PUT /companies/:id`

**URL Parameters:**
- `id` (required): Company ID (integer, min: 1)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: multipart/form-data
```

**Request Body (form-data, all fields optional):**
- `name` (text): Company name (2-255 characters)
- `description` (text): Company description (max 5000 characters)
- `size` (text): Company size (`1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1001-5000`, `5000+`)
- `type` (text): Company type (max 100 characters)
- `address` (text): Company address (max 500 characters) 
- `website` (text): Company website URL
- `logo_company_url` (file): New company logo image file (JPEG, PNG, GIF, WebP, max 10MB)

**Field Validations:**
- `name` (optional): 2-255 characters, cannot be empty if provided
- `description` (optional): max 5000 characters
- `size` (optional): Valid values: `1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1001-5000`, `5000+`, or empty string
- `type` (optional): max 100 characters
- `address` (optional): max 500 characters
- `website` (optional): Valid URL format

**Example Request:**
```bash
**Example Request:**
```bash
curl -X PUT "http://localhost:5000/api/companies/15" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "name=Tech Solutions International" \
  -F "size=201-500" \
  -F "website=https://techsolutions-intl.com" \
  -F "logo_company_url=@/path/to/new_company_logo.png"
```
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Company updated successfully",
  "data": {
    "id": 15,
    "name": "Tech Solutions International",
    "description": "Leading technology consulting firm",
    "size": "201-500",
    "type": "Technology",
    "address": "123 Tech Street, Silicon Valley, CA 94025",
    "website": "https://techsolutions-intl.com",
    "logo_company_url": "http://localhost:9000/company-logos/company_15/1640261400000_new_logo.png",
    "user_id": 42,
    "createdAt": "2024-12-14T10:30:00.000Z",
    "updatedAt": "2024-12-14T11:45:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Company not found"
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "error": "You do not have permission to update this company"
}
```

---

### 6. Delete Company (Protected)
Delete a company. Only the company owner can delete their company.

**Endpoint:** `DELETE /companies/:id`

**URL Parameters:**
- `id` (required): Company ID (integer, min: 1)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Example Request:**
```bash
curl -X DELETE "http://localhost:5000/api/companies/15" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Company deleted successfully",
  "data": null
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Company not found"
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "error": "You do not have permission to delete this company"
}
```

---

## Common Error Responses

### 400 Bad Request
Invalid request data or validation errors.
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Company name must be between 2 and 255 characters",
      "value": "A"
    }
  ]
}
```

### 401 Unauthorized
Missing or invalid authentication token.
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 403 Forbidden
User doesn't have permission to perform the action.
```json
{
  "success": false,
  "error": "You do not have permission to update this company"
}
```

### 404 Not Found
Requested resource not found.
```json
{
  "success": false,
  "error": "Company not found"
}
```

### 500 Internal Server Error
Server error occurred.
```json
{
  "success": false,
  "error": "An unexpected error occurred"
}
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- The `user_id` field is included in responses for "My Company" endpoint but excluded from public company listings
- Company size values are predefined: `1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1001-5000`, `5000+`
- Search is case-insensitive and searches both company name and description
- Pagination uses 1-based indexing (page 1 is the first page)
