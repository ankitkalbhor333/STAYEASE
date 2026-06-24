export default function Amenities({amenities}){


return(

<div>


<h3>

Amenities

</h3>


<ul>


{
amenities.map(item=>(


<li key={item}>

{item}

</li>


))

}


</ul>


</div>

)

}