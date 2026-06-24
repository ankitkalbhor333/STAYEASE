import api from "./axios"

export const getProfileAPI = () => {
  return api.get("/users/profile")
}

export const updateProfileAPI = (data) => {
  return api.put("/users/profile", data)
}

export const uploadProfileImage = (data) => {
  return api.post("/users/profile-image", data)
}