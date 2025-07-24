const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const chromedriver = require('chromedriver');

const APP_URL = 'http://localhost:3000';
const USERS_FILE = path.join(__dirname, '../backend/users.json');

// Helper function to generate a random username
const generateRandomUsername = () =>
  'testuser_' + Math.floor(Math.random() * 10000);

// Clean up test users before tests
const cleanupTestUsers = async () => {
  try {
    // Read users file directly (optional, just to ensure file exists for write)
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      if (data.trim()) {
        users = JSON.parse(data); // Parse existing data, though we'll overwrite it
      }
    }

    // Clear all users by setting the array to empty
    users = [];

    // Write back to file, effectively clearing all users
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    console.log('Cleaned up all users in users.json');
  } catch (error) {
    console.error('Error cleaning up users:', error.message);
  }
};

describe('User Authentication UI Tests', function() {
  let driver;
  let testUsername = generateRandomUsername();
  const validPassword = 'Test@123Password';

  before(async function() {
    // Setup Chrome options
    const options = new chrome.Options();

    // Automatically set ChromeDriver executable path
    const service = new chrome.ServiceBuilder(chromedriver.path);

    // Create a new driver instance
    driver = await new Builder()
        .forBrowser('chrome')
        .setChromeService(service)
        .setChromeOptions(options)
        .build();

    // Set implicit wait time
    await driver.manage().setTimeouts({ implicit: 5000 });

    // Clean up all users before starting tests
    await cleanupTestUsers();
  });

  after(async function() {
    // Cleanup and close browser
    // It's good practice to clean up after tests, but 'before' hook ensures clean state for each run.
    await cleanupTestUsers();
    if (driver) await driver.quit();
  });

  describe('Registration Functionality', function() {
    beforeEach(async function() {
      await new Promise(res => setTimeout(res, 3000));
    });

    it('should load the registration form', async function() {
      await driver.get(APP_URL);

      // Wait for the form to be visible
      const registerForm = await driver.findElement(By.id('registerForm'));
      assert.isTrue(await registerForm.isDisplayed());
    });

    it('should register a new user with valid credentials', async function() {
      await driver.get(APP_URL);

      // Fill out register form
      await driver.findElement(By.id('registerUsername')).sendKeys(testUsername);
      await driver.findElement(By.id('registerPassword')).sendKeys(validPassword);
      await driver.findElement(By.id('registerButton')).click();

      // Wait for success message
      const messageElement = await driver.wait(
        until.elementLocated(By.id('messageBox')),
        5000
      );

      const messageText = await messageElement.getText();
      assert.include(messageText.toLowerCase(), 'registered successfully');
    });

    it('should show error for existing username', async function() {
      await driver.get(APP_URL);

      // Fill out register form with existing username
      await driver.findElement(By.id('registerUsername')).sendKeys(testUsername);
      await driver.findElement(By.id('registerPassword')).sendKeys(validPassword);
      await driver.findElement(By.id('registerButton')).click();

      // Wait for error message
      const messageElement = await driver.wait(
        until.elementLocated(By.id('messageBox')),
        5000
      );

      const messageText = await messageElement.getText();
      assert.include(messageText.toLowerCase(), 'already exists');
    });

    it('should show error for short username', async function() {
      await driver.get(APP_URL);

      // Fill out register form with short username
      await driver.findElement(By.id('registerUsername')).sendKeys('ab');
      await driver.findElement(By.id('registerPassword')).sendKeys(validPassword);
      await driver.findElement(By.id('registerButton')).click();

      // Wait for error message
      const messageElement = await driver.wait(
        until.elementLocated(By.id('messageBox')),
        5000
      );

      const messageText = await messageElement.getText();
      assert.include(messageText.toLowerCase(), 'at least 3 characters');
    });

    it('should show error for weak password (no uppercase)', async function() {
      await driver.get(APP_URL);

      const newUsername = generateRandomUsername();
      await driver.findElement(By.id('registerUsername')).sendKeys(newUsername);
      await driver.findElement(By.id('registerPassword')).sendKeys('test@123password');
      await driver.findElement(By.id('registerButton')).click();

      // Wait for error message
      const messageElement = await driver.wait(
        until.elementLocated(By.id('messageBox')),
        5000
      );

      const messageText = await messageElement.getText();
      assert.include(messageText.toLowerCase(), 'uppercase');
    });
  });

  describe('Login Functionality', function() {
    beforeEach(async function() {
      await new Promise(res => setTimeout(res, 3000));
    });

    it('should login with valid credentials', async function() {
      await driver.get(APP_URL);

      // Fill out login form
      await driver.findElement(By.id('loginUsername')).sendKeys(testUsername);
      await driver.findElement(By.id('loginPassword')).sendKeys(validPassword);
      await driver.findElement(By.id('loginButton')).click();

      // Wait for success message
      const messageElement = await driver.wait(
        until.elementLocated(By.id('messageBox')),
        5000
      );

      const messageText = await messageElement.getText();
      assert.include(messageText.toLowerCase(), 'logged in as testuser');
    });

    it('should show error for invalid password', async function() {
      await driver.get(APP_URL);

      // Fill out login form with wrong password
      await driver.findElement(By.id('loginUsername')).sendKeys(testUsername);
      await driver.findElement(By.id('loginPassword')).sendKeys('WrongPassword@123');
      await driver.findElement(By.id('loginButton')).click();

      // Wait for error message
      const messageElement = await driver.wait(
        until.elementLocated(By.id('messageBox')),
        5000
      );

      const messageText = await messageElement.getText();
      assert.include(messageText.toLowerCase(), 'invalid');
    });

    it('should show error for non-existent user', async function() {
      await driver.get(APP_URL);

      // Fill out login form with non-existent user
      await driver.findElement(By.id('loginUsername')).sendKeys('nonexistentuser');
      await driver.findElement(By.id('loginPassword')).sendKeys(validPassword);
      await driver.findElement(By.id('loginButton')).click();

      // Wait for error message
      const messageElement = await driver.wait(
        until.elementLocated(By.id('messageBox')),
        5000
      );

      const messageText = await messageElement.getText();
      assert.include(messageText.toLowerCase(), 'invalid');
    });
  });

  describe('User Deletion', function() {
    beforeEach(async function() {
      await new Promise(res => setTimeout(res, 3000));
    });

    it('should delete an existing user', async function() {
      await driver.get(APP_URL);

      // Fill out delete form
      await driver.findElement(By.id('deleteUsername')).sendKeys(testUsername);
      await driver.findElement(By.id('deleteButton')).click();
      
      // Wait for alert to appear and accept it
      await driver.wait(until.alertIsPresent(), 5000);
      const alert = await driver.switchTo().alert();
      await alert.accept(); // Clicks "OK" on the confirmation dialog
      
      // Wait for success message
      const messageElement = await driver.wait(
        until.elementLocated(By.id('messageBox')),
        5000
      );
      
      const messageText = await messageElement.getText();
      assert.include(messageText.toLowerCase(), 'deleted successfully');
    });

    it('should show error when deleting non-existent user', async function() {
      await driver.get(APP_URL);

      // Fill out delete form with non-existent user
      await driver.findElement(By.id('deleteUsername')).sendKeys('nonexistentuser');
      await driver.findElement(By.id('deleteButton')).click();
      
      // Wait for alert to appear and accept it
      await driver.wait(until.alertIsPresent(), 5000);
      const alert = await driver.switchTo().alert();
      await alert.accept(); // Clicks "OK" on the confirmation dialog
      
      // Wait for error message
      const messageElement = await driver.wait(
        until.elementLocated(By.id('messageBox')),
        5000
      );
      
      const messageText = await messageElement.getText();
      assert.include(messageText.toLowerCase(), 'not found');
    });
  });

  describe('Password Change Functionality', function() {
    beforeEach(async function() {
      await new Promise(res => setTimeout(res, 3000));
    });

    // Create a test user for password change tests
    let passwordChangeUser = generateRandomUsername();
    
    before(async function() {
      // Register a new user specifically for password change tests
      await driver.get(APP_URL);
      await driver.findElement(By.id('registerUsername')).sendKeys(passwordChangeUser);
      await driver.findElement(By.id('registerPassword')).sendKeys(validPassword);
      await driver.findElement(By.id('registerButton')).click();
      
      // Wait for success message and then proceed
      await driver.wait(
        until.elementLocated(By.id('messageBox')),
        5000
      );
    });

    it('should change password with valid credentials', async function() {
      await driver.get(APP_URL);

      // Fill out change password form
      await driver.findElement(By.id('changePasswordUsername')).sendKeys(passwordChangeUser);
      await driver.findElement(By.id('currentPassword')).sendKeys(validPassword);
      await driver.findElement(By.id('newPassword')).sendKeys('NewTest@123Password');
      await driver.findElement(By.id('changePasswordButton')).click();

      // Wait for success message
      const messageElement = await driver.wait(
        until.elementLocated(By.id('messageBox')),
        5000
      );

      const messageText = await messageElement.getText();
      assert.include(messageText.toLowerCase(), 'changed successfully');

      // Verify login works with new password
      await driver.get(APP_URL);
      await driver.findElement(By.id('loginUsername')).sendKeys(passwordChangeUser);
      await driver.findElement(By.id('loginPassword')).sendKeys('NewTest@123Password');
      await driver.findElement(By.id('loginButton')).click();

      const loginMessageElement = await driver.wait(
        until.elementLocated(By.id('messageBox')),
        5000
      );
      
      const loginMessageText = await loginMessageElement.getText();
      assert.include(loginMessageText.toLowerCase(), 'logged in');
    });

    it('should show error for incorrect current password', async function() {
      await driver.get(APP_URL);

      // Fill out change password form with incorrect current password
      await driver.findElement(By.id('changePasswordUsername')).sendKeys(passwordChangeUser);
      await driver.findElement(By.id('currentPassword')).sendKeys('WrongPassword@123');
      await driver.findElement(By.id('newPassword')).sendKeys('AnotherTest@123');
      await driver.findElement(By.id('changePasswordButton')).click();

      // Wait for error message
      const messageElement = await driver.wait(
        until.elementLocated(By.id('messageBox')),
        5000
      );

      const messageText = await messageElement.getText();
      assert.include(messageText.toLowerCase(), 'incorrect');
    });

    it('should show error for non-existent user', async function() {
      await driver.get(APP_URL);

      // Fill out change password form with non-existent user
      await driver.findElement(By.id('changePasswordUsername')).sendKeys('nonexistentuser');
      await driver.findElement(By.id('currentPassword')).sendKeys(validPassword);
      await driver.findElement(By.id('newPassword')).sendKeys('NewTest@123Password');
      await driver.findElement(By.id('changePasswordButton')).click();

      // Wait for error message
      const messageElement = await driver.wait(
        until.elementLocated(By.id('messageBox')),
        5000
      );

      const messageText = await messageElement.getText();
      assert.include(messageText.toLowerCase(), 'not found');
    });

    it('should show error for weak new password', async function() {
      await driver.get(APP_URL);

      // Fill out change password form with weak new password
      await driver.findElement(By.id('changePasswordUsername')).sendKeys(passwordChangeUser);
      await driver.findElement(By.id('currentPassword')).sendKeys('NewTest@123Password'); // The password was changed in the first test
      await driver.findElement(By.id('newPassword')).sendKeys('weak');
      await driver.findElement(By.id('changePasswordButton')).click();

      // Wait for error message
      const messageElement = await driver.wait(
        until.elementLocated(By.id('messageBox')),
        5000
      );

      const messageText = await messageElement.getText();
      assert.include(messageText.toLowerCase(), 'at least 8 characters');
    });
  });
});
