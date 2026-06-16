import Room from "../models/room.model.js";

export const createRoom = async (payload) => {
  return await Room.create(payload);
};

export const getRoomById = async (id) => {
  return await Room.findById(id)
    .populate("ownerId", "name email");
};

export const updateRoom = async (id, data) => {
  return await Room.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
    }
  );
};

export const deleteRoom = async (id) => {
  return await Room.findByIdAndUpdate(
    id,
    {
      status: "deleted",
    },
    {
      new: true,
    }
  );
};


export const getAllRooms = async (query) => {
  const filter = {
    status: "active",
  };

  if (query.city) {
    filter.city = query.city;
  }

  if (query.state) {
    filter.state = query.state;
  }

  if (query.propertyType) {
    filter.propertyType =
      query.propertyType;
  }

  if (query.guests) {
    filter.maxGuests = {
      $gte: Number(query.guests),
    };
  }

  if (query.minPrice || query.maxPrice) {
    filter.pricePerDay = {};

    if (query.minPrice) {
      filter.pricePerDay.$gte =
        Number(query.minPrice);
    }

    if (query.maxPrice) {
      filter.pricePerDay.$lte =
        Number(query.maxPrice);
    }
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  return await Room.find(filter)
    .skip(skip)
    .limit(limit);
};