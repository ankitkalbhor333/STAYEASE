import api from "./axios";

export const createRoomAPI = () => {
  return api.post("/v1/rooms");
};

export const updateRoomStepAPI = (id, step, data) => {
  return api.patch(`/v1/rooms/${id}?step=${step}`, data);
};

export const getProgressAPI = (id) => {
  return api.get(`/v1/rooms/${id}/progress`);
};

export const publishRoomAPI = (id) => {
  return api.patch(`/v1/rooms/${id}/publish`);
};

export const getMyRoomsAPI = (status) => {
  const params = status ? { status } : {};
  return api.get(`/v1/rooms/my-rooms`, { params });
};

export const uploadRoomPhotosAPI = (id, formData, replaceAll = true) => {
  return api.patch(`/v1/rooms/${id}`, formData, {
    params: { step: "images", replaceAll },
  });
};

export const getLatestDraftRoomAPI = () => {
  return api.get(`/v1/rooms/resume-draft`);
};

export const getRoomStatsAPI = () => {
  return api.get("/v1/rooms/stats");
};

export const getDraftRoomsAPI = () => {
  return api.get("/v1/rooms/my-draft-rooms");
};

export const getPublishReadinessAPI = (id) => {
  return api.get(`/v1/rooms/${id}/publish-readiness`);
};

export const deleteRoomAPI = (id) => {
  return api.delete(`/v1/rooms/${id}`);
};

export const getOwnerBookingsAPI = () => {
  return api.get("/v1/bookings/owner/bookings");
};