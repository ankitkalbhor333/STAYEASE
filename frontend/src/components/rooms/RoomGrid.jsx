import RoomCard 
from "./RoomCard";



export default function RoomGrid({rooms}){


return(

<div>


{
rooms.map(room=>(


<RoomCard

key={room._id}

room={room}

/>


))

}


</div>

)

}