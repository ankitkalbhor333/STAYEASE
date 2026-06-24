import api from "./axios";

export const searchRoomsAPI = async (queryParams) => {
  return api.get("/v1/rooms/search",{ params: queryParams });
}

export const getRoomDetailsAPI=(id)=>
  {
     return api.get(

`/v1/rooms/${id}`

)


}