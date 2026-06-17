import express from "express";

import * as roomController from "../controllers/room.controller.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";
import isOwner from "../middleware/isOwner.js";

const router = express.Router();

router.post(
  "/createRoom",
  verifyToken,
  upload.array("images", 10),
  roomController.createRoom
);

router.get(
  "/getAllRooms",
  roomController.getAllRooms
);

// alias for legacy clients that call `/getAllRoom` (singular)
router.get(
  "/getAllRoom",
  roomController.getAllRooms
);

router.get(
  "/:id",
  roomController.getRoomById
);

router.put(
  "/:id",
  verifyToken,
  isOwner,
  upload.array("images", 10),
  roomController.updateRoom
);

router.delete(
  "/:id",
  verifyToken,
  isOwner,
  roomController.deleteRoom
);

export default router;
