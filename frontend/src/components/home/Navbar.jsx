import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Navbar({ user, onOpenAuth, onLogout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();


  useEffect(() => {
    const closeDropdown = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeDropdown);

    return () =>
      document.removeEventListener("mousedown", closeDropdown);

  }, []);


  const initials = () => {
    if (!user?.name) return "U";

    return user.name
      .split(" ")
      .map(x => x[0])
      .join("")
      .slice(0,2)
      .toUpperCase();
  };


  const avatar = user?.profileImage
    ? `${API_URL}/uploads/${user.profileImage}`
    : null;


  const isHost = user?.role === "OWNER";


  const menuLinks = [
    {
      label:"My Profile",
      path:"/profile"
    },
    {
      label:"My Bookings",
      path:"/bookings"
    },
    {
      label:"Edit Profile",
      path:"/edit-profile"
    }
  ];


  const hostLinks = [
    {
      label:"Host Dashboard",
      path:"/owner"
    },
    {
      label:"Create Listing",
      path:"/owner/create"
    },
    {
      label:"My Listings",
      path:"/owner/rooms"
    }
  ];



  return (

<header className="
border-b border-slate-100 
bg-white sticky top-0 z-50
px-6 md:px-12 py-4
">

<div className="
max-w-7xl mx-auto 
flex justify-between items-center
">


{/* LOGO */}

<Link
to="/"
className="
text-3xl font-black 
text-[#B40032]
tracking-wide
"
>
StayEase
</Link>



{/* NAV */}

<nav className="hidden md:flex gap-8">

<Link
to="/"
className="
font-semibold
border-b-2
border-slate-800
pb-1
"
>
Stays
</Link>


<Link
to="/about"
className="text-slate-500 hover:text-black"
>
About
</Link>


<Link
to="/contact"
className="text-slate-500 hover:text-black"
>
Contact
</Link>


<Link
to="/help"
className="text-slate-500 hover:text-black"
>
Help Center
</Link>


</nav>




<div className="flex items-center gap-4">


{/* HOST BUTTON */}

<button
onClick={()=>navigate(isHost ? "/owner":"/host")}
className="
hidden lg:block
bg-[#B40032]
text-white
px-5 py-2.5
rounded-full
font-semibold
hover:bg-red-700
transition
"
>

{isHost ? 
"Owner Dashboard":
"Become a host"}

</button>





{/* PROFILE */}

<div
ref={dropdownRef}
className="relative"
>


<button

aria-label="profile menu"

onClick={()=>setOpen(!open)}

className="
flex items-center gap-3
border
rounded-full
px-3 py-1.5
hover:shadow-md
"
>


<span className="
text-slate-500
text-xl
">
☰
</span>



<div className="
w-9 h-9
rounded-full
bg-slate-100
overflow-hidden
flex items-center justify-center
font-bold
"
>

{
avatar ?

<img
src={avatar}
className="w-full h-full object-cover"
/>

:

<span className="text-[#B40032]">
{initials()}
</span>

}


</div>


</button>





{
open && (

<div
className="
absolute right-0
mt-3
w-64
bg-white
rounded-2xl
shadow-xl
border
py-3
"
>


{
user ?

<>


<div className="
px-5 py-3
border-b
"
>

<p className="text-xs text-slate-400">
SIGNED IN AS
</p>


<p className="font-bold truncate">
{user.name}
</p>

</div>



{
menuLinks.map(item=>(

<Link

key={item.path}

to={item.path}

onClick={()=>setOpen(false)}

className="
block
px-5 py-2.5
hover:bg-slate-50
font-medium
"
>

{item.label}

</Link>

))

}



{
isHost &&

<>

<hr/>

{
hostLinks.map(item=>(

<Link

key={item.path}

to={item.path}

className="
block
px-5 py-2.5
hover:bg-slate-50
"
>

{item.label}

</Link>


))

}

</>

}



<hr/>


<button

onClick={()=>{

setOpen(false);
onLogout();

}}

className="
w-full
text-left
px-5 py-2.5
text-[#B40032]
font-bold
hover:bg-red-50
"
>

Logout

</button>


</>


:


<>

<button

onClick={()=>onOpenAuth("register")}

className="menu"

>
Sign Up
</button>


<button

onClick={()=>onOpenAuth("login")}

className="menu"

>
Login
</button>


<hr/>


<button

onClick={()=>navigate("/host")}

className="
px-5 py-2.5
text-left
text-[#B40032]
font-semibold
"

>

✨ Become a host

</button>


</>

}



</div>

)

}


</div>


</div>


</div>


</header>

  );
}