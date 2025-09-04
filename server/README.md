# Diary API (Node.js + Express + MySQL)

Implements:
- POST /api/v1/users — validate/login
- POST /api/v1/signup — create new user
- POST /api/v1/dairy — create diary entry (auth)
- GET /api/v1/dairy/:id — list diaries for user (auth)
- GET /api/v1/dairy/:id/:dairyID — get single diary entry (auth)
- PUT /api/v1/dairy/:id — update diary entry (auth)
- DELETE /api/v1/dairy/:id — delete diary entry (auth)

Setup:
1. Create MySQL database and tables
   - Import `schema.sql` or run its statements.
2. Configure environment
   - Copy `.env.example` to `.env` and set credentials.
3. Install and run
   - npm install
   - npm start

Client:
- The React page `src/pages/Diary.jsx` uses VITE_DAIRY_API_URL (default http://localhost:5050/api/v1).