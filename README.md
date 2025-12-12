# Job Portal Project

A full-stack job portal application with React frontend and Node.js/Express backend.

## Project Structure

```
PRJ#_CURSOR/
├── frontend/          # ReactJS frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Main page components
│   │   ├── services/      # API service functions
│   │   ├── context/       # Context API for state management
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Helper functions and constants
│   │   └── assets/        # Static assets (images, icons, fonts)
│   ├── public/        # Public static files
│   └── package.json
│
└── backend/           # Node.js + Express backend API
    ├── src/
    │   ├── app.js         # Entry point, Express server initialization
    │   ├── config/        # Configuration (DB, JWT, environment)
    │   ├── controllers/   # Request handlers
    │   ├── services/      # Business logic
    │   ├── models/        # Database models
    │   ├── routes/       # API routes (public, jobseeker, employer)
    │   ├── middlewares/  # Auth, error handling, validation
    │   ├── utils/         # Helper functions
    │   └── seeders/       # Database seeding scripts
    └── package.json
```

## Features

- **Frontend**: ReactJS with component-based architecture
- **Backend**: Node.js + ExpressJS RESTful API
- **Database**: PostgreSQL
- **Authentication**: JWT-based authentication
- **Role-based Access**: Separate routes for jobseekers and employers

## Getting Started

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure .env file with your database credentials
npm run dev
```

## Architecture

The project follows a scalable, maintainable architecture:
- **Separation of Concerns**: Clear separation between frontend and backend
- **Modular Structure**: Easy to add new features without breaking existing code
- **Role-based Routes**: Backend routes organized by user roles (public, jobseeker, employer)
- **Service Layer**: Business logic separated from controllers
- **Reusable Components**: Frontend components designed for reusability

