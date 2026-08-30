# College Complaint Management System

## 1. Project Overview

Build a full-stack web-based **College Complaint Management System (CCMS)** that allows students to submit complaints about college facilities and services, while administrators can review, assign, update, resolve, and close those complaints.

The system should replace the traditional manual complaint process with a centralized digital platform.

### Main Workflow

```text
Student
   ↓
Submit Complaint
   ↓
Admin Reviews
   ↓
Assign Department / Staff
   ↓
In Progress
   ↓
Resolved
   ↓
Student Reviews Resolution
   ↓
Closed
```

---

# 2. Project Goals

The application must:

1. Allow students to create accounts and securely log in.
2. Allow students to submit complaints digitally.
3. Allow students to attach images/documents to complaints.
4. Categorize complaints.
5. Track complaint status.
6. Allow administrators to manage complaints.
7. Allow administrators to assign complaints to departments/staff.
8. Allow administrators to add comments and updates.
9. Allow administrators to set complaint priority.
10. Store all complaint data in a database.
11. Provide search and filtering.
12. Provide basic complaint statistics.
13. Provide a clean responsive interface.
14. Provide proper frontend-backend integration.
15. Be deployable as a working web application.

---

# 3. User Roles

The system must have two primary roles.

## 3.1 Student

Students can:

* Register
* Login
* Logout
* View dashboard
* Submit complaints
* Upload attachments
* View their complaints
* Search/filter their complaints
* View complaint details
* Track complaint status
* View administrator comments
* View resolution details
* Close a resolved complaint
* Give feedback/rating after resolution

Students must NOT be able to:

* View other students' complaints
* Change complaint status
* Assign complaints
* Access admin dashboard
* Manage departments

---

## 3.2 Admin

Administrators can:

* Login
* View admin dashboard
* View all complaints
* Search complaints
* Filter complaints
* View complaint details
* Change complaint status
* Set complaint priority
* Assign department
* Assign staff
* Add comments
* Add resolution details
* View complaint history
* Manage departments
* Manage staff
* View statistics
* Manage users

Admin must have complete complaint management access.

---

# 4. Technology Stack

Use a modern, simple, maintainable full-stack architecture.

## Frontend

Use:

* React
* Vite
* JavaScript or TypeScript
* Tailwind CSS
* React Router
* Axios
* Lucide React icons

## Backend

Use:

* Node.js
* Express.js

## Database

Use:

* MongoDB
* Mongoose

## Authentication

Use:

* JWT authentication
* bcrypt/bcryptjs for password hashing

## File Upload

Use:

* Multer

For development, uploaded files can be stored locally.

The architecture should make it easy to replace local storage with Cloudinary or another cloud storage provider later.

---

# 5. Project Structure

Create the project using this structure:

```text
college-complaint-management-system/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── .env.example
├── README.md
└── spec.md
```

---

# 6. Database Design

Create the following MongoDB collections.

---

## 6.1 User

Fields:

```text
_id
name
email
password
studentId
phone
department
year
role
profileImage
createdAt
updatedAt
```

### Role values

```text
student
admin
```

Student-specific fields such as `studentId`, `department`, and `year` should be required for student accounts.

---

# 6.2 Complaint

Fields:

```text
_id
complaintId
title
description
category
location
priority
status
submittedBy
assignedDepartment
assignedStaff
attachments
adminComments
resolutionDetails
resolvedAt
closedAt
createdAt
updatedAt
```

### Complaint ID

Generate a human-readable ID such as:

```text
CMP-2026-0001
CMP-2026-0002
CMP-2026-0003
```

---

## 6.3 Complaint Categories

Initially support:

```text
Classroom
Laboratory
Hostel
Wi-Fi / Internet
Infrastructure
Transportation
Cleanliness
Library
Electricity
Water Supply
Security
Other
```

Admin should be able to manage categories in the future.

---

## 6.4 Complaint Priority

Allowed values:

```text
Low
Medium
High
Critical
```

Default:

```text
Medium
```

---

## 6.5 Complaint Status

Use exactly these statuses:

```text
Submitted
Under Review
Assigned
In Progress
Resolved
Closed
```

Normal workflow:

```text
Submitted
↓
Under Review
↓
Assigned
↓
In Progress
↓
Resolved
↓
Closed
```

Admin should be able to move complaints through these states.

---

## 6.6 Department

Fields:

```text
_id
name
description
createdAt
updatedAt
```

Example departments:

```text
IT Department
Maintenance
Hostel Department
Transport Department
Library
Administration
Security
Housekeeping
Electrical Department
```

---

## 6.7 Staff

Fields:

```text
_id
name
email
phone
department
designation
createdAt
updatedAt
```

---

## 6.8 Complaint Comment

Fields:

```text
_id
complaint
user
comment
createdAt
```

Comments should display the author and timestamp.

---

## 6.9 Feedback

Fields:

```text
_id
complaint
student
rating
comment
createdAt
```

Rating:

```text
1 to 5
```

Only allow feedback after the complaint has been resolved.

---

# 7. Authentication

Implement secure authentication.

## Registration

Student registration form:

* Full Name
* Student ID
* Email
* Phone
* Department
* Year
* Password
* Confirm Password

Validate:

* Required fields
* Valid email
* Password minimum 6 characters
* Password confirmation
* Unique email
* Unique student ID

---

## Login

Login using:

```text
Email
Password
```

After successful login:

```text
Student → Student Dashboard
Admin → Admin Dashboard
```

Store JWT securely.

Protect all authenticated routes.

Implement role-based authorization.

---

# 8. Student Pages

Create the following pages.

## 8.1 Landing Page

Route:

```text
/
```

Include:

* Application name
* Short description
* "Login" button
* "Register" button
* Features section
* Simple professional design

---

## 8.2 Student Login

Route:

```text
/login
```

Fields:

* Email
* Password

Include:

* Login button
* Register link
* Error messages
* Loading state

---

## 8.3 Student Registration

Route:

```text
/register
```

Create the registration form described above.

---

# 9. Student Dashboard

Route:

```text
/student/dashboard
```

Display:

### Summary Cards

```text
Total Complaints
Submitted
In Progress
Resolved
Closed
```

Example:

```text
Total Complaints: 12
Submitted: 2
In Progress: 4
Resolved: 3
Closed: 3
```

Include:

* Recent complaints
* Complaint status badges
* Quick "Submit Complaint" button
* "View All Complaints" button

---

# 10. Submit Complaint

Route:

```text
/student/complaints/new
```

Form fields:

### Complaint Title

Example:

```text
Wi-Fi not working in Computer Lab
```

### Category

Dropdown.

### Description

Large textarea.

### Location

Example:

```text
Computer Engineering Department - Lab 2
```

### Priority

Student can select:

```text
Low
Medium
High
```

Do not allow students to select Critical.

Admins can change priority to Critical.

### Attachment

Allow:

* JPG
* JPEG
* PNG
* PDF

Maximum file size:

```text
5 MB per file
```

Allow multiple attachments.

### Submit

After submission:

Show:

```text
Complaint submitted successfully.
Complaint ID: CMP-2026-0001
```

Redirect to complaint details.

---

# 11. Student Complaint List

Route:

```text
/student/complaints
```

Display complaints in a table/card layout.

Columns:

```text
Complaint ID
Title
Category
Priority
Status
Date
Action
```

Actions:

```text
View Details
```

Implement:

* Search
* Status filter
* Category filter
* Priority filter
* Date sorting

Students should only see their own complaints.

---

# 12. Complaint Details

Route:

```text
/student/complaints/:id
```

Display:

```text
Complaint ID
Title
Category
Description
Location
Priority
Current Status
Submitted Date
Assigned Department
Assigned Staff
Attachments
```

---

## Complaint Timeline

Show a visual timeline:

```text
✓ Submitted
     ↓
✓ Under Review
     ↓
✓ Assigned
     ↓
● In Progress
     ↓
○ Resolved
     ↓
○ Closed
```

Each completed stage should show:

* Status
* Date/time

---

## Admin Updates

Display administrator comments.

Example:

```text
Admin
"The Wi-Fi router has been checked. The issue has been forwarded
to the IT department."

28 Aug 2026, 10:30 AM
```

---

## Resolution

When resolved, display:

```text
Resolution Details
Resolved Date
Resolved By
```

---

# 13. Student Complaint Closure

When status becomes:

```text
Resolved
```

the student should see:

```text
Mark as Closed
```

button.

When clicked:

```text
Resolved → Closed
```

Ask for confirmation before closing.

---

# 14. Student Feedback

After a complaint is resolved/closed, show:

```text
Rate Resolution

★ ★ ★ ★ ★

Comment
[________________________]

Submit Feedback
```

Do not allow multiple feedback submissions for the same complaint.

---

# 15. Admin Dashboard

Route:

```text
/admin/dashboard
```

Create a professional admin dashboard.

---

## Statistics Cards

Display:

```text
Total Complaints
New Complaints
Under Review
Assigned
In Progress
Resolved
Closed
Critical Complaints
```

---

## Charts

Include basic charts:

### Complaints by Status

Use a doughnut/pie chart.

### Complaints by Category

Use a bar chart.

### Complaints Over Time

Use a line chart.

Use a lightweight charting library such as Recharts.

---

# 16. Admin Complaint Management

Route:

```text
/admin/complaints
```

Display all complaints.

Columns:

```text
Complaint ID
Student
Title
Category
Department
Priority
Status
Date
Actions
```

Admin can:

* Search
* Filter by status
* Filter by category
* Filter by department
* Filter by priority
* Sort by date
* Open complaint details

---

# 17. Admin Complaint Details

Route:

```text
/admin/complaints/:id
```

Display complete complaint information.

Admin actions:

### Change Status

Dropdown:

```text
Submitted
Under Review
Assigned
In Progress
Resolved
Closed
```

### Change Priority

```text
Low
Medium
High
Critical
```

### Assign Department

Dropdown of departments.

### Assign Staff

Dropdown filtered by selected department.

### Add Comment

Textarea:

```text
Write update...
```

Button:

```text
Post Update
```

### Resolution

When resolving the complaint, require:

```text
Resolution Details
```

Example:

```text
Wi-Fi router was replaced and network connectivity
was restored in Computer Lab 2.
```

---

# 18. Status Rules

Implement logical status transitions.

Recommended transitions:

```text
Submitted → Under Review

Under Review → Assigned

Assigned → In Progress

In Progress → Resolved

Resolved → Closed
```

Admin may move a complaint backward when necessary, but the UI should ask for confirmation.

Students can only perform:

```text
Resolved → Closed
```

---

# 19. Priority Rules

Priority meanings:

### Low

Minor issue with little impact.

### Medium

Normal issue affecting some users.

### High

Important issue affecting many users.

### Critical

Major issue affecting safety, security, essential infrastructure, or a large portion of the college.

Only admins can mark a complaint as Critical.

---

# 20. Search and Filtering

Implement backend-supported search and filtering.

Search by:

```text
Complaint ID
Title
Description
Student Name
```

Filters:

```text
Status
Category
Priority
Department
Date
```

Support pagination.

Default:

```text
10 complaints per page
```

---

# 21. REST API

Create RESTful APIs.

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

---

## Student Complaints

```http
POST   /api/complaints
GET    /api/complaints/my
GET    /api/complaints/:id
PUT    /api/complaints/:id
POST   /api/complaints/:id/close
```

Students must only access their own complaints.

---

## Admin Complaints

```http
GET    /api/admin/complaints
GET    /api/admin/complaints/:id
PUT    /api/admin/complaints/:id/status
PUT    /api/admin/complaints/:id/priority
PUT    /api/admin/complaints/:id/assign
POST   /api/admin/complaints/:id/comments
PUT    /api/admin/complaints/:id/resolve
```

---

## Departments

```http
GET    /api/departments
POST   /api/departments
PUT    /api/departments/:id
DELETE /api/departments/:id
```

---

## Staff

```http
GET    /api/staff
POST   /api/staff
PUT    /api/staff/:id
DELETE /api/staff/:id
```

---

## Dashboard

```http
GET /api/student/dashboard
GET /api/admin/dashboard
```

---

## Feedback

```http
POST /api/complaints/:id/feedback
GET  /api/complaints/:id/feedback
```

---

# 22. API Response Format

Use consistent JSON responses.

### Success

```json
{
  "success": true,
  "message": "Complaint created successfully",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Unable to create complaint",
  "error": "Validation failed"
}
```

---

# 23. Middleware

Create:

```text
authMiddleware
roleMiddleware
errorMiddleware
uploadMiddleware
validationMiddleware
```

### authMiddleware

Verify JWT.

### roleMiddleware

Check:

```text
student
admin
```

### errorMiddleware

Provide centralized error handling.

### uploadMiddleware

Validate:

* File type
* File size
* Number of files

---

# 24. Security Requirements

Implement:

* Password hashing with bcrypt
* JWT authentication
* Protected routes
* Role-based authorization
* Input validation
* File type validation
* File size validation
* CORS configuration
* Environment variables
* Do not expose passwords in API responses
* Sanitize user input
* Never store plain-text passwords

Create:

```text
.env.example
```

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

---

# 25. UI/UX Requirements

The application should look like a modern college management portal.

Design requirements:

* Clean
* Professional
* Minimal
* Responsive
* Mobile friendly
* Accessible
* Easy navigation

Use:

* Cards
* Tables
* Status badges
* Modal dialogs
* Dropdowns
* Toast notifications
* Loading skeletons
* Empty states
* Confirmation dialogs

---

# 26. Color / Status System

Use clear visual status indicators.

```text
Submitted      → Neutral
Under Review   → Blue
Assigned       → Purple
In Progress    → Orange
Resolved       → Green
Closed         → Gray
Critical       → Red
```

Do not rely only on colors. Always include text labels.

---

# 27. Navigation

## Student Navigation

```text
Dashboard
My Complaints
Submit Complaint
Profile
Logout
```

## Admin Navigation

```text
Dashboard
All Complaints
Departments
Staff
Users
Analytics
Profile
Logout
```

Use a sidebar on desktop and a collapsible/mobile navigation on smaller screens.

---

# 28. Notifications

Implement toast notifications for:

* Login success
* Registration success
* Complaint submitted
* Complaint updated
* Complaint assigned
* Status changed
* Resolution added
* Complaint closed
* Feedback submitted
* Errors

Email notifications are optional and should NOT block the core implementation.

---

# 29. File Attachments

Students can upload complaint evidence.

Allowed:

```text
.jpg
.jpeg
.png
.pdf
```

Maximum:

```text
5 MB per file
```

Display uploaded files on the complaint details page.

Images should have preview functionality.

PDF files should have an open/view option.

---

# 30. Complaint History

Every important complaint update should be recorded.

Create a history/timeline containing:

```text
Status changed
Priority changed
Department assigned
Staff assigned
Comment added
Resolution added
Complaint closed
```

Each record should contain:

```text
Action
Performed By
Previous Value
New Value
Timestamp
```

This history must be visible on the complaint details page.

---

# 31. Dashboard Statistics

Student dashboard:

```text
Total
Submitted
In Progress
Resolved
Closed
```

Admin dashboard:

```text
Total
Submitted
Under Review
Assigned
In Progress
Resolved
Closed
Critical
```

Calculate statistics from the database rather than hardcoding values.

---

# 32. Seed Data

Create a database seed script.

Create:

### Admin

```text
Name: System Administrator
Email: admin@college.com
Password: Admin@123
Role: admin
```

### Sample Departments

```text
IT Department
Maintenance
Hostel Department
Transport Department
Library
Administration
Security
Housekeeping
```

### Sample Staff

Create at least 5 staff members across different departments.

### Sample Student

```text
Name: Demo Student
Email: student@college.com
Password: Student@123
Student ID: STU001
Role: student
```

Document these credentials clearly in the README.

---

# 33. Validation

Complaint submission must validate:

```text
Title → Required, 5–100 characters
Description → Required, minimum 20 characters
Category → Required
Location → Required
Priority → Required
Attachments → Optional
```

Display user-friendly validation messages.

---

# 34. Error Handling

Handle:

* Invalid login
* Duplicate registration
* Unauthorized access
* Complaint not found
* Invalid complaint status
* Invalid file type
* File too large
* Database errors
* Server errors
* Network errors

Never show raw server/database errors to users.

---

# 35. Loading and Empty States

Every page requiring API data must have:

### Loading State

Show skeleton loaders or loading indicators.

### Empty State

Example:

```text
No complaints found.

Submit your first complaint to get started.
```

### Error State

Example:

```text
Unable to load complaints.

Try Again
```

---

# 36. Responsive Design

The application must work properly on:

```text
Desktop
Laptop
Tablet
Mobile
```

Important:

* Tables should become horizontally scrollable or card-based on mobile.
* Sidebar should collapse.
* Forms should adapt to screen width.
* Dashboard cards should stack on smaller screens.

---

# 37. Frontend Architecture

Create reusable components such as:

```text
Navbar
Sidebar
Button
Input
Select
Textarea
Modal
Toast
StatusBadge
PriorityBadge
ComplaintCard
ComplaintTable
ComplaintTimeline
StatsCard
LoadingSpinner
EmptyState
Pagination
ProtectedRoute
```

Avoid duplicating UI code.

---

# 38. Backend Architecture

Use MVC-style architecture.

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Models
   ↓
MongoDB
```

Keep business logic out of route files.

---

# 39. Environment Configuration

Never hardcode:

* Database credentials
* JWT secret
* Production URLs
* API keys

Use environment variables.

Provide:

```text
.env.example
```

and explain setup in README.

---

# 40. README Requirements

Create a complete README containing:

## Project Name

College Complaint Management System

## Description

Short project description.

## Features

List student and admin features.

## Tech Stack

Frontend, backend, database, authentication.

## Installation

Explain:

```bash
git clone ...
cd college-complaint-management-system
npm install
```

Then explain how to install dependencies for client and server.

## Environment Setup

Explain `.env`.

## Database Setup

Explain MongoDB configuration.

## Running the Project

Example:

```bash
npm run dev
```

or separate frontend/backend commands.

## Demo Accounts

Document seeded accounts.

## API Documentation

List major endpoints.

## Project Structure

Explain important directories.

## Deployment

Explain how to deploy frontend and backend.

---

# 41. Deployment

The final application should be deployment-ready.

Recommended architecture:

```text
Frontend → Vercel / Netlify
Backend  → Render / Railway
Database  → MongoDB Atlas
```

Do not make deployment mandatory for local development, but ensure the project can be deployed without major code changes.

---

# 42. Optional Features

After completing all core features, the agent may implement these optional features if time permits:

### Email Notifications

Send an email when:

```text
Complaint submitted
Complaint assigned
Status changed
Complaint resolved
```

### Automatic Escalation

If a complaint remains unresolved beyond a configured period:

```text
Automatically mark as High priority
```

and notify the administrator.

### AI Categorization

Use AI to suggest complaint categories based on description.

Example:

```text
"I cannot connect to Wi-Fi in Lab 3"

AI suggestion:
Category: Wi-Fi / Internet
Priority: Medium
```

AI features must be optional and must not break the application if no API key is configured.

---

# 43. Non-Functional Requirements

The application should be:

### Reliable

Prevent data loss and handle errors gracefully.

### Secure

Protect user information and authentication.

### Maintainable

Use reusable components and clean architecture.

### Scalable

Use pagination and efficient database queries.

### Usable

The interface should be understandable to a college student without training.

### Responsive

Support mobile and desktop screens.

---

# 44. Acceptance Criteria

The project is considered complete only when all of the following work.

## Authentication

* [ ] Student can register.
* [ ] Student can login.
* [ ] Admin can login.
* [ ] Invalid credentials are rejected.
* [ ] Passwords are hashed.
* [ ] Protected routes work.
* [ ] Role-based access works.

## Student

* [ ] Student dashboard works.
* [ ] Student can submit complaint.
* [ ] Student can upload attachments.
* [ ] Student can view own complaints.
* [ ] Student can search/filter complaints.
* [ ] Student can view complaint details.
* [ ] Student can track status.
* [ ] Student can view admin updates.
* [ ] Student can view resolution.
* [ ] Student can close resolved complaint.
* [ ] Student can submit feedback.

## Admin

* [ ] Admin dashboard works.
* [ ] Admin can view all complaints.
* [ ] Admin can search/filter.
* [ ] Admin can change status.
* [ ] Admin can change priority.
* [ ] Admin can assign department.
* [ ] Admin can assign staff.
* [ ] Admin can add comments.
* [ ] Admin can add resolution details.
* [ ] Admin can manage departments.
* [ ] Admin can manage staff.
* [ ] Statistics are calculated dynamically.

## Backend

* [ ] REST API works.
* [ ] MongoDB integration works.
* [ ] Authentication middleware works.
* [ ] Role authorization works.
* [ ] File upload works.
* [ ] Validation works.
* [ ] Error handling works.

## UI

* [ ] Responsive design works.
* [ ] Loading states work.
* [ ] Empty states work.
* [ ] Error states work.
* [ ] Toast notifications work.
* [ ] Navigation works.

---

# 45. Development Instructions for AI Agent

You are an autonomous senior full-stack developer.

Build this project completely according to this specification.

## Important Instructions

1. Do NOT create a mock-only frontend.
2. Implement a real backend.
3. Implement a real MongoDB database connection.
4. Implement real authentication.
5. Implement real CRUD operations.
6. Connect frontend to backend APIs.
7. Do not hardcode dashboard statistics.
8. Do not use fake complaint data in production functionality.
9. Create proper database models.
10. Create proper controllers and routes.
11. Implement validation.
12. Implement error handling.
13. Implement role-based authorization.
14. Implement file upload.
15. Make the UI responsive.
16. Keep the code modular.
17. Use reusable React components.
18. Use environment variables for secrets.
19. Create seed data for development.
20. Create a complete README.
21. Do not leave TODO placeholders for core features.
22. Test every major workflow.
23. Fix build errors before considering the project complete.

---

# 46. Required End-to-End Test

Verify this complete workflow:

```text
1. Register student
        ↓
2. Login as student
        ↓
3. Submit complaint
        ↓
4. Complaint receives CMP ID
        ↓
5. Admin logs in
        ↓
6. Admin sees complaint
        ↓
7. Admin changes status to Under Review
        ↓
8. Admin assigns department
        ↓
9. Admin assigns staff
        ↓
10. Admin changes status to In Progress
        ↓
11. Admin adds comment
        ↓
12. Admin adds resolution
        ↓
13. Admin changes status to Resolved
        ↓
14. Student sees updated status
        ↓
15. Student views resolution
        ↓
16. Student closes complaint
        ↓
17. Student submits feedback
        ↓
18. Admin dashboard statistics update
```

All steps must work using the actual database and APIs.

---

# 47. Final Deliverable

The final project must contain:

```text
✓ Complete React frontend
✓ Complete Node.js/Express backend
✓ MongoDB database integration
✓ JWT authentication
✓ Student role
✓ Admin role
✓ Complaint CRUD
✓ Complaint categories
✓ Complaint priorities
✓ Complaint statuses
✓ Department assignment
✓ Staff assignment
✓ File attachments
✓ Complaint timeline
✓ Comments
✓ Resolution details
✓ Feedback
✓ Search
✓ Filtering
✓ Pagination
✓ Student dashboard
✓ Admin dashboard
✓ Statistics
✓ Responsive UI
✓ Error handling
✓ Validation
✓ Seed data
✓ README
✓ .env.example
✓ Deployment-ready configuration
```

Do not consider the project finished until the core end-to-end workflow has been tested successfully.
