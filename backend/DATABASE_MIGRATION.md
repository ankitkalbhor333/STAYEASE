# Database Migration Guide – Room Model Updates

## Overview

This guide helps you safely migrate your existing Room collection to support the new multi-step room creation feature.

---

## ⚠️ Before You Start

1. **Backup your database**
   ```bash
   mongodump --uri="mongodb+srv://..." --out ./backup
   ```

2. **Test on staging first**
   - Never run migrations on production first
   - Test with a copy of production data

3. **Plan downtime**
   - Expect 5-30 minutes depending on data size
   - Run during off-peak hours

---

## 🔄 Migration Strategies

### Option 1: Fresh Start (Recommended for New Projects)
```bash
# Simply delete old rooms collection and start fresh
# New rooms will use the updated schema automatically
```

### Option 2: Upgrade Existing Rooms
```javascript
// This script updates existing rooms to work with the new system
db.rooms.updateMany(
  {},
  {
    $set: {
      status: "active", // Mark existing as published
      completedSteps: [
        "basic",
        "location",
        "pricing",
        "capacity",
        "amenities",
        "images",
        "availability"
      ],
      currentStep: "availability",
      publishedAt: new Date(),
      lastSavedAt: new Date()
    },
    $unset: {
      // Remove any fields that don't exist in new schema
    }
  }
);
```

### Option 3: Selective Migration
```javascript
// Only migrate rooms with complete data
db.rooms.updateMany(
  {
    title: { $exists: true, $ne: null },
    description: { $exists: true, $ne: null },
    images: { $exists: true, $ne: null },
    ownerId: { $exists: true, $ne: null }
  },
  {
    $set: {
      status: "active",
      completedSteps: [
        "basic",
        "location",
        "pricing",
        "capacity",
        "amenities",
        "images",
        "availability"
      ],
      currentStep: "availability",
      publishedAt: new Date(),
      lastSavedAt: new Date()
    }
  }
);

// Archive incomplete rooms as drafts
db.rooms.updateMany(
  {
    $or: [
      { title: { $exists: false } },
      { description: { $exists: false } }
    ]
  },
  {
    $set: {
      status: "draft",
      completedSteps: [],
      currentStep: "basic",
      lastSavedAt: new Date()
    }
  }
);
```

---

## 📋 Step-by-Step Migration Process

### 1. Backup Production Data
```bash
# Using mongo shell
mongoexport --uri="mongodb+srv://user:pass@cluster.mongodb.net/stayease" \
  --collection=rooms \
  --out=rooms_backup.json

# Or using mongodump
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/stayease" \
  --out=./backup
```

### 2. Update Application Code
```bash
# Pull latest code with updated Room model
git pull origin main

# Install any new dependencies
npm install
```

### 3. Run Migration (Choose One)

#### For MongoDB Atlas (Using Dashboard)
```
1. Go to your MongoDB Atlas cluster
2. Click "Data API"
3. Copy the migration script
4. Run in Atlas App Services
```

#### For Local MongoDB (Using Mongo Shell)
```bash
# Connect to MongoDB
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/stayease"

# Run migration script
db.rooms.updateMany(
  {},
  {
    $set: {
      status: "active",
      completedSteps: [
        "basic",
        "location",
        "pricing",
        "capacity",
        "amenities",
        "images",
        "availability"
      ],
      currentStep: "availability",
      publishedAt: new Date(),
      lastSavedAt: new Date()
    }
  }
);
```

#### Using Node.js Script
```javascript
// migrate.js
import mongoose from "mongoose";
import Room from "./src/model/Room.js";

async function migrateRooms() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Update existing rooms
    const result = await Room.updateMany(
      {},
      {
        $set: {
          status: "active",
          completedSteps: [
            "basic",
            "location",
            "pricing",
            "capacity",
            "amenities",
            "images",
            "availability"
          ],
          currentStep: "availability",
          publishedAt: new Date(),
          lastSavedAt: new Date()
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} rooms`);

    // Verify migration
    const allRooms = await Room.countDocuments();
    const withStatus = await Room.countDocuments({ status: { $exists: true } });
    const withSteps = await Room.countDocuments({ completedSteps: { $exists: true } });

    console.log(`Total rooms: ${allRooms}`);
    console.log(`With status: ${withStatus}`);
    console.log(`With steps: ${withSteps}`);

    if (withStatus === allRooms && withSteps === allRooms) {
      console.log("✅ Migration successful!");
    } else {
      console.log("⚠️ Some rooms might not have been updated");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrateRooms();
```

```bash
# Run the migration script
node migrate.js
```

### 4. Verify Migration
```javascript
// Check migration results
db.rooms.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  }
]);

// Should show something like:
// { _id: "active", count: 150 }
// { _id: "inactive", count: 5 }
// { _id: "deleted", count: 2 }
```

### 5. Create Indexes
```javascript
// Ensure indexes are created for performance
db.rooms.createIndex({ status: 1 });
db.rooms.createIndex({ ownerId: 1 });
db.rooms.createIndex({ createdAt: -1 });
db.rooms.createIndex({
  city: 1,
  state: 1,
  propertyType: 1,
  pricePerDay: 1
});
```

### 6. Test in Staging
```bash
# Run full test suite
npm test

# Test specific endpoints
npm run test:rooms
```

### 7. Deploy to Production
```bash
# After successful staging test
git push origin main

# Deploy to production server
npm install --production
npm start
```

### 8. Monitor in Production
```bash
# Watch logs for errors
tail -f /var/log/stayease/error.log

# Check database for issues
db.rooms.findOne({ status: "draft" }) // Should find rooms
db.rooms.findOne({ status: "active" }) // Should find rooms
```

---

## 🔍 Validation Queries

### Check Migration Status
```javascript
// Count rooms by status
db.rooms.countDocuments({ status: "draft" })
db.rooms.countDocuments({ status: "active" })
db.rooms.countDocuments({ status: "inactive" })
db.rooms.countDocuments({ status: "deleted" })

// Check for missing fields
db.rooms.find({
  $or: [
    { status: { $exists: false } },
    { completedSteps: { $exists: false } },
    { currentStep: { $exists: false } }
  ]
})

// Check fields are correct type
db.rooms.aggregate([
  {
    $project: {
      statusType: { $type: "$status" },
      stepsType: { $type: "$completedSteps" }
    }
  },
  { $limit: 5 }
])
```

### Find Issues
```javascript
// Find rooms without required fields
db.rooms.find({
  $or: [
    { ownerId: { $exists: false } },
    { title: { $exists: false } },
    { images: { $size: 0 } }
  ]
}).limit(10)

// Check for orphaned rooms (deleted user's rooms)
db.rooms.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "ownerId",
      foreignField: "_id",
      as: "owner"
    }
  },
  {
    $match: { owner: { $eq: [] } }
  }
])
```

---

## ⏮️ Rollback Plan

If something goes wrong:

### Step 1: Stop Application
```bash
pm2 stop all
# or
docker stop stayease-api
```

### Step 2: Restore from Backup
```bash
# Using mongorestore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/stayease" \
  ./backup

# Or using MongoDB Atlas
# Go to Snapshots → Restore Snapshot
```

### Step 3: Revert Code
```bash
git revert <migration-commit-hash>
npm install
npm start
```

### Step 4: Investigate Issue
```bash
# Check error logs
tail -f logs/error.log

# Check migration script
cat migrate.js

# Check database state
mongosh "mongodb://..."
db.rooms.findOne()
```

---

## 📊 Migration Performance

### Expected Duration

| Data Size | Duration | Impact |
|-----------|----------|--------|
| < 1,000 rooms | < 1 second | Minimal |
| 1,000 - 10,000 rooms | 1-5 seconds | Low |
| 10,000 - 100,000 rooms | 5-30 seconds | Medium |
| > 100,000 rooms | 30+ seconds | High |

### Optimize Large Migrations
```javascript
// For large datasets, update in batches
const batchSize = 1000;
const totalRooms = await Room.countDocuments();

for (let i = 0; i < totalRooms; i += batchSize) {
  await Room.updateMany(
    { _id: { $gt: ObjectId.createFromTimestamp(i) } },
    { $set: { status: "active", completedSteps: [...] } },
    { limit: batchSize }
  );
  console.log(`Processed ${Math.min(i + batchSize, totalRooms)}/${totalRooms}`);
}
```

---

## 🆘 Troubleshooting

### Issue: Migration Times Out
```
Solution: Run migration during off-peak hours
Or: Process in batches (see Optimize Large Migrations)
```

### Issue: Fields Not Updated
```
Solution: Check MongoDB connection string
Verify user has write permissions
Check for query errors in logs
```

### Issue: Data Inconsistency
```
Solution: Rerun validation queries
Check for partial updates
Restore from backup and retry
```

### Issue: Application Still Failing After Migration
```
Solution 1: Check schema version matches code
Solution 2: Verify all indexes are created
Solution 3: Clear application cache
Solution 4: Restart application server
```

---

## ✅ Post-Migration Checklist

- [ ] Backup created and verified
- [ ] Code updated to latest version
- [ ] Migration script executed successfully
- [ ] All validation queries pass
- [ ] No errors in application logs
- [ ] Application starts without errors
- [ ] Can create new draft rooms
- [ ] Can update existing rooms
- [ ] Publishing validation works
- [ ] Can view all room types (draft, active)
- [ ] Frontend works with new API

---

## 📚 Additional Resources

- [MongoDB Update Operators](https://docs.mongodb.com/manual/reference/operator/update/)
- [Mongoose Migration Guide](https://mongoosejs.com/docs/migrating_to_6.html)
- [MongoDB Atlas Backup](https://docs.mongodb.com/atlas/backup/)
- [Data Recovery](https://docs.mongodb.com/manual/tutorial/recover-data-following-unexpected-shutdown/)

---

**Migration Version**: 1.0.0
**Last Updated**: 2026-06-18
**Status**: Ready for Production
