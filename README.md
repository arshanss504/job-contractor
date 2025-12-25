# Job Contract Module

A full-stcak web application for managing job contracts, applications, invoices, and work plans. It includes separate dashboards for agents and contractors.

## Features

- User auth and signup
- Role-based acces control (RBAC) using jwt
- Agent: Creates jobs, Reviews applications, Approves/rejects
- Contractor: View Jobs, Apply, Plan Work, Generate Invoice

## Tech Stack

### Backend
- Python
- FastAPI
- Sqlalchemy (db Orm)
- Jwt for authentication

### Frontend
- TypeScript
- React
- Vite
- Axios for API calls


### Backend Setup

Run the backend server:

   ```
   pip install -r requriments.txt
   uvicorn app.main:app --reload
   ```

### Frontend Setup

Install dependencies:

   ```
   npm install
   ```

Run the development server:
 
   ```
   npm run dev
   ```

### Ports

- Frnotend `http://localhost:5173` 
- Backend `http://localhost:8000`

## Running with Docker

### Prerequisites
- Docker and Docker Compose installed

### Build and Run
1. Ensure your `.env` file is in the root directory with correct `DATABASE_URL` and `SECRET_KEY`
2. Build the image:
   ```
   docker-compose build
   ```
3. Run the application:
   ```
   docker-compose up
   ```
4. Access the app at `http://localhost:8000`

### Manual Docker Commands
- Build: `docker build -t job-contractor .`
- Run: `docker run -p 8000:8000 --env-file .env job-contractor`
