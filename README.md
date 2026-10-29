# Secure Student Records & Academic Insights AI — Frontend

A secure, web-based academic insights application built with **SvelteKit and Svelte 5**. The frontend provides separate student and teacher dashboards for viewing academic performance, attendance, class statistics, and study recommendations through a security-protected FastAPI backend.

The frontend is deployed on **Vercel**, while the backend API runs on **Google Cloud Run**.

## Table of Contents

- [Project Overview](#project-overview)
- [Objectives](#objectives)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [User Roles](#user-roles)
- [Security Design](#security-design)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Installation](#local-installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Deploying to Vercel](#deploying-to-vercel)
- [Backend API Integration](#backend-api-integration)
- [Security Testing](#security-testing)
- [Limitations](#limitations)
- [Future Enhancements](#future-enhancements)
- [Related Repository](#related-repository)

## Project Overview

Secure Student Records & Academic Insights AI is a web application designed to demonstrate how academic information can be presented through a secure API-based architecture.

The application provides two interfaces:

- **Student Dashboard:** Displays the authenticated student's academic records, marks, attendance, and study recommendations.
- **Teacher Dashboard:** Displays class-level statistics, average performance, attendance information, and student performance records.

The frontend communicates with a FastAPI backend through server-side API routes. These routes forward requests to the backend and inject the API key on the server side, preventing the API key from being intentionally exposed in browser-side application code.

The project uses synthetic academic records and is intended for educational demonstration. It does not use real student information.

## Objectives

The primary objectives are to:

1. Develop a responsive frontend for an academic insights application.
2. Demonstrate secure communication between a frontend and a backend API.
3. Integrate a SvelteKit application with a FastAPI backend.
4. Support separate student and teacher access workflows.
5. Demonstrate authentication and role-based access control through backend-enforced permissions.
6. Keep application secrets in server-side environment variables rather than browser-side code.
7. Deploy the frontend using Vercel and integrate it with a backend hosted on Google Cloud Run.

## Features

### Student Dashboard

An authenticated student can view:

- Student ID and name.
- Attendance percentage.
- Marks in Python, Machine Learning, and Cloud Computing.
- Subject-level performance against a target mark.
- Overall academic average.
- Subjects requiring improvement.
- Rule-based study recommendations.

The displayed information is retrieved from the backend API rather than being hardcoded into the dashboard.

### Teacher Dashboard

An authenticated teacher can view:

- Total number of students in the dataset.
- Class average marks.
- Average attendance.
- Number of students with an overall average below 60.
- Class-level student performance information.

Summary statistics are calculated from the student records returned by the backend.

### API Proxy

The frontend includes a server-side API proxy that:

- Forwards supported requests to the backend.
- Passes the user's bearer token to the backend for identity and authorization checks.
- Adds the backend API key on the server side.
- Returns backend responses to the frontend.
- Forwards relevant response status codes and content types.
- Uses `Cache-Control: no-store` to discourage caching of sensitive API responses.
- Restricts request paths to prevent arbitrary upstream path forwarding.

### User Feedback

The interface provides feedback for:

- Loading states.
- Successful data retrieval.
- Missing user tokens.
- Authentication failures.
- Authorization failures.
- Other API request errors.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend framework | SvelteKit |
| UI framework | Svelte 5 |
| Programming language | TypeScript |
| Development server and build tooling | Vite |
| Backend API | Python and FastAPI |
| Frontend hosting | Vercel |
| Backend hosting | Google Cloud Run |
| Secret management | Google Cloud Secret Manager |
| Data source | Synthetic JSON student records |

## System Architecture

The application follows a frontend–backend architecture.

```text
User's Browser
      |
      | Student or teacher interaction
      v
SvelteKit Frontend
Hosted on Vercel
      |
      | Request to /api/*
      v
SvelteKit Server-Side API Proxy
      |
      | Adds X-API-Key
      | Forwards Authorization bearer token
      v
FastAPI Backend
Hosted on Google Cloud Run
      |
      v
API-Key Authentication
      |
      v
User Identity Resolution
      |
      v
Role-Based Access Control
      |
      v
Input Validation and Request Processing
      |
      v
Synthetic Student Records
      |
      v
Academic Insights and API Response
```

The frontend is responsible for presenting information and forwarding requests. The backend is responsible for authentication, authorization, validation, and access to student records.

**Security principle:** Hiding dashboard elements in the frontend is not sufficient to protect data. The backend must independently enforce permissions for every protected request.

## User Roles

### Student

A student can access their own student information and academic insights.

Example workflow:

1. Select the Student Dashboard.
2. Enter the assigned demonstration token.
3. Submit the request.
4. View the authenticated student's academic information and recommendations.

The backend determines the authenticated student's identity from the bearer token. It does not rely on a student ID supplied by the browser as proof of identity.

### Teacher

A teacher can access the class summary using the teacher demonstration token.

Example workflow:

1. Select the Teacher Dashboard.
2. Enter the teacher demonstration token.
3. Submit the request.
4. View class statistics and student performance information.

The backend checks the authenticated role before allowing access to teacher-only resources.

## Security Design

The project demonstrates several application security controls.

### API-Key Authentication

The frontend server-side proxy sends an API key to the backend using the `X-API-Key` header.

The key is configured through a server-side environment variable and must not be embedded in client-side JavaScript or committed to GitHub.

### Bearer-Token Authentication

The frontend sends the selected user's token through the HTTP `Authorization` header:

```http
Authorization: Bearer <user-token>
```

The backend resolves the token to a user identity and role.

The demonstration tokens are intended for educational testing, not production authentication.

### Role-Based Access Control

The backend distinguishes student and teacher permissions. A student must not gain access to another student's record or teacher-only class information by changing a URL or modifying a frontend request.

### Environment Variables

The frontend uses private server-side environment variables for its backend URL and API key.

The `.env` file is excluded from Git through `.gitignore`. Production values are configured through Vercel's environment-variable settings.

### Error Handling

Backend error responses are passed to the interface so that failed authentication and authorization requests can be communicated to the user.

The frontend does not replace backend security checks.

## Project Structure

The main project structure is:

```text
secure-student-ai-frontend/
├── src/
│   ├── routes/
│   │   ├── +page.svelte
│   │   └── api/
│   │       └── [...path]/
│   │           └── +server.ts
│   └── env.ts
├── static/
├── .gitignore
├── .npmrc
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

File responsibilities:

- `src/routes/+page.svelte`: Student and teacher dashboard interface, navigation, data presentation, and user interaction.
- `src/routes/api/[...path]/+server.ts`: Server-side proxy for forwarding requests to the backend.
- `src/env.ts`: Declares the private environment variables used by the SvelteKit application.
- `static/`: Static assets used by the frontend.
- `package.json`: Project dependencies and development scripts.
- `.gitignore`: Prevents environment files, build artifacts, and dependencies from being committed.

## Prerequisites

Before running the frontend locally, install:

- Node.js, preferably an active LTS release compatible with the project dependencies.
- npm.
- Git.
- Access to the deployed backend or a locally running FastAPI backend.

## Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/secure-student-ai-frontend.git
cd secure-student-ai-frontend
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the frontend root directory.

Add the following variables:

```dotenv
API_BASE_URL=https://YOUR-CLOUD-RUN-BACKEND-URL
API_KEY=YOUR_DEMONSTRATION_API_KEY
```

Replace the placeholder values with the actual backend URL and API key from your authorized deployment configuration.

Never commit this file to GitHub or share the API key publicly.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL displayed by Vite, typically:

```text
http://localhost:5173
```

## Environment Variables

| Variable | Purpose | Exposure |
|---|---|---|
| `API_BASE_URL` | Base URL of the FastAPI backend | Server-side only |
| `API_KEY` | API key sent by the server-side proxy | Server-side only |

These values must be configured in the deployment environment as well as in the local `.env` file.

Do not rename the variables without updating the SvelteKit private environment declarations and the proxy implementation.

## Running the Application

After starting the development server:

1. Open the frontend in your browser.
2. Select the Student Dashboard or Teacher Dashboard.
3. Enter a valid demonstration token.
4. Submit the request.
5. Verify that the appropriate dashboard information loads.
6. Test an invalid token and confirm that the request fails.

Example demonstration tokens for the synthetic dataset:

- Student S1001: `student-demo-token-1001`
- Teacher: `teacher-demo-token-2026`

These are demonstration credentials, not production credentials. Use them only with the corresponding authorized demonstration backend. Do not publish real or privileged credentials.

## Deploying to Vercel

### 1. Import the repository

1. Sign in to Vercel.
2. Select **Add New → Project**.
3. Import `secure-student-ai-frontend` from GitHub.
4. Confirm that Vercel detects SvelteKit.
5. Leave the output directory at its framework default.

### 2. Configure environment variables

In the Vercel project settings, add:

- `API_BASE_URL`
- `API_KEY`

Set the values for the deployment environments you intend to use.

The API key must remain a server-side variable. Do not prefix it with a public environment-variable prefix or expose it through frontend code.

### 3. Deploy

Deploy the project through Vercel.

After deployment, verify that:

- The homepage loads.
- The student dashboard can retrieve authorized data.
- The teacher dashboard can retrieve the class summary.
- Invalid tokens are rejected.
- The browser does not receive the backend API key.

## Backend API Integration

The frontend proxy forwards requests to the FastAPI backend. The supported backend endpoints include:

| Endpoint | Purpose |
|---|---|
| `GET /health` | Backend health check |
| `GET /students/me` | Retrieve the authenticated student's record |
| `GET /students/{student_id}` | Retrieve a student record subject to authorization |
| `GET /students/{student_id}/insights` | Retrieve academic insights |
| `GET /teacher/class-summary` | Retrieve teacher-only class statistics |
| `GET /security/status` | Inspect security configuration status |

Access depends on the backend's authentication and authorization rules.

The frontend does not grant permissions merely because a user selects a particular dashboard.

## Security Testing

The following cases should be tested against the deployed application:

| Test | Expected result |
|---|---|
| Valid student token and API key | Authorized student information is returned |
| Valid teacher token and API key | Class summary is returned |
| Invalid user token | Authentication is rejected |
| Missing or invalid API key | Request is rejected |
| Student requests another student's record | Access is forbidden |
| Student requests teacher-only class summary | Access is forbidden |
| Invalid input for a validated field | Validation error is returned |

Expected HTTP responses from the implemented backend include:

- `200 OK`: Successful authorized request.
- `401 Unauthorized`: Missing or invalid authentication credentials.
- `403 Forbidden`: Authenticated user lacks permission.
- `422 Unprocessable Entity`: Request data fails validation.

These responses should be verified against the running backend; frontend behavior alone does not establish that backend security works.

## Limitations

- The application uses synthetic academic records rather than a live university database.
- Demonstration bearer tokens are not intended for production identity management.
- Academic recommendations use transparent, rule-based logic rather than a trained machine-learning model.
- The project does not implement a full production identity provider, password-reset flow, or institutional single sign-on.
- The application is an academic demonstration, not a production student information system.

## Future Enhancements

Potential improvements include:

- Integration with a proper identity provider and institutional single sign-on.
- Short-lived signed access tokens and refresh-token management.
- More granular permissions and an auditable authorization policy.
- Secure database integration instead of static JSON records.
- Automated backend and frontend tests in CI.
- Rate limiting, structured security logging, and monitoring.
- Accessibility and usability improvements.
- More sophisticated academic analysis after collecting appropriate, consented data.
- Additional dashboards and historical performance visualizations.

## Related Repository

**Backend:** `secure-student-ai-backend`

The backend repository contains the FastAPI application, synthetic student data, deployment configuration, and supporting scripts.

Replace the repository name above with the actual backend repository URL when linking the two repositories.

## Academic Use

This project was developed as an educational demonstration of secure API integration, role-based access control, environment-variable management, cloud deployment, and academic data presentation.

It illustrates how a web frontend can communicate with a separately deployed API while leaving authorization decisions to the backend.
