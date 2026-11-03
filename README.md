CloudTrack is a cloud-based issue tracking application designed to help users create, manage, and monitor issues through a simple dashboard.
The project combines a React frontend with a Node.js and Express backend, with AWS DynamoDB integration explored for data storage.

Features
- Create, view, update, and delete issues.
- Track issue status and monitor progress.
- Dashboard with issue statistics.
- Search and filter issues.
- REST API for issue management.
- AWS DynamoDB integration using AWS SDK for JavaScript v3.

Tech Stack
Frontend
- React
- TypeScript
- Vite
- CSS

Backend
- Node.js
- Express.js
- TypeScript
- REST API

Cloud & Tools
- AWS DynamoDB
- AWS SDK for JavaScript v3
- AWS IAM
- AWS CLI
- Git and GitHub

Getting Started
1. Clone the repository
git clone
cd CloudTrack

3. Install frontend dependencies
cd frontend
npm install
npm run dev

4. Install backend dependencies
Open another terminal:
cd backend
npm install
npm run dev

Configure the required environment variables before starting the backend. Refer to `.env.example` if provided.

AWS Integration
CloudTrack includes a DynamoDB data-access implementation using AWS SDK v3. AWS CLI and IAM permissions were configured during development to explore cloud database integration.
A successful live DynamoDB connection and cloud deployment have not yet been verified.

Future Improvements
- Complete and verify AWS DynamoDB connectivity.
- Deploy the frontend and backend.
- Add user authentication and authorization.
- Improve dashboard analytics.
- Add issue priority and assignment features.
