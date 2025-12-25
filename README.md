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
- Sqlalchmy (db Orm)
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
