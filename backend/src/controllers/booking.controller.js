import Booking from "../model/Booking.js";
import Room from "../model/Room.js";

export const createBooking=async(req,res)=>{
 try{
  const {
    roomId,
    checkInDate,
    checkOutDate,
    checkIn,
    checkOut,
    guests = 1,
  } = req.body;

  const resolvedCheckIn = checkInDate || checkIn;
  const resolvedCheckOut = checkOutDate || checkOut;

  if (!roomId || !resolvedCheckIn || !resolvedCheckOut) {
    return res.status(400).json({
      success: false,
      message: "roomId, checkIn/checkInDate, and checkOut/checkOutDate are required",
    });
  }

  const room = await Room.findById(roomId);
  if(!room){
    return res.status(404).json({
      success:false,
      message:"Room not found"
    });
  }


const startDate = new Date(resolvedCheckIn);
const endDate = new Date(resolvedCheckOut);

if (startDate >= endDate) {
  return res.status(400).json({
    success: false,
    message: "Check-out date must be after check-in date",
  });
}

const existingBooking = await Booking.findOne({
  roomId: roomId,
  bookingStatus: "CONFIRMED",
  checkIn: { $lt: endDate },
  checkOut: { $gt: startDate },
});

if (existingBooking) {
  return res.status(400).json({
    success: false,
    message: "Room is already booked for the selected dates",
  });
}

const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
const totalAmount = days * room.pricePerDay;

const booking = await Booking.create({
  userId: req.user.id,
  roomId: roomId,
  checkIn: startDate,
  checkOut: endDate,
  totalDays: days,
  totalAmount,
  guests: Number(guests),
  bookingStatus: "CONFIRMED",
});

return res.status(201).json({
  success: true,
  message: "Booking created successfully",
  booking,
});
}
 catch(error){
  return res.status(500).json({
    success:false,    message:"Failed to create booking",
    error:error.message

  });
}
}

export const getMyBookings=async(req,res)=>{
  
  try{
    const booking = await Booking.find({userId:req.user.id}).populate("roomId");
    return res.status(200).json({
      success:true,
      message:"Bookings fetched successfully",
      booking
    });
  }
  catch(error){
    return res.status(500).json({
      success:false,
      message:"Failed to fetch bookings",
      error:error.message
    });
}
}

export const getsingleBooking=async(req,res)=>{
  try{
    const booking = await Booking.findById(req.params.id)
      .populate("roomId")
      .populate("userId");
    if(!booking){
      return res.status(404).json({
        success:false,
        message:"Booking not found"
      });
    }
    return res.status(200).json({
      success:true,
      message:"Booking fetched successfully",})
  }catch(error){
    return res.status(500).json({
      success:false,
      message:"Failed to fetch booking",
      error:error.message
    })
  }
}

export const cancelBooking=async (req,res)=>{
  try{
    const  booking=await Booking.findById(req.params.id);
    if(!booking){
      return res.status(404).json({
        success:false,
        message:"Booking not found"
      });
    }
    booking.bookingStatus="CANCELLED";
    await booking.save();
    return res.status(200).json({
      success:true,
      message:"Booking cancelled successfully"
    });
  }

  catch(error){
    return res.status(500).json({
      success:false,
      message:"Failed to cancel booking",
      error:error.message
    });
  }}
