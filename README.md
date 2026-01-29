# QuizMaster Pro

A premium, web-based quiz application for Students and Admins.

## Features

- **Role-Based Access**:
  - **Admin**: Create quizzes, add questions, view global leaderboard.
  - **Student**: Take quizzes, view scores, compete on leaderboard.
- **Premium Design**: Dark mode, glassmorphism UI, smooth animations.
- **Persistence**: Data is saved in Firebase Firestore and Authentication.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup Environment Variables**:
   Create a `.env.local` file and add your Firebase credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open Application**:
   Visit [http://localhost:3000](http://localhost:3000)

## Demo Credentials

You can sign up for a new student account. To create an admin account, you'll need to manually set the `role` to `admin` in the Firestore `users` collection for that user's document.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Vanilla CSS (CSS Modules & Global Vars)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth

