import {useState} from "react";

import {
useNavigate
}
from "react-router-dom";


export default function SearchBar(){


const navigate=useNavigate();


const [location,setLocation]=useState("");



const search=()=>{


navigate(

`/rooms/search?location=${location}`

)


}



return(

<div>


<input

placeholder="Location"

onChange={
e=>setLocation(e.target.value)
}

/>


<button

onClick={search}

>

Search

</button>


</div>


)

}