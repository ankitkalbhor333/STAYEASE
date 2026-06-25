/**
 * Room Publishing Validation Service
 * Handles all validations required before publishing a draft room
 */

/**
 * Validate basic information step
 */
export const validateBasicInfo = (room) => {
  const errors = [];

  if (!room.title || room.title.trim().length === 0) {
    errors.push("Title is missing");
  }

  if (!room.description || room.description.trim().length === 0) {
    errors.push("Description is missing");
  }

  if (!room.propertyType) {
    errors.push("Property type is missing");
  }

  if (!room.roomType) {
    errors.push("Room type is missing");
  }

  return errors;
};

/**
 * Validate location information step
 */
export const validateLocation = (room) => {
  const errors = [];

  if (!room.country || room.country.trim().length === 0) {
    errors.push("Country is missing");
  }

  if (!room.state || room.state.trim().length === 0) {
    errors.push("State is missing");
  }

  if (!room.city || room.city.trim().length === 0) {
    errors.push("City is missing");
  }

  if (!room.fullAddress || room.fullAddress.trim().length === 0) {
    errors.push("Full address is missing");
  }

  if (!room.pincode || room.pincode.toString().trim().length === 0) {
    errors.push("Pincode is missing");
  }

  if (!room.phoneNumber || room.phoneNumber.toString().trim().length === 0) {
    errors.push("Phone number is missing");
  }

  // Coordinates are optional — don't block publishing if missing
  // if (
  //   !room.location?.coordinates ||
  //   room.location.coordinates.length !== 2
  // ) {
  //   errors.push("Location coordinates are missing");
  // }

  return errors;
};

/**
 * Validate pricing information step
 */
export const validatePricing = (room) => {
  const errors = [];

  if (!room.pricePerDay || room.pricePerDay <= 0) {
    errors.push("Price per day is missing or invalid");
  }

  return errors;
};

/**
 * Validate capacity information step
 */
export const validateCapacity = (room) => {
  const errors = [];

  if (!room.maxGuests || room.maxGuests < 1) {
    errors.push("Max guests is missing or invalid");
  }

  if (!room.bedrooms || room.bedrooms < 1) {
    errors.push("Number of bedrooms is missing or invalid");
  }

  if (!room.beds || room.beds < 1) {
    errors.push("Number of beds is missing or invalid");
  }

  if (!room.bathrooms || room.bathrooms < 1) {
    errors.push("Number of bathrooms is missing or invalid");
  }

  return errors;
};

/**
 * Validate amenities information step
 */
export const validateAmenities = (room) => {
  const errors = [];

  if (!room.amenities) {
    errors.push("Amenities information is missing");
  }

  return errors;
};

/**
 * Validate images step
 */
export const validateImages = (room) => {
  const errors = [];

  if (!room.images || room.images.length === 0) {
    errors.push("At least one image is required");
  }

  if (room.images && room.images.length > 10) {
    errors.push("Maximum 10 images allowed");
  }

  return errors;
};

/**
 * Validate availability information step
 */
export const validateAvailability = (room) => {
  const errors = [];

  if (!room.availableFrom) {
    errors.push("Available from date is missing");
  }

  if (!room.availableTo) {
    errors.push("Available to date is missing");
  }

  if (room.availableFrom && room.availableTo) {
    const from = new Date(room.availableFrom);
    const to = new Date(room.availableTo);

    if (from >= to) {
      errors.push("Available from date must be before available to date");
    }

    if (from < new Date()) {
      errors.push("Available from date cannot be in the past");
    }
  }

  return errors;
};

/**
 * Complete validation for publishing
 * Returns detailed validation report
 */
export const validateRoomForPublishing = (room) => {
  const validationSteps = {
    basic: validateBasicInfo(room),
    location: validateLocation(room),
    pricing: validatePricing(room),
    capacity: validateCapacity(room),
    amenities: validateAmenities(room),
    images: validateImages(room),
    availability: validateAvailability(room),
  };

  const allErrors = Object.values(validationSteps).flat();
  const completedSteps = Object.entries(validationSteps)
    .filter(([_, errors]) => errors.length === 0)
    .map(([step]) => step);

  return {
    isValid: allErrors.length === 0,
    totalErrors: allErrors.length,
    errors: allErrors,
    stepValidation: validationSteps,
    completedSteps,
    progress: {
      completed: completedSteps.length,
      total: Object.keys(validationSteps).length,
      percentage: Math.round(
        (completedSteps.length / Object.keys(validationSteps).length) * 100
      ),
    },
  };
};

/**
 * Get missing required fields for publishing
 */
export const getMissingRequiredFields = (room) => {
  const missing = [];

  // Basic Info
  if (!room.title) missing.push("title");
  if (!room.description) missing.push("description");
  if (!room.propertyType) missing.push("propertyType");
  if (!room.roomType) missing.push("roomType");

  // Location
  if (!room.country) missing.push("country");
  if (!room.state) missing.push("state");
  if (!room.city) missing.push("city");
  if (!room.fullAddress) missing.push("fullAddress");
  if (!room.pincode) missing.push("pincode");
  if (!room.phoneNumber) missing.push("phoneNumber");

  // Pricing
  if (!room.pricePerDay) missing.push("pricePerDay");

  // Capacity
  if (!room.maxGuests) missing.push("maxGuests");
  if (!room.bedrooms) missing.push("bedrooms");
  if (!room.beds) missing.push("beds");
  if (!room.bathrooms) missing.push("bathrooms");

  // Images
  if (!room.images || room.images.length === 0) missing.push("images");

  // Availability
  if (!room.availableFrom) missing.push("availableFrom");
  if (!room.availableTo) missing.push("availableTo");

  return missing;
};

/**
 * Get next step to complete for publishing
 */
export const getNextStepToComplete = (room) => {
  const steps = ["basic", "location", "pricing", "capacity", "amenities", "images", "availability"];

  for (const step of steps) {
    let isComplete = false;

    switch (step) {
      case "basic":
        isComplete =
          room.title &&
          room.description &&
          room.propertyType &&
          room.roomType;
        break;
      case "location":
        isComplete =
          room.country &&
          room.state &&
          room.city &&
          room.fullAddress &&
          room.pincode &&
          room.phoneNumber;
        break;
      case "pricing":
        isComplete = room.pricePerDay && room.pricePerDay > 0;
        break;
      case "capacity":
        isComplete =
          room.maxGuests &&
          room.bedrooms &&
          room.beds &&
          room.bathrooms;
        break;
      case "amenities":
        isComplete = room.amenities !== undefined;
        break;
      case "images":
        isComplete = room.images && room.images.length > 0;
        break;
      case "availability":
        isComplete =
          room.availableFrom &&
          room.availableTo &&
          new Date(room.availableFrom) < new Date(room.availableTo);
        break;
    }

    if (!isComplete) {
      return step;
    }
  }

  return null; // All steps complete
};

/**
 * Get publishing readiness summary
 */
export const getPublishingReadinessSummary = (room) => {
  const validation = validateRoomForPublishing(room);
  const nextStep = getNextStepToComplete(room);
  const missingFields = getMissingRequiredFields(room);

  return {
    isReadyToPublish: validation.isValid,
    progress: validation.progress,
    errorCount: validation.totalErrors,
    nextStepToComplete: nextStep,
    missingFields,
    stepValidation: validation.stepValidation,
    estimatedCompletionPercentage: validation.progress.percentage,
  };
};

/**
 * Validate a single step update
 */
export const validateStepUpdate = (room, step, updateData) => {
  const validators = {
    basic: () => {
      const hasTitle = updateData.title || room.title;
      const hasDescription = updateData.description || room.description;
      const hasPropertyType = updateData.propertyType || room.propertyType;
      const hasRoomType = updateData.roomType || room.roomType;
      return hasTitle && hasDescription && hasPropertyType && hasRoomType;
    },
    location: () => {
      const hasCountry = updateData.country || room.country;
      const hasState = updateData.state || room.state;
      const hasCity = updateData.city || room.city;
      const hasAddress = updateData.fullAddress || room.fullAddress;
      const hasPincode = updateData.pincode || room.pincode;
      const hasPhone = updateData.phoneNumber || room.phoneNumber;
      return hasCountry && hasState && hasCity && hasAddress && hasPincode && hasPhone;
    },
    pricing: () => {
      const price = updateData.pricePerDay || room.pricePerDay;
      return price && price > 0;
    },
    capacity: () => {
      const maxGuests = updateData.maxGuests || room.maxGuests;
      const bedrooms = updateData.bedrooms || room.bedrooms;
      const beds = updateData.beds || room.beds;
      const bathrooms = updateData.bathrooms || room.bathrooms;
      return maxGuests && bedrooms && beds && bathrooms;
    },
    amenities: () => {
      return updateData.amenities !== undefined || room.amenities;
    },
    images: () => {
      return room.images && room.images.length > 0;
    },
    availability: () => {
      const from = updateData.availableFrom || room.availableFrom;
      const to = updateData.availableTo || room.availableTo;
      if (!from || !to) return false;
      return new Date(from) < new Date(to);
    },
  };

  const validator = validators[step];
  if (!validator) {
    return { isValid: false, message: `Invalid step: ${step}` };
  }

  const isValid = validator();
  return {
    isValid,
    message: isValid ? `${step} step is valid` : `${step} step validation failed`,
  };
};
