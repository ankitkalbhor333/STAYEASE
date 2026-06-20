export const EDITABLE_ROOM_STATUSES = ["draft", "active", "inactive"];

export const isRoomEditable = (status) =>
  EDITABLE_ROOM_STATUSES.includes(status || "draft");

export const getRoomOwnerId = (room) => {
  if (!room?.ownerId) return null;
  return room.ownerId._id?.toString() || room.ownerId.toString();
};
