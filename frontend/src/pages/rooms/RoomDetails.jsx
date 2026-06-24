import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRoomDetailsAPI } from "../../api/room.api";
import ImageGallery from "../../components/room/ImageGallery";
import Amenities from "../../components/room/Amenities";
import PriceBox from "../../components/room/PriceBox";
import useAuth from "../../hooks/useAuth";

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeRoom = (roomData) => {
    if (!roomData) return null;

    const images = Array.isArray(roomData.images)
      ? roomData.images
          .map((image) => image?.imageUrl || image)
          .filter(Boolean)
      : [];

    const amenities = roomData.amenities && typeof roomData.amenities === "object"
      ? Object.entries(roomData.amenities)
          .filter(([, value]) => value === true || value === "true")
          .map(([key]) => {
            const map = {
              wifi: "WiFi",
              kitchen: "Kitchen",
              parking: "Parking",
              washingMachine: "Washer",
              airConditioner: "Air Conditioning",
              tv: "TV",
              geyser: "Hot Tub",
            };
            return map[key] || key;
          })
      : [];

    return {
      ...roomData,
      images,
      amenities,
      owner: roomData.ownerId || roomData.owner,
      price: roomData.pricePerDay || roomData.price || 0,
    };
  };

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const res = await getRoomDetailsAPI(id);
        setRoom(normalizeRoom(res.data.data));
      } catch (err) {
        setError(err.message || "Failed to load room details");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <svg
            className="w-12 h-12 text-[#B40032]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#B40032] text-white px-4 py-2 rounded-lg hover:bg-[#8c0126]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 text-lg">Room not found</p>
      </div>
    );
  }

  const handleBooking = (bookingData) => {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate(`/rooms/${id}/book`, { state: bookingData });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Back Button */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 md:px-8 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-medium">Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <ImageGallery images={room.images} />

            {/* Room Info */}
            <div className="border-b border-slate-200 pb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                    {room.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-slate-600">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      {room.city || room.state || room.fullAddress || room.location || "Unknown location"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-2">
                    <svg
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{room.rating || 4.8}</span>
                  </div>
                  <p className="text-sm text-slate-500">
                    ({room.reviews || 128} reviews)
                  </p>
                </div>
              </div>
            </div>

            {/* Room Description */}
            <div className="grid gap-8">
              {room.description && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">About</h2>
                  <p className="text-slate-700 leading-relaxed">{room.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-3xl bg-white border border-slate-200 p-6">
                  <p className="text-sm uppercase tracking-widest text-slate-400 mb-2">Guests</p>
                  <p className="text-3xl font-bold text-slate-900">{room.guests || 4}</p>
                </div>
                <div className="rounded-3xl bg-white border border-slate-200 p-6">
                  <p className="text-sm uppercase tracking-widest text-slate-400 mb-2">Bedrooms</p>
                  <p className="text-3xl font-bold text-slate-900">{room.bedrooms || 2}</p>
                </div>
                <div className="rounded-3xl bg-white border border-slate-200 p-6">
                  <p className="text-sm uppercase tracking-widest text-slate-400 mb-2">Bathrooms</p>
                  <p className="text-3xl font-bold text-slate-900">{room.bathrooms || 2}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <Amenities amenities={room.amenities} />

            {/* Owner Info */}
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Hosted by {room.owner?.name || "Owner"}
              </h2>
              <div className="flex items-center gap-4">
                {room.owner?.profileImage && (
                  <img
                    src={room.owner.profileImage}
                    alt={room.owner.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-slate-900">
                    {room.owner?.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {room.owner?.joinedDate &&
                      `Joined ${new Date(room.owner.joinedDate).getFullYear()}`}
                  </p>
                  {room.owner?.phone && (
                    <p className="text-sm text-slate-600">
                      📞 {room.owner.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Price Box */}
          <div className="h-fit">
            <PriceBox
              price={room.price}
              roomId={room._id}
              onBooking={handleBooking}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

