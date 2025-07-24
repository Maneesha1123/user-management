const axios = require('axios');
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api';
const USERS_FILE = path.join(__dirname, '../backend/users.json');

// Helper function to generate a random username
const generateRandomUsername = () => 
  'testuser_' + Math.floor(Math.random() * 10000);

// Check if server is running
const checkServerIsRunning = async () => {
  try {
    await axios.get('http://localhost:3000', { timeout: 5000 });
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\x1b[31m%s\x1b[0m', 'ERROR: Server is not running at http://localhost:3000');
      console.log('Please start the server before running tests with: bash start_app.sh');
      return false;
    }
    return true; // If we got a different error, the server might be running
  }
};

// Clean up test users before tests
const cleanupTestUsers = async () => {
  try {
    // Read users file directly
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      if (data.trim()) {
        users = JSON.parse(data);
      }
    }
    
    // Filter out test users
    users = users.filter(user => !user.username.startsWith('testuser_'));
    
    // Write back to file
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    console.log('Cleaned up test users');
  } catch (error) {
    console.error('Error cleaning up test users:', error.message);
  }
};

describe('User Authentication API Tests', function() {
  // Variables to store test data
  let testUsername = generateRandomUsername();
  const validPassword = 'Test@123Password';
  let isServerRunning = false;
  
  before(async function() {
    // Check if server is running before starting tests
    isServerRunning = await checkServerIsRunning();
    if (!isServerRunning) {
      this.skip(); // Skip all tests if server is not running
    }
    
    // Initialize users.json if it doesn't exist
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, '[]', 'utf8');
    }
    
    await cleanupTestUsers();
  });
  
  after(async function() {
    await cleanupTestUsers();
  });
  
  describe('User Registration', function() {
    it('should register a new user with valid credentials', async function() {
      try {
        const response = await axios.post(`${API_URL}/register`, {
          username: testUsername,
          password: validPassword
        });
        
        assert.equal(response.status, 201);
        assert.include(response.data.message, 'registered successfully');
      } catch (error) {
        console.error('Error details:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', JSON.stringify(error.response.data));
        } else {
          console.error('No response received, connection issue');
        }
        throw error; // Re-throw to fail the test
      }
    });
    
    it('should reject registration with existing username', async function() {
      try {
        await axios.post(`${API_URL}/register`, {
          username: testUsername,
          password: validPassword
        });
        assert.fail('Should have thrown error for duplicate username');
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        assert.equal(error.response.status, 409);
        assert.include(error.response.data.message, 'already exists');
      }
    });
    
    it('should reject registration with missing fields', async function() {
      try {
        await axios.post(`${API_URL}/register`, {
          username: ''
        });
        assert.fail('Should have thrown error for missing password');
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        assert.equal(error.response.status, 400);
      }
    });
    
    it('should reject registration with short username', async function() {
      try {
        await axios.post(`${API_URL}/register`, {
          username: 'ab',
          password: validPassword
        });
        assert.fail('Should have thrown error for short username');
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        assert.equal(error.response.status, 400);
        assert.include(error.response.data.message, 'at least 3 characters');
      }
    });
    
    it('should reject registration with weak password (no uppercase)', async function() {
      try {
        await axios.post(`${API_URL}/register`, {
          username: generateRandomUsername(),
          password: 'test@123password'
        });
        assert.fail('Should have thrown error for weak password');
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        assert.equal(error.response.status, 400);
        assert.include(error.response.data.message, 'uppercase');
      }
    });
    
    it('should reject registration with weak password (no lowercase)', async function() {
      try {
        await axios.post(`${API_URL}/register`, {
          username: generateRandomUsername(),
          password: 'TEST@123PASSWORD'
        });
        assert.fail('Should have thrown error for weak password');
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        assert.equal(error.response.status, 400);
        assert.include(error.response.data.message, 'lowercase');
      }
    });
    
    it('should reject registration with weak password (no number)', async function() {
      try {
        await axios.post(`${API_URL}/register`, {
          username: generateRandomUsername(),
          password: 'Test@Password'
        });
        assert.fail('Should have thrown error for weak password');
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        assert.equal(error.response.status, 400);
        assert.include(error.response.data.message, 'number');
      }
    });
    
    it('should reject registration with weak password (no special char)', async function() {
      try {
        await axios.post(`${API_URL}/register`, {
          username: generateRandomUsername(),
          password: 'Test123Password'
        });
        assert.fail('Should have thrown error for weak password');
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        assert.equal(error.response.status, 400);
        assert.include(error.response.data.message, 'special character');
      }
    });
    
    it('should reject registration with common password', async function() {
      try {
        await axios.post(`${API_URL}/register`, {
          username: generateRandomUsername(),
          password: 'Password123!'
        });
        assert.fail('Should have thrown error for common password');
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        assert.equal(error.response.status, 400);
      }
    });
  });
  
  describe('User Login', function() {
    it('should login with valid credentials', async function() {
      try {
        const response = await axios.post(`${API_URL}/login`, {
          username: testUsername,
          password: validPassword
        });
        
        assert.equal(response.status, 200);
        assert.include(response.data.message, 'successful');
        assert.equal(response.data.username, testUsername);
      } catch (error) {
        console.error('Error details:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', JSON.stringify(error.response.data));
        } else {
          console.error('No response received, connection issue');
        }
        throw error; // Re-throw to fail the test
      }
    });
    
    it('should reject login with invalid password', async function() {
      try {
        await axios.post(`${API_URL}/login`, {
          username: testUsername,
          password: 'WrongPassword@123'
        });
        assert.fail('Should have thrown error for invalid password');
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        assert.equal(error.response.status, 401);
        assert.include(error.response.data.message, 'Invalid');
      }
    });
    
    it('should reject login with non-existent user', async function() {
      try {
        await axios.post(`${API_URL}/login`, {
          username: 'nonexistentuser',
          password: validPassword
        });
        assert.fail('Should have thrown error for non-existent user');
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        assert.equal(error.response.status, 401);
        assert.include(error.response.data.message, 'Invalid');
      }
    });
    
    it('should handle login with missing credentials', async function() {
      try {
        await axios.post(`${API_URL}/login`, {});
        assert.fail('Should have thrown error for missing credentials');
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        assert.equal(error.response.status, 400);
      }
    });
  });
  
  describe('User Deletion', function() {
    it('should delete an existing user', async function() {
      try {
        const response = await axios.delete(`${API_URL}/users/${testUsername}`);
        
        assert.equal(response.status, 200);
        assert.include(response.data.message, 'deleted successfully');
      } catch (error) {
        console.error('Error details:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', JSON.stringify(error.response.data));
        } else {
          console.error('No response received, connection issue');
        }
        throw error; // Re-throw to fail the test
      }
    });
    
    it('should return 404 when deleting non-existent user', async function() {
      try {
        await axios.delete(`${API_URL}/users/nonexistentuser`);
        assert.fail('Should have thrown error for non-existent user');
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        assert.equal(error.response.status, 404);
        assert.include(error.response.data.message, 'not found');
      }
    });
  });
  
  describe('Password Change', function() {
    let changePasswordTestUser;
    
    before(async function() {
      // Create a test user specifically for password change tests
      changePasswordTestUser = generateRandomUsername();
      try {
        const response = await axios.post(`${API_URL}/register`, {
          username: changePasswordTestUser,
          password: validPassword
        });
        assert.equal(response.status, 201);
      } catch (error) {
        console.error('Error creating test user for password change:', error.message);
        throw error;
      }
    });
    
    it('should change password with valid credentials', async function() {
      try {
        const newPassword = 'NewTest@123Password';
        const response = await axios.post(`${API_URL}/users/${changePasswordTestUser}/change-password`, {
          currentPassword: validPassword,
          newPassword: newPassword
        });
        
        assert.equal(response.status, 200);
        assert.include(response.data.message, 'changed successfully');
        
        // Verify login works with new password
        const loginResponse = await axios.post(`${API_URL}/login`, {
          username: changePasswordTestUser,
          password: newPassword
        });
        
        assert.equal(loginResponse.status, 200);
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        throw error; // Re-throw to fail the test
      }
    });
    
    it('should reject password change with incorrect current password', async function() {
      try {
        await axios.post(`${API_URL}/users/${changePasswordTestUser}/change-password`, {
          currentPassword: 'WrongPassword@123',
          newPassword: 'NewTest@456Password'
        });
        assert.fail('Should have thrown error for incorrect current password');
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        assert.equal(error.response.status, 401);
        assert.include(error.response.data.message, 'incorrect');
      }
    });
    
    it('should reject password change for non-existent user', async function() {
      try {
        await axios.post(`${API_URL}/users/nonexistentuser/change-password`, {
          currentPassword: validPassword,
          newPassword: 'NewTest@789Password'
        });
        assert.fail('Should have thrown error for non-existent user');
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        assert.equal(error.response.status, 404);
        assert.include(error.response.data.message, 'not found');
      }
    });
    
    it('should reject password change with weak new password', async function() {
      try {
        await axios.post(`${API_URL}/users/${changePasswordTestUser}/change-password`, {
          currentPassword: 'NewTest@123Password', // The password was changed in the first test
          newPassword: 'weak'
        });
        assert.fail('Should have thrown error for weak password');
      } catch (error) {
        if (!error.response) {
          console.error('Network error occurred:', error.message);
          throw new Error(`Network error: ${error.message}. Is the server running?`);
        }
        assert.equal(error.response.status, 400);
      }
    });
  });
});