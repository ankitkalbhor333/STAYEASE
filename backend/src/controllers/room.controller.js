import * as roomService from "../services/room.service.js";

export const createRoom = async (req, res, next) => {
  try {
    const room = await roomService.createRoom({
      ...req.body,
      ownerId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (req, res, next) => {
  try {
    const room = await roomService.getRoomById(req.params.id);

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const room = await roomService.updateRoom(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    await roomService.deleteRoom(req.params.id);

    res.status(200).json({
      success: true,
      message: "Room deleted",
    });
  } catch (error) {
    next(error);
  }
};
