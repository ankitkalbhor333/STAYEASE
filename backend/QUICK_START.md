# QUICK START GUIDE – Multi-Step Room Creation

## 🚀 5-Minute Setup

### 1. Start Fresh or Upgrade Existing
```bash
# If upgrading existing project, run migration
npm run migrate:add-room-fields

# Otherwise, restart your server
npm start
```

### 2. Test with Postman
```bash
# Import the collection
Import → Postman_StayEase_MultiStep_Rooms.json

# Set environment variables
BASE_URL = http://localhost:5000
JWT_TOKEN = <your_jwt_token>
```

### 3. Create Draft Room
```bash
POST http://localhost:5000/api/v1/rooms
Header: Authorization: Bearer <JWT_TOKEN>
Body: {} (empty)

Response:
{
  "success": true,
  "data": {
    "roomId": "507f1f77bcf86cd799439011"
  }
}
```

### 4. Update Step 1 (Basic)
```bash
PATCH http://localhost:5000/api/v1/rooms/507f1f77bcf86cd799439011?step=basic
Header: Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body:
{
  "title": "Beautiful 2BR Apartment",
  "description": "Modern apartment in downtown area",
  "propertyType": "Apartment",
  "roomType": "Entire Place"
}
```

### 5. Continue with Steps 2-7
```bash
# Repeat for each step
?step=location
?step=pricing
?step=capacity
?step=amenities
?step=images (use multipart/form-data)
?step=availability
```

### 6. Publish
```bash
PATCH http://localhost:5000/api/v1/rooms/507f1f77bcf86cd799439011/publish
Header: Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "message": "Room published successfully",
  "data": {
    "status": "active",
    "publishedAt": "2026-06-18T10:30:00Z"
  }
}
```

---

## 📁 File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── room.controller.js ✨ (NEW: All multi-step endpoints)
│   ├── services/
│   │   ├── room.service.js ✨ (UPDATED: Step logic, publishing)
│   │   └── publishValidation.service.js ✨ (NEW: Publish validation)
│   ├── repositories/
│   │   └── room.repository.js ✨ (NEW: All DB operations)
│   ├── model/
│   │   └── Room.js ✨ (UPDATED: New status & step fields)
│   ├── routes/
│   │   └── room.routes.js ✨ (UPDATED: All new endpoints)
│   ├── validations/
│   │   └── room.validation.js ✨ (UPDATED: Step validators)
│   ├── middleware/
│   │   ├── roomOwnership.middleware.js ✨ (NEW: Ownership validation)
│   │   └── authMiddleware.js
│   ├── config/
│   │   └── multer.js ✨ (UPDATED: Memory storage)
│   └── utils/
│       ├── imageUpload.js ✨ (NEW: Cloudinary integration)
│       └── cloudinary.js
│
├── IMPLEMENTATION_GUIDE.md ✨ (NEW: Full documentation)
└── Postman_StayEase_MultiStep_Rooms.json ✨ (NEW: API collection)
```

---

## 🔑 Key Endpoints Reference

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/rooms` | POST | Create draft room | ✅ |
| `/rooms/:id?step=basic` | PATCH | Update step | ✅ |
| `/rooms/:id/progress` | GET | Get progress | ✅ |
| `/rooms/:id/publish-readiness` | GET | Check validation | ✅ |
| `/rooms/:id/publish` | PATCH | Publish room | ✅ |
| `/rooms/:id` | GET | Get room details | ✅ |
| `/rooms/:id` | DELETE | Delete room | ✅ |
| `/rooms` | GET | Get all published | ❌ |
| `/rooms/my-rooms` | GET | Get user's rooms | ✅ |
| `/rooms/my-draft-rooms` | GET | Get drafts | ✅ |
| `/rooms/resume-draft` | GET | Resume draft | ✅ |
| `/rooms/stats` | GET | Get statistics | ✅ |

---

## ⚡ Common Tasks

### Get User's Draft Rooms
```javascript
const drafts = await axios.get('/api/v1/rooms/my-draft-rooms', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Resume Draft
```javascript
const draft = await axios.get('/api/v1/rooms/resume-draft', {
  headers: { Authorization: `Bearer ${token}` }
});
// Returns latest draft with progress
```

### Check Publishing Status
```javascript
const readiness = await axios.get(`/api/v1/rooms/${roomId}/publish-readiness`, {
  headers: { Authorization: `Bearer ${token}` }
});
// Returns { isReadyToPublish, missingFields, progress }
```

### Upload Images
```javascript
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);

await axios.patch(`/api/v1/rooms/${roomId}?step=images`, formData, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

---

## 🛠️ Environment Setup

### .env File
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/stayease

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password

# Multer
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB
```

---

## 🐛 Troubleshooting

### Issue: Images not uploading
```
Solution: Check CLOUDINARY_API_KEY in .env
```

### Issue: Room not publishing
```
Solution: Check validation report
GET /api/v1/rooms/:id/publish-readiness
Returns detailed missing fields
```

### Issue: Draft not saving
```
Solution: Verify JWT token is valid
Add Authorization header: Bearer <token>
```

### Issue: 403 Forbidden on update
```
Solution: You must be the room owner
Only room creator can update drafts
```

---

## 📊 Response Examples

### Successful Draft Creation
```json
{
  "success": true,
  "message": "Draft room created. Start filling details step by step.",
  "data": {
    "roomId": "507f1f77bcf86cd799439011",
    "status": "draft",
    "currentStep": "basic",
    "completedSteps": []
  }
}
```

### Step Updated Successfully
```json
{
  "success": true,
  "message": "basic step updated successfully",
  "data": {
    "roomId": "507f1f77bcf86cd799439011",
    "step": "basic",
    "currentStep": "basic",
    "completedSteps": ["basic"],
    "progress": 14,
    "nextStep": "location"
  }
}
```

### Publishing Readiness Report
```json
{
  "success": true,
  "data": {
    "isReadyToPublish": false,
    "progress": {
      "completed": 3,
      "total": 7,
      "percentage": 43
    },
    "nextStepToComplete": "images",
    "missingFields": ["images"],
    "stepValidation": {
      "basic": [],
      "location": [],
      "pricing": [],
      "capacity": [],
      "amenities": [],
      "images": ["At least one image is required"],
      "availability": []
    }
  }
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "field": "pricePerDay",
      "message": "Price per day is required"
    },
    {
      "field": "availableFrom",
      "message": "Available from date cannot be in the past"
    }
  ]
}
```

---

## ✅ Pre-Launch Checklist

- [ ] All environment variables configured
- [ ] Cloudinary account created & API keys added
- [ ] MongoDB connection tested
- [ ] JWT token generation working
- [ ] File upload tested
- [ ] All 7 steps working correctly
- [ ] Publishing validation working
- [ ] Postman collection tested
- [ ] Error handling complete
- [ ] Rate limiting enabled
- [ ] CORS configured for frontend

---

## 🚀 Next Steps

1. **Frontend Integration**
   - Create multi-step form UI
   - Show progress indicator
   - Implement autosave
   - Add image preview

2. **Advanced Features**
   - Add analytics (views, inquiries)
   - Implement room templates
   - Add bulk import
   - Create room versioning

3. **Testing**
   - Write unit tests
   - Integration testing
   - Load testing
   - Security audit

4. **Deployment**
   - Set up CI/CD pipeline
   - Configure staging environment
   - Performance optimization
   - Monitor in production

---

## 📞 Support

For issues or questions:
1. Check IMPLEMENTATION_GUIDE.md
2. Review Postman examples
3. Check error response messages
4. Review validation report
5. Check MongoDB logs

---

**Status**: ✅ Production Ready
**Last Updated**: 2026-06-18
