#!/bin/bash

# This script automates the setup and running of the React frontend and Node.js backend.
# It assumes you are running it from the root directory of your project (user-app-react/).

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Starting Application Setup and Run ---"

# --- Backend Setup ---
echo ""
echo "--- 1. Installing Backend Dependencies (backend/) ---"
cd backend
npm install
echo "--- Backend Dependencies Installed ---"
cd .. # Go back to the root directory

# --- Frontend Setup and Build ---
echo ""
echo "--- 2. Installing Frontend Dependencies and Building (frontend/) ---"
cd frontend
npm install
npm install selenium-webdriver@latest
npm install selenium-webdriver chromedriver
npm run build
echo "--- Frontend Built Successfully ---"
cd .. # Go back to the root directory

# --- Start Backend Server ---
echo ""
echo "--- 3. Starting Backend Server (http://localhost:3000) ---"
# Navigate back to backend and start the server in the background
cd backend
npm start &
# Capture the Process ID (PID) of the background process
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"
cd ..

# --- Run UI Automation Tests ---
echo ""
echo "--- Waiting 10 seconds before running UI Automation Tests ---"
sleep 10 # Wait for the frontend to be fully available

echo ""
echo "--- 4. Running UI & API Automation Tests (frontend/) ---"
cd features
npm install
npm test
echo "--- UI & API Automation Tests Completed ---"
cd .. # Go back to the root directory

# --- Final Message ---
echo ""
echo "--- Application Setup and Run Completed ---"
echo "Backend server is running at http://localhost:3000"
echo "Frontend is built and ready for use."
# Optionally, you can add a command to keep the script running
# until the user decides to stop it, e.g., using `wait` or `read
# -p "Press [Enter] to exit..."`.
# This script will exit when the backend server is stopped.

