import api from "./axios";

export const getRoomReviewsAPI = (roomId, query = {}) => {
  return api.get(`/v1/reviews/room/${roomId}`, {
    params: query,
  });
};

export const createReviewAPI = (reviewData) => {
  return api.post("/v1/reviews", reviewData);
};

export const deleteReviewAPI = (id) => {
  return api.delete(`/v1/reviews/${id}`);
};

