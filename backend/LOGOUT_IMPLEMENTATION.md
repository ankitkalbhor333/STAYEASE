# Logout Backend Implementation Guide

## ✅ What's Implemented

### 1. **Token Blacklist System** (`src/middleware/tokenBlacklist.js`)

Prevents users from using their token after logout:
- Maintains in-memory blacklist of invalidated tokens
- Automatically cleans up expired tokens (every 1 hour)
- Prevents memory leaks by removing old entries

### 2. **Updated Auth Middleware** (`src/middleware/authMiddleware.js`)

Now checks if token is blacklisted before allowing access:
- Rejects blacklisted tokens with 401 status
- Attaches token to request for logout function

### 3. **Logout Endpoint** (`POST /api/auth/logout`)

Protected route that:
- Requires valid JWT token in Authorization header
- Blacklists the token immediately
- Prevents token reuse after logout

---

## 🧪 How to Test

### **CURL:**
```bash
# 1. First, login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'

# Copy the token from response

# 2. Then logout with the token
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **JavaScript/Fetch:**
```javascript
// 1. Login
const loginRes = await fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    email: "test@example.com", 
    password: "SecurePass123!" 
  })
});

const loginData = await loginRes.json();
const token = loginData.token;

// 2. Logout
const logoutRes = await fetch("http://localhost:3000/api/auth/logout", {
  method: "POST",
  headers: { 
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});

const logoutData = await logoutRes.json();
console.log(logoutData);
// Output: { msg: "Logout successful...", user: { id: "...", email: "..." } }

// 3. Try to use the same token again (should fail)
const protectedRes = await fetch("http://localhost:3000/api/protected", {
  method: "GET",
  headers: { "Authorization": `Bearer ${token}` }
});

if (protectedRes.status === 401) {
  console.log("✅ Token successfully invalidated!");
}
```

### **PowerShell:**
```powershell
# 1. Login
$loginBody = @{
    email = "test@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

$loginRes = Invoke-WebRequest -Uri http://localhost:3000/api/auth/login `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $loginBody

$token = ($loginRes.Content | ConvertFrom-Json).token

# 2. Logout
$logoutRes = Invoke-WebRequest -Uri http://localhost:3000/api/auth/logout `
  -Method POST `
  -Headers @{
    "Authorization"="Bearer $token"
    "Content-Type"="application/json"
  }

Write-Host $logoutRes.Content
```

---

## 📊 Response Examples

### ✅ **Successful Logout (200)**
```json
{
  "msg": "Logout successful. Token has been invalidated.",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

### ❌ **No Token (400)**
```json
{
  "msg": "No token found. Unable to logout."
}
```

### ❌ **Already Logged Out (401)**
```json
{
  "msg": "Token has been revoked. Please login again."
}
```

### ❌ **Expired Token (401)**
```json
{
  "msg": "Token has expired. Please login again."
}
```

---

## 🔒 Security Features

| Feature | Benefit |
|---------|---------|
| **Token Blacklist** | Prevents token reuse after logout |
| **Automatic Cleanup** | Removes expired tokens from memory every hour |
| **Stateless Auth** | No database query needed to check blacklist |
| **Time-Limited** | Blacklist entries expire with the token |

---

## 🔄 Frontend Implementation

### **React Example:**
```javascript
// authService.js
export const logout = async (token) => {
  const response = await fetch('http://localhost:3000/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    // Remove token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login
    window.location.href = '/login';
  }
};

// Usage in component
const handleLogout = async () => {
  const token = localStorage.getItem('token');
  await logout(token);
};
```

### **Vue Example:**
```javascript
// logoutAction in Vuex store
logout({ commit }) {
  const token = this.state.token;
  
  fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(() => {
    commit('SET_TOKEN', null);
    commit('SET_USER', null);
    router.push('/login');
  });
}
```

---

## ⚙️ Configuration

### **Change Blacklist Cleanup Interval:**
Edit `server.js`:
```javascript
// Default: Every 1 hour
startBlacklistCleanup(60 * 60 * 1000);

// Custom: Every 30 minutes
startBlacklistCleanup(30 * 60 * 1000);
```

### **Disable Blacklist (Dev Only):**
If you want to skip blacklist checking during testing:
```javascript
// In authMiddleware.js
export const verifyToken = (req, res, next) => {
  // ... (skip blacklist check for testing)
  
  // Verify token directly without checking blacklist
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
};
```

---

## 📈 Monitoring

### **Check Blacklist Size:**
Add this to your monitoring dashboard:
```javascript
import { getBlacklistSize } from "./middleware/tokenBlacklist.js";

app.get("/api/admin/blacklist-size", (req, res) => {
  res.json({ 
    blacklistSize: getBlacklistSize(),
    timestamp: new Date()
  });
});
```

### **Clear Blacklist (Testing Only):**
```javascript
import { clearBlacklist } from "./middleware/tokenBlacklist.js";

// Never do this in production!
app.get("/api/test/clear-blacklist", (req, res) => {
  clearBlacklist();
  res.json({ msg: "Blacklist cleared" });
});
```

---

## 🚀 Files Modified

- `src/middleware/tokenBlacklist.js` - NEW
- `src/middleware/authMiddleware.js` - Updated to check blacklist
- `src/controllers/authController.js` - Added logout function
- `src/routes/authRoutes.js` - Added logout route
- `server.js` - Initialize blacklist cleanup

---

## 🔐 Flow Diagram

```
User Login
    ↓
Returns Token (expires in 7 days)
    ↓
Token stored in localStorage
    ↓
User clicks Logout
    ↓
POST /api/auth/logout with token
    ↓
✅ Token added to blacklist
    ↓
Token removed from localStorage
    ↓
Redirect to login page
    ↓
Try to use old token → 401 Unauthorized
    ↓
"Token has been revoked. Please login again."
```

---

## ⚠️ Important Notes

1. **Token Blacklist is In-Memory** - Restarting the server clears the blacklist
   - For production, use Redis for persistent blacklist
   
2. **One Token Per User** - No enforced limit
   - User can login on multiple devices with different tokens
   - Each token can be individually logged out

3. **Token Lifetime** - 7 days
   - After 7 days, token expires naturally even if not blacklisted
   - Blacklist entries are cleaned up after token expiry

4. **No Database Queries** - Blacklist check is O(1) lookup
   - Very fast, no performance impact
   - Scales well for millions of users

---

## 🔧 Production Recommendations

1. **Use Redis for Blacklist:**
```javascript
import redis from "redis";

const client = redis.createClient();

export const blacklistToken = (token, expiresIn) => {
  client.setex(`blacklist:${token}`, expiresIn, '1');
};

export const isTokenBlacklisted = (token) => {
  return client.get(`blacklist:${token}`) !== null;
};
```

2. **Add Rate Limiting on Logout:**
```javascript
router.post("/logout", verifyToken, logoutLimiter, logout);
```

3. **Log Logout Events:**
```javascript
console.log(`User ${req.user.id} logged out at ${new Date()}`);
```

4. **Monitor Blacklist Size:**
```javascript
setInterval(() => {
  console.log(`Blacklist size: ${getBlacklistSize()}`);
}, 60000); // Check every minute
```
