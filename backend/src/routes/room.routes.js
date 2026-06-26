import express from "express";
import * as roomController from "../controllers/room.controller.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { memoryUpload } from "../config/multer.js";
import { roomCreationLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

/**
 * DRAFT ROOM CREATION WORKFLOW
 */
router.post("/", verifyToken, roomCreationLimiter, roomController.createDraftRoom);
router.get("/resume-draft", verifyToken, roomController.getLatestDraftRoom);
router.get("/my-draft-rooms", verifyToken, roomController.getDraftRooms);
router.get("/stats", verifyToken, roomController.getRoomStats);
router.get("/my-rooms", verifyToken, roomController.getMyRooms);

/**
 * STEP-BASED UPDATE
 */
// Accept multipart/form-data for images step (accept any file field names)
router.patch(
	"/:roomId",
	verifyToken,
	// use .any() to avoid "Unexpected field" when client uses different field names
	memoryUpload.any(),
	roomController.updateRoomStep
);

/**
 * PUBLISHING
 */
router.patch("/:roomId/publish", verifyToken, roomController.publishRoom);
router.get("/:roomId/progress", roomController.getRoomProgress);
router.get("/:roomId/publish-readiness", verifyToken, roomController.getPublishReadiness);

/**
 * CRUD OPERATIONS
 */
router.get("/search", roomController.searchRooms);
router.get("/:roomId", roomController.getRoomById);
router.delete("/:roomId", verifyToken, roomController.deleteRoom);
router.get("/", roomController.getAllRooms);

export default router;
