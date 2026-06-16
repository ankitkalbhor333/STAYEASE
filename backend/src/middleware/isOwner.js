import Room from "../models/room.model.js";

export default async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found",
    });
  }

  if (room.ownerId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  req.room = room;

  next();
};
