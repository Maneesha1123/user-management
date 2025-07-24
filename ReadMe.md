# User Management App

## Overview
This project is a full-stack user management application with a React frontend and a Node.js/Express backend. It allows users to register, log in, change passwords, and delete their accounts. The backend enforces strong password policies and stores user data securely. Automated UI and API tests are included for quality assurance.

## Use Cases
- User registration with password validation
- User login with authentication
- Password change with current/new password validation
- User account deletion
- Automated UI and API testing for all flows

## Prerequisites
- Node.js (v16 or higher recommended)
- npm (v8 or higher)
- Google Chrome browser (for UI automation)
- ChromeDriver (automatically installed via npm)

## Setup & Run Instructions
1. **Clone the repository**
2. **Install and build everything, and run the app:**
   ```bash
   bash start_app.sh
   ```
   This script will:
   - Install backend and frontend dependencies
   - Build the frontend
   - Start the backend server
   - Run UI automation tests after a short delay

3. **Access the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3000/api](http://localhost:3000/api)

## Test Plan & Strategy
- **API Tests:** Located in `features/api-tests.js`, covering registration, login, password change, and deletion (success and error cases).
- **UI Tests:** Located in `features/ui-tests.js`, using Selenium WebDriver to automate browser actions for all user flows.
- **How to Execute:**
  - The `start_app.sh` script will automatically run all tests after starting the app.
  - To run UI tests manually:
    ```bash
    cd features
    npm install
    npm test
    ```
- **Test Results:**
  - Results are shown in the terminal after test execution.
  - Each test case is run sequentially with a delay to avoid UI overlap.

## Security Features
- Password strength validation (length, uppercase, lowercase, numbers, special characters)
- Password hashing using bcrypt with salt rounds
- Protection against common weak passwords
- Secure password change functionality requiring current password verification

## Notes
- The backend stores users in a local `users.json` file. This file is cleared before and after tests for a clean state.
- Passwords are hashed before storage.
- The app is for demonstration and learning purposes; for production, use a database and add more security features.
