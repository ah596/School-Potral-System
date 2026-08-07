# School Portal

A comprehensive school management system built with React and Node.js.

## Features

- **Student Management**: Track student information, grades, and attendance
- **Teacher Management**: Manage teacher profiles, subjects, and class assignments
- **Admin Dashboard**: Complete administrative control panel
- **Attendance Tracking**: Monitor student and teacher attendance
- **Grade Management**: Record and track student test scores
- **Notices**: Post and manage school announcements

## Tech Stack

### Frontend
- React 19
- React Router DOM
- Vite
- Lucide React (icons)

### Backend
- Node.js
- Express
- SQLite3
- CORS

## Local Development

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd school-portal
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

### Running Locally

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on deploying to Vercel.

## Default Login Credentials

Check the database initialization file for default user credentials.

## License

MIT
