import {useState} from "react";


export default function FilterSidebar({onFilter}){


const [filters,setFilters]=useState({

priceMin:"",
priceMax:"",
capacity:"",
roomType:"",
amenities:[]

});



const handleChange=(e)=>{


setFilters({

...filters,

[e.target.name]:e.target.value

});


}



const applyFilter=()=>{


onFilter(filters);


}



return(

<div>


<h3>
Filters
</h3>


{/* Price */}

<h4>
Price
</h4>


<input

name="priceMin"

placeholder="Min price"

value={filters.priceMin}

onChange={handleChange}

/>



<input

name="priceMax"

placeholder="Max price"

value={filters.priceMax}

onChange={handleChange}

/>



{/* Capacity */}

<h4>
Guests
</h4>


<input

type="number"

name="capacity"

placeholder="Guests"

onChange={handleChange}

/>



{/* Room Type */}

<h4>
Room Type
</h4>


<select

name="roomType"

onChange={handleChange}

>


<option value="">
All
</option>


<option value="private">
Private Room
</option>


<option value="entire">
Entire Place
</option>


<option value="shared">
Shared
</option>


</select>



{/* Amenities */}


<h4>
Amenities
</h4>


<label>

<input

type="checkbox"

value="wifi"

onChange={(e)=>{


setFilters({

...filters,

amenities:e.target.checked

?[...filters.amenities,"wifi"]

:filters.amenities.filter(
a=>a!=="wifi"
)

})


}}

/>

Wifi

</label>



<label>

<input

type="checkbox"

value="parking"

onChange={(e)=>{


setFilters({

...filters,

amenities:e.target.checked

?[...filters.amenities,"parking"]

:filters.amenities.filter(
a=>a!=="parking"
)

})


}}

/>

Parking

</label>



<button

onClick={applyFilter}

>

Apply

</button>



</div>


)

}