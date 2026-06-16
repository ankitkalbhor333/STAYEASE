# Auth Middleware Setup Guide

## ✅ What's Created

### 1. **Auth Middleware** (`src/middleware/authMiddleware.js`)
Two middleware functions:
- `verifyToken` - Validates JWT and attaches user to request
- `verifyAdmin` - Checks if user is admin (optional)

---

## 🚀 Implementation Steps

### Step 1: Update Your Routes
Import and use the middleware:

```javascript
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

// ❌ Public route - No protection
router.post("/login", login);

// ✅ Protected route - Requires valid token
router.get("/profile", verifyToken, getProfileController);

// 👮 Admin only - Requires token + admin role
router.delete("/admin-panel", verifyToken, verifyAdmin, deleteController);
```

### Step 2: Frontend - Send Token with Requests

```javascript
// After login, save the token
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
});
const data = await response.json();
localStorage.setItem("token", data.token);

// Send token with protected requests
const profileResponse = await fetch("/api/profile", {
  method: "GET",
  headers: {
    "Authorization": "Bearer " + localStorage.getItem("token"),
    "Content-Type": "application/json"
  }
});
```

### Step 3: Handle Token Expiry

```javascript
// Check for 401 response
if (response.status === 401) {
  localStorage.removeItem("token");
  // Redirect to login page
  window.location.href = "/login";
}
```

---

## 📋 How Middleware Works

```
Client sends request with token
    ↓
Middleware checks Authorization header
    ↓
Extracts token from "Bearer <token>"
    ↓
Verifies JWT signature with JWT_SECRET
    ↓
✅ Valid: Attaches user info to req.user → Next handler
❌ Invalid: Returns 401 error
```

---

## 🔌 Access User Info in Controllers

In any protected route controller:

```javascript
export const getProfile = async (req, res) => {
  // Token is verified, user info is available
  const userId = req.user.id;      // From JWT payload
  const userEmail = req.user.email; // From JWT payload

  const user = await User.findById(userId);
  res.json(user);
};
```

---

## 🛡️ Token Format

The middleware expects:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

It will automatically strip "Bearer " and validate the token.

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `No token provided` | Missing Authorization header | Add header with token |
| `Invalid token` | JWT signature mismatch | Check JWT_SECRET in .env |
| `Token has expired` | Token older than 7 days | User must login again |
| `Invalid authorization format` | Missing "Bearer " prefix | Use "Bearer <token>" |

---

## ✨ Next Steps

1. Update your route files to add `verifyToken` middleware
2. Create protected route controllers if needed
3. Test with Postman or your frontend
4. (Optional) Add password strength validation
5. (Optional) Implement rate limiting on auth endpoints
