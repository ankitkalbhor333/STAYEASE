# PHASE 5A – MULTI-STEP ROOM CREATION WIZARD IMPLEMENTATION

## Overview

This document provides a comprehensive guide to the **Production-Grade Multi-Step Room Creation Wizard** for StayEase, a short-term rental platform similar to Airbnb.

---

## 🎯 Architecture & Design

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    ROUTES LAYER                              │
│           (Express route handlers & validation)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  CONTROLLERS LAYER                           │
│         (HTTP request/response handling logic)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   SERVICES LAYER                             │
│        (Business logic & orchestration)                      │
├─────────────────────────────────────────────────────────────┤
│  - room.service.js (Main business logic)                     │
│  - publishValidation.service.js (Publish validation)         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                REPOSITORY LAYER                              │
│        (Database abstraction & queries)                      │
│       - room.repository.js (All DB operations)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              UTILITIES & MIDDLEWARE                          │
│  - imageUpload.js (Cloudinary integration)                   │
│  - roomOwnership.middleware.js (Access control)              │
│  - room.validation.js (Input validation)                     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. User Creates Draft
   POST /api/v1/rooms → createDraftRoom() → Room created with status: "draft"

2. User Updates Step (Autosave)
   PATCH /api/v1/rooms/:id?step=basic → updateRoomStep() → Step saved & progress tracked

3. User Uploads Images
   PATCH /api/v1/rooms/:id?step=images → uploadImagesToCloudinary() → Stored in Cloudinary

4. User Checks Progress
   GET /api/v1/rooms/:id/progress → getRoomProgress() → Returns completion %

5. User Publishes
   PATCH /api/v1/rooms/:id/publish → validateRoomForPublishing() → If valid, status = "active"
```

---

## 📋 API Endpoints

### 1. Draft Creation
```
POST /api/v1/rooms
├─ Auth: Required (JWT)
├─ Request: Empty body
└─ Response: { roomId, status, currentStep, completedSteps }
```

### 2. Multi-Step Updates (Autosave)
```
PATCH /api/v1/rooms/:roomId?step=<step>
├─ Auth: Required
├─ Steps: basic, location, pricing, capacity, amenities, images, availability
├─ Body: Step-specific fields
└─ Response: Updated room with progress
```

### 3. Progress Tracking
```
GET /api/v1/rooms/:roomId/progress
├─ Auth: Optional
├─ Response: { completedSteps, totalSteps, progressPercentage, nextStep }
└─ Use Case: Show progress bar to user
```

### 4. Publishing Validation
```
GET /api/v1/rooms/:roomId/publish-readiness
├─ Auth: Required
├─ Response: Validation report with missing fields
└─ Use Case: Show checklist before publishing
```

### 5. Publish Room
```
PATCH /api/v1/rooms/:roomId/publish
├─ Auth: Required
├─ Validation: All steps must be complete
├─ Response: { roomId, status: "active", publishedAt }
└─ Use Case: Final publish action
```

### 6. Room Management
```
GET    /api/v1/rooms/:roomId              # Get room details
GET    /api/v1/rooms                      # Get all published rooms (public)
GET    /api/v1/rooms/my-rooms            # Get user's rooms
GET    /api/v1/rooms/my-draft-rooms      # Get user's draft rooms
GET    /api/v1/rooms/resume-draft        # Get latest draft
GET    /api/v1/rooms/stats               # Get user's room stats
DELETE /api/v1/rooms/:roomId             # Delete room
```

---

## 🔒 Security Best Practices

### 1. Authentication & Authorization
```javascript
// ✅ Every endpoint requires JWT token
router.patch("/:roomId", verifyToken, ...);

// ✅ Ownership verification
if (room.ownerId.toString() !== req.user.id) {
  return res.status(403).json({ message: "Unauthorized" });
}

// ✅ Draft status check
if (room.status !== "draft") {
  return res.status(400).json({ message: "Cannot edit published room" });
}
```

### 2. Input Validation
```javascript
// ✅ Field-level validation with express-validator
body("title")
  .trim()
  .notEmpty()
  .isLength({ min: 5, max: 150 })

// ✅ File validation
- Max 10 images per room
- Max 5MB per image
- Allowed types: JPEG, PNG, GIF, WebP

// ✅ Price validation
body("pricePerDay")
  .custom(value => {
    if (value < 0) throw new Error("Cannot be negative");
    if (value > 1000000) throw new Error("Too high");
    return true;
  })
```

### 3. Rate Limiting
```javascript
// Add to routes for draft creation
import rateLimit from "express-rate-limit";

const createDraftLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // Max 5 draft rooms per 15 min
});

router.post("/", verifyToken, createDraftLimiter, createDraftRoom);
```

### 4. Cloudinary Security
```javascript
// ✅ Folder-based organization
uploadImageToCloudinary(file, "stayease/rooms")

// ✅ Resource type validation
allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"]

// ✅ Size limits
Max 5MB per image

// ✅ Secure URLs
cloudinary.url(publicId, { fetch_format: "auto" })
```

### 5. Data Protection
```javascript
// ✅ Soft deletes (GDPR compliant)
status: { deleted } // Never hard delete

// ✅ Sensitive info not exposed
populate("ownerId", "name email") // Only expose safe fields

// ✅ Password never returned
.select("-password")
```

---

## 🔧 Implementation Guide

### Step 1: Install Dependencies
```bash
npm install mongoose express-validator multer cloudinary dotenv
```

### Step 2: Environment Variables
```env
MONGODB_URI=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
```

### Step 3: Register Routes
```javascript
// server.js
import roomRoutes from "./routes/room.routes.js";
app.use("/api/v1/rooms", roomRoutes);
```

### Step 4: Error Handling
```javascript
// Add to server.js
app.use((err, req, res, next) => {
  console.error(err);
  
  if (err.statusCode === 400 && err.validation) {
    return res.status(400).json({
      success: false,
      message: err.message,
      validation: err.validation
    });
  }
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message
  });
});
```

---

## 📊 Database Schema

### Room Collection
```javascript
{
  // Step 1: Basic Information
  title: String,
  description: String,
  propertyType: String,
  roomType: String,

  // Step 2: Location
  country: String,
  state: String,
  city: String,
  area: String,
  fullAddress: String,
  pincode: String,
  phoneNumber: String,

  // Step 3: Pricing
  pricePerDay: Number,
  pricePerWeek: Number,
  pricePerMonth: Number,
  cleaningFee: Number,
  securityDeposit: Number,

  // Step 4: Capacity
  maxGuests: Number,
  bedrooms: Number,
  beds: Number,
  bathrooms: Number,

  // Step 5: Amenities
  amenities: {
    wifi: Boolean,
    kitchen: Boolean,
    parking: Boolean,
    washingMachine: Boolean,
    airConditioner: Boolean,
    tv: Boolean,
    geyser: Boolean,
    workspace: Boolean
  },

  // Step 6: Images
  images: [{
    imageUrl: String,
    publicId: String
  }],

  // Step 7: Availability
  availableFrom: Date,
  availableTo: Date,

  // Ownership
  ownerId: ObjectId, // Reference to User

  // Status & Tracking
  status: String, // draft, active, inactive, deleted
  currentStep: String,
  completedSteps: [String],
  publishedAt: Date,
  lastSavedAt: Date,

  // Ratings
  averageRating: Number,
  totalReviews: Number,

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes for Performance
```javascript
roomSchema.index({
  city: 1,
  state: 1,
  propertyType: 1,
  pricePerDay: 1
});

roomSchema.index({ status: 1 });
roomSchema.index({ ownerId: 1 });
roomSchema.index({ createdAt: -1 });
```

---

## 🚀 Performance Optimization

### 1. Image Optimization
```javascript
// Cloudinary transformations for different sizes
{
  thumbnail: 150x150,
  card: 300x200,
  medium: 600x400,
  large: 1200x800,
  original: Full quality
}
```

### 2. Pagination
```javascript
// Get published rooms with pagination
GET /api/v1/rooms?page=1&limit=10
```

### 3. Database Queries
```javascript
// Use lean() for read-only operations
Room.find({}).lean()

// Use select() to limit fields
Room.find({}).select("title city pricePerDay images")

// Use indexing for common queries
index: { city: 1, state: 1 }
```

### 4. Caching Strategy
```javascript
// Cache published rooms list (1 hour)
// Cache room stats (5 minutes)
// Cache progress (Real-time, no cache)
```

---

## 🛠️ Advanced Features

### 1. Auto-Save
```javascript
// Frontend sends PATCH request every 30 seconds
setInterval(() => {
  fetch(`/api/v1/rooms/${roomId}?step=basic`, {
    method: "PATCH",
    body: JSON.stringify(formData)
  });
}, 30000);
```

### 2. Draft Resume
```javascript
// User can resume from where they left off
GET /api/v1/rooms/resume-draft
// Returns: { roomId, currentStep, progress }
```

### 3. Progress Tracking
```javascript
// Get completion percentage
GET /api/v1/rooms/:roomId/progress
// Returns: { progressPercentage: 57, nextStep: "pricing" }
```

### 4. Soft Deletes
```javascript
// Deleted rooms are recoverable
DELETE /api/v1/rooms/:roomId
// Sets status = "deleted"
```

---

## ✨ User Experience Enhancements

### 1. Progress Indicator
```
Step 1: Basic Info ✅
Step 2: Location ✅
Step 3: Pricing ✅
Step 4: Capacity ⏳ (In Progress)
Step 5: Amenities ⭕
Step 6: Images ⭕
Step 7: Availability ⭕

Progress: 3/7 (43%)
```

### 2. Validation Messages
```
"Price per day must be between 0 and 1000000"
"At least one image is required"
"Available from date must be in the future"
```

### 3. Auto-Save Indicator
```
"Saving..." → "Last saved 2 minutes ago" ✓
```

### 4. Publishing Checklist
```
BEFORE PUBLISHING:
✅ Basic Information Complete
✅ Location Complete
✅ Pricing Complete
✅ Capacity Complete
❌ Images (Missing)
✅ Availability Set
```

---

## 📈 Scalability Improvements

### 1. Database
```
- MongoDB replication for high availability
- Read replicas for heavy query loads
- Proper indexing on frequently queried fields
- TTL indexes for temporary data (auto-cleanup)
```

### 2. Storage
```
- Cloudinary CDN for global image distribution
- Image optimization per device (responsive)
- Lazy loading on frontend
- WebP format for modern browsers
```

### 3. Caching
```
- Redis for session management
- Cache published rooms list
- Cache user's room stats
- Cache popular search filters
```

### 4. API Rate Limiting
```
- 100 requests/minute for authenticated users
- 20 requests/minute for unauthenticated users
- 5 draft rooms creation per 15 minutes per user
```

---

## 🧪 Testing

### Unit Tests
```javascript
// Test validators
test("basicStepValidator rejects empty title", () => {
  // Test implementation
});

// Test repository functions
test("createDraftRoom creates room with correct defaults", async () => {
  // Test implementation
});
```

### Integration Tests
```javascript
// Test full workflow
test("Multi-step room creation workflow", async () => {
  // 1. Create draft
  // 2. Update all 7 steps
  // 3. Check progress
  // 4. Publish
  // 5. Verify status is active
});
```

### API Tests
```javascript
// Test with Postman collection
// Run: postman run Postman_StayEase_MultiStep_Rooms.json
```

---

## 📝 Logging & Monitoring

### Structured Logging
```javascript
logger.info("Room published", {
  roomId: room._id,
  userId: req.user.id,
  timestamp: new Date(),
  step: "publish"
});

logger.error("Image upload failed", {
  roomId: room._id,
  error: error.message
});
```

### Metrics to Track
```
- Draft rooms created per day
- Rooms successfully published
- Images uploaded per room (average)
- Average time to publish
- Abandoned draft rooms
- Failed validations
```

---

## 🔄 Migration Guide (If Upgrading Existing DB)

```javascript
// Migration script to add new fields
db.rooms.updateMany(
  {},
  {
    $set: {
      status: "active",
      completedSteps: ["basic", "location", "pricing", "capacity", "amenities", "images", "availability"],
      currentStep: "availability",
      publishedAt: new Date(),
      lastSavedAt: new Date()
    }
  }
);
```

---

## 📚 Resources & References

1. **Mongoose Documentation**: https://mongoosejs.com
2. **Express Validator**: https://express-validator.github.io/docs
3. **Cloudinary API**: https://cloudinary.com/documentation
4. **JWT Best Practices**: https://tools.ietf.org/html/rfc7519
5. **REST API Design**: https://restfulapi.net

---

## ⚠️ Known Limitations & Future Improvements

### Current Limitations
1. Images stored only in Cloudinary (no local fallback)
2. Single room creation (no multi-property workspaces yet)
3. No image reordering after upload

### Future Enhancements
1. Workspace feature (manage multiple properties)
2. Room templates (save as template, duplicate)
3. Bulk import (CSV upload)
4. Advanced analytics (views, inquiries per room)
5. Room versioning (history of changes)
6. A/B testing for room descriptions
7. AI-powered title/description suggestions

---

## 🎓 Summary

This implementation provides a **production-grade multi-step room creation wizard** that:

✅ Follows **clean architecture** principles
✅ Implements **JWT authentication** for security
✅ Validates **all inputs** with express-validator
✅ Integrates with **Cloudinary** for image management
✅ Supports **autosave** functionality
✅ Tracks **progress** accurately
✅ Publishes with **comprehensive validation**
✅ Handles **soft deletes** for GDPR compliance
✅ Provides **detailed API documentation**
✅ Scales to **production requirements**

---

**Last Updated**: 2026-06-18
**Version**: 1.0.0
**Status**: Production Ready ✅
