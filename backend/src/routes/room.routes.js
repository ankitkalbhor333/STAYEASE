import express from "express";

import * as roomController from "../controllers/room.controller.js";
import auth from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import isOwner from "../middlewares/isOwner.js";

const router = express.Router();

router.post(
  "/",
  auth,
  upload.array("images", 10),
  roomController.createRoom
);

router.get(
  "/",
  roomController.getAllRooms
);

router.get(
  "/:id",
  roomController.getRoomById
);

router.put(
  "/:id",
  auth,
  isOwner,
  upload.array("images", 10),
  roomController.updateRoom
);

router.delete(
  "/:id",
  auth,
  isOwner,
  roomController.deleteRoom
);

export default router;
