export default function ImageGallery({images}){


return(

<div>


{
images.map((img)=>(


<img

key={img}

src={img}

/>


))

}


</div>


)

}