# College Complaint Management System

A full-stack complaint tracking platform for colleges and universities that lets students report issues and lets admins manage, assign, resolve, and close complaints efficiently.

## Features

### Student Features
- Register and login securely
- Submit complaints with title, category, description, and location
- Upload multiple attachments (images and PDFs)
- Track complaint lifecycle and status
- View complaint details, comments, and resolution notes
- Close resolved complaints
- Submit feedback after resolution
- View personal dashboard statistics

### Admin Features
- Secure admin login
- View all complaints and analytics
- Search, filter, and paginate complaints
- Change complaint status and priority
- Assign departments and staff
- Add comments and resolution details
- Manage departments and staff
- View admin dashboard with live statistics
- Manage users and system records

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide React

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcryptjs
- Multer
- Mongoose

### Database
- MongoDB
- In-memory fallback for local tests and demos

## Project Structure

```text
college-complaint-management-system/
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seeds/
│   ├── services/
│   ├── test/
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .env.example
├── package.json
├── spec.md
└── README.md
```

## Installation

```bash
git clone <your-repo-url>
cd college-complaint-management-system
npm install
npm run install:server
npm run install:client
```

## Environment Setup

Create a root `.env` file if needed for local runtime and also configure the backend environment.

### Root Example

```env
PORT=5000
NODE_ENV=development
MONGO_URI=memory
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Server Env Example

```bash
cp server/.env.example server/.env
```

The project includes a convenient in-memory database fallback. For production or local MongoDB, set `MONGO_URI` to your MongoDB connection string.

## Database Setup

### Option 1: In-Memory mode (default)
- No external database is required.
- Useful for demoing and testing locally.

### Option 2: MongoDB Atlas / Local MongoDB
Update the server environment:

```env
MONGO_URI=mongodb://localhost:27017/ccms
```

or

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ccms
```

## Running the Project

### Start both frontend and backend together

```bash
npm run dev
```

### Start individually

```bash
npm run dev:server
npm run dev:client
```

### Production build

```bash
npm run build:client
```

## Demo Accounts

Seed data is automatically created when the database is empty.

### Admin
- Email: `admin@college.com`
- Password: `Admin@123`

### Student
- Email: `student@college.com`
- Password: `Student@123`

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Complaints
- `POST /api/complaints`
- `GET /api/complaints/my`
- `GET /api/complaints/:id`
- `PUT /api/complaints/:id`
- `POST /api/complaints/:id/close`
- `POST /api/complaints/:id/feedback`
- `GET /api/complaints/:id/feedback`

### Admin
- `GET /api/admin/complaints`
- `GET /api/admin/complaints/:id`
- `PUT /api/admin/complaints/:id/status`
- `PUT /api/admin/complaints/:id/priority`
- `PUT /api/admin/complaints/:id/assign`
- `POST /api/admin/complaints/:id/comments`
- `PUT /api/admin/complaints/:id/resolve`

### Departments and Staff
- `GET /api/departments`
- `POST /api/departments`
- `PUT /api/departments/:id`
- `DELETE /api/departments/:id`
- `GET /api/staff`
- `POST /api/staff`
- `PUT /api/staff/:id`
- `DELETE /api/staff/:id`

### Dashboard
- `GET /api/dashboard/student`
- `GET /api/dashboard/admin`

## Testing

Run the E2E workflow check:

```bash
cd server
npm run test:e2e
```

This verifies the real workflow:
1. Register student
2. Login as student
3. Submit complaint
4. Admin login and review
5. Update status and assignment
6. Add comment and resolution
7. Mark as resolved
8. Student closes complaint
9. Submit feedback
10. Confirm admin dashboard statistics update

## Deployment

This project is structured for deployment with a separate frontend and backend:

- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Database: MongoDB Atlas

For deployment, set environment variables in the host platform and use the production API URL in the frontend build configuration.

## Notes

- This project includes a real backend, database connection logic, JWT auth, role-based access, file uploads, and seed data.
- Frontend and backend route protection are implemented for student and admin roles.
- The app automatically seeds demo data when the database is empty.

## License

This project is provided for educational and development use.
