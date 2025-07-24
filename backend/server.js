// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Required for frontend to communicate with backend

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // To parse JSON request bodies

// Serve static files from the React build directory
// This path assumes the 'frontend' project's build output is in '../frontend/build'
app.use(express.static(path.join(__dirname, '../frontend/build')));

// --- Helper Functions for User Data Management ---

/**
 * Loads user data from the JSON file.
 * @returns {Array<Object>} An array of user objects.
 */
const loadUsers = () => {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        // If file is empty, return an empty array
        if (!data.trim()) {
            return [];
        }
        const parsed = JSON.parse(data);
        // Ensure the parsed data is always an array
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        // If file doesn't exist or is empty/corrupt, return an empty array
        if (error.code === 'ENOENT') {
            console.log('users.json not found, creating a new one.');
            return [];
        }
        console.error('Error loading users:', error.message);
        return [];
    }
};

/**
 * Saves user data to the JSON file.
 * @param {Array<Object>} users - The array of user objects to save.
 */
const saveUsers = (users) => {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving users:', error.message);
    }
};

/**
 * Validates password strength based on common security requirements.
 * @param {string} password - The password to validate.
 * @returns {Object} - Validation result with isValid and message properties.
 */
const validatePassword = (password) => {
  // Check minimum length
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
  }

  // Check for at least one digit
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number.' };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\'"\\|,.<>/?).' };
  }

  // Check for common passwords (this is a very small sample - in production, use a larger list)
  const commonPasswords = ['password', 'password123', '12345678', 'qwerty123', 'admin123', 'password123!'];
  if (commonPasswords.includes(password.toLowerCase())) {
    return { isValid: false, message: 'This password is too common. Please choose a more secure password.' };
  }

  return { isValid: true, message: 'Password is valid.' };
};

// --- API Endpoints ---

/**
 * POST /api/register
 * Registers a new user.
 * Requires: username, password in request body.
 */
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    // Basic input validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const users = loadUsers();

    // Check if user already exists (case-insensitive)
    if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
        return res.status(409).json({ message: 'Username already exists.' });
    }

    // Validate username (optional: add more rules as needed)
    if (username.length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters long.' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return res.status(400).json({ message: passwordValidation.message });
    }

    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10

        const newUser = { username, password: hashedPassword };
        users.push(newUser);
        saveUsers(users);

        console.log(`User registered: ${username}`);
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
});

/**
 * POST /api/login
 * Authenticates an existing user.
 * Requires: username, password in request body.
 */
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Basic input validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const users = loadUsers();
    // Case-insensitive username lookup
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    // Check if user exists
    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password.' });
    }

    try {
        // Compare provided password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            console.log(`User logged in: ${username}`);
            // In a real app, you would generate a JWT here
            res.status(200).json({ message: 'Login successful.', username: user.username });
        } else {
            console.log(`Failed login attempt for: ${username}`);
            res.status(401).json({ message: 'Invalid username or password.' });
        }
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
});

/**
 * DELETE /api/users/:username
 * Deletes an existing user.
 * Requires: username in URL parameter.
 * Note: In a real app, this would require authentication/authorization.
 */
app.delete('/api/users/:username', (req, res) => {
    const { username } = req.params;

    let users = loadUsers();

    // Case-insensitive user deletion
    const targetUser = users.find(user => user.username.toLowerCase() === username.toLowerCase());
    if (targetUser) {
        users = users.filter(user => user.username !== targetUser.username);
        saveUsers(users);
        console.log(`User deleted: ${targetUser.username}`);
        res.status(200).json({ message: `User '${targetUser.username}' deleted successfully.` });
    } else {
        console.log(`Attempted to delete non-existent user: ${username}`);
        res.status(404).json({ message: `User '${username}' not found.` });
    }
});

/**
 * POST /api/users/:username/change-password
 * Changes a user's password.
 * Requires: username as URL parameter, currentPassword and newPassword in request body.
 */
app.post('/api/users/:username/change-password', async (req, res) => {
  const { username } = req.params;
  const { currentPassword, newPassword } = req.body;

  // Basic input validation
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required.' });
  }

  const users = loadUsers();
  
  // Case-insensitive username lookup
  const userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  
  // Check if user exists
  if (userIndex === -1) {
    return res.status(404).json({ message: `User '${username}' not found.` });
  }

  const user = users[userIndex];

  try {
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Hash and update the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;
    saveUsers(users);

    console.log(`Password changed for user: ${username}`);
    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error during password change:', error.message);
    res.status(500).json({ message: 'Internal server error during password change.' });
  }
});

// For any other requests, serve the React app's index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Frontend available at http://localhost:${PORT}/`);
    // Ensure the users.json file exists at startup
    loadUsers();
});

// Export app for testing purposes
module.exports = app;
