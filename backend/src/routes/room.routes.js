import express from "express";
import * as roomController from "../controllers/room.controller.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * DRAFT ROOM CREATION WORKFLOW
 */
router.post("/", verifyToken, roomController.createDraftRoom);
router.get("/resume-draft", verifyToken, roomController.getLatestDraftRoom);
router.get("/my-draft-rooms", verifyToken, roomController.getDraftRooms);
router.get("/stats", verifyToken, roomController.getRoomStats);
router.get("/my-rooms", verifyToken, roomController.getMyRooms);

/**
 * STEP-BASED UPDATE
 */
router.patch("/:roomId", verifyToken, roomController.updateRoomStep);

/**
 * PUBLISHING
 */
router.patch("/:roomId/publish", verifyToken, roomController.publishRoom);
router.get("/:roomId/progress", roomController.getRoomProgress);
router.get("/:roomId/publish-readiness", verifyToken, roomController.getPublishReadiness);

/**
 * CRUD OPERATIONS
 */
router.get("/:roomId", roomController.getRoomById);
router.delete("/:roomId", verifyToken, roomController.deleteRoom);
router.get("/", roomController.getAllRooms);

export default router;
