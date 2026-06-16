/**
 * POST /api/auth/register - Examples
 * 
 * Endpoint: http://localhost:5000/api/auth/register
 * Method: POST
 * Rate Limited: 3 attempts per hour
 * Required Fields: name, email, phone, password
 */

// ============================================
// 1. JAVASCRIPT / FETCH (Browser or Node.js)
// ============================================

const registerUser = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        password: "SecurePass123!"
      })
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", data);

    if (response.ok) {
      console.log("✅ Registration successful! Check email to verify.");
    } else {
      console.log("❌ Registration failed:", data.msg);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// Call it
registerUser();


// ============================================
// 2. CURL COMMAND (Terminal)
// ============================================

/*
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+9876543210",
    "password": "MySecure#Pass99"
  }'
*/


// ============================================
// 3. AXIOS (Node.js)
// ============================================

const axios = require("axios");

const registerWithAxios = async () => {
  try {
    const response = await axios.post("http://localhost:5000/api/auth/register", {
      name: "Alice Johnson",
      email: "alice@example.com",
      phone: "+1555666777",
      password: "AliceSecure#2024"
    });

    console.log("✅ Success:", response.data);
  } catch (error) {
    console.log("❌ Error:", error.response.data);
  }
};

registerWithAxios();


// ============================================
// 4. POSTMAN / REST CLIENT
// ============================================

/*
Method: POST
URL: http://localhost:5000/api/auth/register

Headers:
  Content-Type: application/json

Body (JSON):
{
  "name": "Bob Wilson",
  "email": "bob@example.com",
  "phone": "+1888999000",
  "password": "BobWilson#Pass123"
}
*/


// ============================================
// 5. TEST CASES
// ============================================

/*

✅ VALID REGISTRATION:
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!"
}

Response:
{
  "msg": "Registration successful! Check your email to verify your account."
}


❌ MISSING PHONE:
{
  "name": "Jane",
  "email": "jane@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "msg": "Please provide name, email, phone, and password"
}


❌ WEAK PASSWORD (Missing uppercase):
{
  "name": "Jane",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "password": "password123"
}

Response:
{
  "msg": "Password does not meet requirements",
  "errors": [
    "Password must contain at least one uppercase letter (A-Z)",
    "Password must contain at least one special character (!@#$%^&*...)"
  ],
  "strength": {
    "score": 1,
    "level": "Weak"
  }
}


❌ MISSING FIELDS:
{
  "name": "John",
  "email": "john@example.com"
}

Response:
{
  "msg": "Please provide name, email, phone, and password"
}


❌ EMAIL ALREADY EXISTS:
{
  "name": "John",
  "email": "existing@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!"
}

Response:
{
  "msg": "Email already registered"
}


❌ PHONE ALREADY EXISTS:
{
  "name": "Different User",
  "email": "different@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!"
}

Response:
{
  "msg": "Phone number already registered"
}


❌ COMMON PASSWORD:
{
  "name": "User",
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "Password123!"
}

Response:
{
  "msg": "Password is too common. Please choose a stronger password.",
  "errors": ["This password is commonly used and not secure"]
}


❌ RATE LIMITED (4th attempt within 1 hour):
Response:
{
  "msg": "Too many attempts. Please try again later.",
  "retryAfter": 3600,
  "error": "RATE_LIMIT_EXCEEDED"
}
*/
