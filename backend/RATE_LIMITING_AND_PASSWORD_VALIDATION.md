# Rate Limiting & Password Validation Guide

## ✅ What's Been Added

### 1. **Rate Limiting Middleware** (`src/middleware/rateLimitMiddleware.js`)

Prevents brute force attacks by limiting request attempts per IP address:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/login` | 5 attempts | 15 minutes |
| `/register` | 3 attempts | 1 hour |
| `/forgot-password` | 3 attempts | 1 hour |
| `/reset-password` | 3 attempts | 1 hour |

**How it works:**
- Tracks requests by client IP address
- Returns `429 Too Many Requests` when limit exceeded
- Automatically clears old request data

### 2. **Password Validation Utility** (`src/utils/passwordValidator.js`)

Enforces strong password requirements:

✅ **Requirements:**
- ✓ Minimum 8 characters (was 6)
- ✓ At least one UPPERCASE letter (A-Z)
- ✓ At least one lowercase letter (a-z)
- ✓ At least one number (0-9)
- ✓ At least one special character (!@#$%^&*)
- ✓ Maximum 128 characters
- ✓ Not in common password list

**Example valid password:** `MyPassword123!`
**Example invalid password:** `password123` (no uppercase, no special char)

---

## 🧪 Testing

### Test Rate Limiting

```bash
# Attempt login 6 times within 15 minutes
# (First 5 succeed, 6th fails with 429)

for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"Test123!"}'
  echo "Attempt $i"
  sleep 1
done
```

**Expected response on 6th attempt:**
```json
{
  "msg": "Too many attempts. Please try again later.",
  "retryAfter": 900,
  "error": "RATE_LIMIT_EXCEEDED"
}
```

### Test Password Validation

**Weak password (registration attempt):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d {
    "name": "John",
    "email": "john@example.com",
    "password": "password123"
  }
```

**Response:**
```json
{
  "msg": "Password does not meet requirements",
  "errors": [
    "Password must contain at least one uppercase letter (A-Z)",
    "Password must contain at least one special character (!@#$%^&*...)"
  ],
  "strength": {
    "score": 2,
    "level": "Weak"
  }
}
```

**Strong password (registration succeeds):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d {
    "name": "John",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
```

---

## 🔒 Password Strength Levels

| Score | Level | Requirements Met |
|-------|-------|------------------|
| 0 | Very Weak | Few or none |
| 1 | Weak | 1-2 requirements |
| 2 | Fair | 3-4 requirements |
| 3 | Good | 4-5 requirements |
| 4 | Strong | 5-6 requirements |
| 5 | Very Strong | All + 12+ chars |

---

## 📋 Special Characters Accepted

```
! @ # $ % ^ & * ( ) _ + - = [ ] { } ; ' : " \ | , . < > / ?
```

---

## ⚙️ Configuration

To adjust rate limits, edit `rateLimitMiddleware.js`:

```javascript
// More lenient: 10 attempts per 15 minutes
export const loginLimiter = rateLimiter(10, 15 * 60 * 1000);

// Stricter: 2 attempts per 10 minutes
export const loginLimiter = rateLimiter(2, 10 * 60 * 1000);
```

To adjust password requirements, edit `passwordValidator.js`:

```javascript
// Change minimum length from 8 to 10
if (!password || password.length < 10) {
  errors.push("Password must be at least 10 characters long");
}
```

---

## 🚨 Error Responses

### Rate Limit Exceeded
```json
{
  "msg": "Too many attempts. Please try again later.",
  "retryAfter": 900,
  "error": "RATE_LIMIT_EXCEEDED"
}
```

### Weak Password
```json
{
  "msg": "Password does not meet requirements",
  "errors": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter (A-Z)"
  ],
  "strength": {
    "score": 1,
    "level": "Weak"
  }
}
```

### Common Password
```json
{
  "msg": "Password is too common. Please choose a stronger password.",
  "errors": ["This password is commonly used and not secure"]
}
```

---

## 🛡️ Security Benefits

✅ **Brute Force Protection** - Rate limiting prevents password guessing attacks
✅ **Stronger Passwords** - Complex requirements reduce account compromise
✅ **Common Password Detection** - Blocks predictable passwords
✅ **Real-Time Feedback** - Users get clear password requirements before submitting

---

## 📊 Files Modified

- `src/middleware/rateLimitMiddleware.js` - NEW
- `src/utils/passwordValidator.js` - NEW
- `src/routes/authRoutes.js` - Added rate limiters
- `src/controllers/authController.js` - Added password validation

---

## 🔄 Next Steps (Optional)

1. ✅ Test all auth endpoints with rate limiting
2. ✅ Test password validation with weak/strong passwords
3. Consider: Add login attempt tracking to lock accounts after N failures
4. Consider: Send notification emails on suspicious login attempts
5. Consider: Implement password history (prevent reusing old passwords)
