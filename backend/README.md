# Backend

Node.js + ExpressJS backend API with PostgreSQL database.

## Structure

- `src/app.js` - Entry point, initializes Express server
- `src/config/` - Configuration files (database, JWT, environment)
- `src/controllers/` - Request handlers that call services
- `src/services/` - Business logic and database operations
- `src/models/` - Database models/schemas
- `src/routes/` - API route definitions (public, jobseeker, employer)
- `src/middlewares/` - Authentication, error handling, validation
- `src/utils/` - Helper functions
- `src/seeders/` - Database seeding scripts and data

## Setup

1. Install dependencies: `npm install`
2. Create `.env` file from `.env.example`
3. Configure database connection
4. Run migrations/seeding: `npm run seed`
5. Start server: `npm run dev`

## Seeding Database

The seeder script loads job data from `src/seeders/data/jobs.json` and inserts it into PostgreSQL.

### Job Data Format

The JSON file should contain an array of job objects with the following Vietnamese field names:
- `id_cong_viec`: Job ID (optional, auto-generated)
- `ten_cong_viec`: Job title
- `level`: Job level (e.g., "Senior", "Junior")
- `muc_luong`: Salary range (e.g., "25-40 triệu VND")
- `dia_diem_lam_viec`: Work location
- `thoi_han_tuyen_dung`: Application deadline (DD/MM/YYYY format)
- `mo_ta_cong_viec`: Job description
- `yeu_cau_cong_viec`: Job requirements
- `ten_cong_ty`: Company name
- `gioi_thieu_cong_ty`: Company description
- `phuc_loi`: Benefits
- `quy_mo_cong_ty`: Company size
- `loai_hinh_hoat_dong`: Company type

### Running the Seeder

```bash
npm run seed
```

The seeder will:
1. Create `companies` and `jobs` tables if they don't exist
2. Load jobs from `src/seeders/data/jobs.json`
3. Create companies if they don't exist
4. Insert all jobs into the database
5. Print a success message with statistics 

