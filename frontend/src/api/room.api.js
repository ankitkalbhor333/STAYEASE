import api from "./axios";

export const searchRoomsAPI = async (queryParams) => {
  return api.get("/v1/rooms/search", { params: queryParams });
};

export const getRoomByIdAPI = (id) => {
  return api.get(`/v1/rooms/${id}`);
};

export const getRoomDetailsAPI = getRoomByIdAPI;
