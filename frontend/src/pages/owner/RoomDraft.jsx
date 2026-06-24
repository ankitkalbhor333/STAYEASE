import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StepProgress from "../../components/owner/StepProgress";
import RoomBasicForm from "../../components/owner/RoomBasicForm";
import LocationForm from "../../components/owner/LocationForm";
import PricingForm from "../../components/owner/PricingForm";
import CapacityForm from "../../components/owner/CapacityForm";
import AmenitiesForm from "../../components/owner/AmenitiesForm";
import AvailabilityForm from "../../components/owner/AvailabilityForm";
import ImageUploader from "../../components/owner/ImageUploader";
import PublishButton from "../../components/owner/PublishButton";
import { getRoomByIdAPI } from "../../api/room.api";

const steps = [
  "basic",
  "location",
  "pricing",
  "capacity",
  "amenities",
  "images",
  "availability",
];

export default function RoomDraft() {
  const { id } = useParams();
  const [step, setStep] = useState("basic");
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setLoading(true);
        const res = await getRoomByIdAPI(id);
        setRoom(res.data.data);
        setStep(res.data.data.currentStep || "basic");
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [id, refreshKey]);

  const nextStep = (currentStep) => {
    const index = steps.indexOf(currentStep);
    if (index === -1 || index >= steps.length - 1) return currentStep;
    return steps[index + 1];
  };

  const renderStepForm = () => {
    if (!room) return null;

    const commonProps = {
      roomId: id,
      next: () => {
        setStep((currentStep) => nextStep(currentStep));
        setRefreshKey((current) => current + 1);
      },
      room,
    };

    switch (step) {
      case "basic":
        return <RoomBasicForm {...commonProps} />;
      case "location":
        return <LocationForm {...commonProps} />;
      case "pricing":
        return <PricingForm {...commonProps} />;
      case "capacity":
        return <CapacityForm {...commonProps} />;
      case "amenities":
        return <AmenitiesForm {...commonProps} />;
      case "images":
        return <ImageUploader {...commonProps} />;
      case "availability":
        return <AvailabilityForm {...commonProps} />;
      default:
        return <RoomBasicForm {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <StepProgress roomId={id} refreshKey={refreshKey} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-8">
          <div className="space-y-4">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Room draft</h2>
              <p className="text-slate-600 leading-relaxed">
                Complete each step to reach 100% progress. After images upload, publish your listing.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Publish</h3>
              <p className="text-slate-600 mb-4">
                Publish once all required steps are complete and your room is ready for guests.
              </p>
              <PublishButton roomId={id} />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            {loading ? (
              <p className="text-slate-600">Loading room draft...</p>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            ) : (
              renderStepForm()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
