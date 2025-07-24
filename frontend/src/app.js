// frontend-react/src/App.js
import React, { useState } from 'react';
import './index.css'; // For Tailwind CSS to process

function App() {
  const backendUrl = 'http://localhost:3000/api'; // Adjust if your backend port is different

  // State for Register form
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // State for Login form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // State for Delete form
  const [deleteUsername, setDeleteUsername] = useState('');

  // State for Change Password form
  const [changePasswordUsername, setChangePasswordUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // State for messages
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' or 'error'

  /**
   * Displays a message in the message box.
   * @param {string} text - The message text.
   * @param {string} type - 'success' or 'error'.
   */
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' }); // Clear message after 5 seconds
    }, 5000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: registerUsername, password: registerPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message, 'success');
        setRegisterUsername('');
        setRegisterPassword('');
      } else {
        showMessage(data.message || 'Registration failed.', 'error');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      showMessage('Network error or server unavailable during registration.', 'error');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(`Logged in as ${data.username}!`, 'success');
        setLoginUsername('');
        setLoginPassword('');
        // In a real app, you would store a token here (e.g., in localStorage)
      } else {
        showMessage(data.message || 'Login failed.', 'error');
      }
    } catch (error) {
      console.error('Error during login:', error);
      showMessage('Network error or server unavailable during login.', 'error');
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    // In a real app, you would use a custom modal for confirmation
    if (!window.confirm(`Are you sure you want to delete user '${deleteUsername}'?`)) {
      return; // User cancelled
    }

    try {
      const response = await fetch(`${backendUrl}/users/${deleteUsername}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message, 'success');
        setDeleteUsername('');
      } else {
        showMessage(data.message || 'Deletion failed.', 'error');
      }
    } catch (error) {
      console.error('Error during deletion:', error);
      showMessage('Network error or server unavailable during deletion.', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/users/${changePasswordUsername}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message, 'success');
        setChangePasswordUsername('');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        showMessage(data.message || 'Password change failed.', 'error');
      }
    } catch (error) {
      console.error('Error during password change:', error);
      showMessage('Network error or server unavailable during password change.', 'error');
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">User Management</h1>

      {/* Message Box */}
      {message.text && (
        <div
          id="messageBox"
          className={`p-4 mb-6 rounded-lg font-semibold transition-opacity duration-300 ${
            message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {/* Register Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Register New Account</h2>
        <form id="registerForm" onSubmit={handleRegister} className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col gap-4">
          <input
            type="text"
            id="registerUsername"
            className="p-3 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Username"
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.target.value)}
            required
          />
          <input
            type="password"
            id="registerPassword"
            className="p-3 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            id="registerButton"
            className="bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Register
          </button>
        </form>
      </div>

      {/* Login Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Login</h2>
        <form onSubmit={handleLogin} className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col gap-4">
          <input
            type="text"
            id="loginUsername"
            className="p-3 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Username"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            required
          />
          <input
            type="password"
            id="loginPassword"
            className="p-3 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            id="loginButton"
            className="bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </button>
        </form>
      </div>

      {/* Delete Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Delete Account</h2>
        <form onSubmit={handleDelete} className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col gap-4">
          <input
            type="text"
            id="deleteUsername"
            className="p-3 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Username to Delete"
            value={deleteUsername}
            onChange={(e) => setDeleteUsername(e.target.value)}
            required
          />
          <button
            type="submit"
            id="deleteButton"
            className="bg-red-600 text-white py-3 rounded-md font-bold hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete
          </button>
        </form>
      </div>
      
      {/* Change Password Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Change Password</h2>
        <form id="changePasswordForm" onSubmit={handleChangePassword} className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col gap-4">
          <input
            type="text"
            id="changePasswordUsername"
            className="p-3 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Username"
            value={changePasswordUsername}
            onChange={(e) => setChangePasswordUsername(e.target.value)}
            required
          />
          <input
            type="password"
            id="currentPassword"
            className="p-3 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <input
            type="password"
            id="newPassword"
            className="p-3 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            id="changePasswordButton"
            className="bg-yellow-600 text-white py-3 rounded-md font-bold hover:bg-yellow-700 transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
