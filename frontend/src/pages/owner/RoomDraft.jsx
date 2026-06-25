import { useEffect, useState, useRef } from "react";
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

const stepLabels = {
  basic: "Basic Info",
  location: "Location",
  pricing: "Pricing",
  capacity: "Capacity",
  amenities: "Amenities",
  images: "Photos",
  availability: "Availability",
};

const stepIcons = {
  basic: "📝",
  location: "📍",
  pricing: "💰",
  capacity: "🛏️",
  amenities: "✨",
  images: "📸",
  availability: "📅",
};

export default function RoomDraft() {
  const { id } = useParams();
  const [step, setStep] = useState("basic");
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setLoading(true);
        const res = await getRoomByIdAPI(id);
        setRoom(res.data.data);
        if (!initialLoadDone.current) {
          initialLoadDone.current = true;
          setStep(res.data.data.currentStep || "basic");
        }
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

  const prevStep = (currentStep) => {
    const index = steps.indexOf(currentStep);
    if (index <= 0) return currentStep;
    return steps[index - 1];
  };

  const handleNext = () => {
    setStep((currentStep) => {
      const next = nextStep(currentStep);
      if (next === currentStep) {
        setRefreshKey((c) => c + 1);
      }
      return next;
    });
    setAnimKey((k) => k + 1);
  };

  const handleBack = () => {
    setStep((currentStep) => prevStep(currentStep));
    setAnimKey((k) => k + 1);
  };

  const handleStepClick = (targetStep) => {
    const targetIndex = steps.indexOf(targetStep);
    const currentIndex = steps.indexOf(step);
    // Allow navigation to current step and any previous steps
    if (targetIndex <= currentIndex) {
      setStep(targetStep);
      setAnimKey((k) => k + 1);
    }
  };

  const currentStepIndex = steps.indexOf(step);
  const isFirstStep = step === "basic";

  const renderStepForm = () => {
    if (!room) return null;

    const commonProps = {
      roomId: id,
      next: handleNext,
      back: isFirstStep ? null : handleBack,
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
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Step Navigation */}
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4">Steps</h2>
              <div className="step-indicator">
                {steps.map((s, i) => {
                  const isActive = s === step;
                  const isCompleted = i < currentStepIndex;
                  let cls = "step-item";
                  if (isActive) cls += " active";
                  if (isCompleted) cls += " completed";
                  return (
                    <div
                      key={s}
                      className={cls}
                      onClick={() => handleStepClick(s)}
                      title={stepLabels[s]}
                    >
                      <div className="step-circle">
                        {isCompleted ? "✓" : i + 1}
                      </div>
                      <span className="step-label">
                        {stepIcons[s]} {stepLabels[s]}
                      </span>
                      {i < steps.length - 1 && <div className="step-item-line" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Publish */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Publish</h3>
              <p className="text-slate-600 mb-4">
                Publish once all required steps are complete and your room is ready for guests.
              </p>
              <PublishButton roomId={id} />
            </div>
          </div>

          {/* Form Area */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-slate-200 border-t-[#B40032] rounded-full animate-spin mx-auto" />
                  <p className="text-slate-500 text-sm">Loading room draft...</p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            ) : (
              <div key={animKey} className="step-slide-in">
                {renderStepForm()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
