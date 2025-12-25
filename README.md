# Job Contract Module

A full-stack web application for managing job contracts, applications, invoices, and work plans. It includes separate dashboards for agents and contractors.

## Features

- User authentication and registration
- Job posting and application management
- Invoice generation and tracking
- Work plan creation and monitoring
- Role-based access control (RBAC)
- Separate dashboards for agents and contractors

## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy (database ORM)
- JWT for authentication

### Frontend
- TypeScript
- React
- Vite
- Axios for API calls

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
1. Navigate to the `backend` directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run the backend server:
   ```
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```

## Usage

- Access the application at `http://localhost:5173` (frontend)
- Backend API available at `http://localhost:8000`
- Register as an agent or contractor
- Login to access your dashboard
- Manage jobs, applications, invoices, and work plans

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.