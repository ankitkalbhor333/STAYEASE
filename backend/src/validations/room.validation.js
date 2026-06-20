import { body, validationResult } from "express-validator";

/**
 * STEP 1: BASIC INFORMATION VALIDATION
 * Fields: title, description, propertyType, roomType
 */
export const basicStepValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 150 })
    .withMessage("Title must be between 5 and 150 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 20, max: 3000 })
    .withMessage("Description must be between 20 and 3000 characters"),

  body("propertyType")
    .notEmpty()
    .withMessage("Property type is required")
    .isIn(["Apartment", "House", "Villa", "PG", "Hostel", "Flat", "Room"])
    .withMessage("Invalid property type"),

  body("roomType")
    .notEmpty()
    .withMessage("Room type is required")
    .isIn(["Entire Place", "Private Room", "Shared Room"])
    .withMessage("Invalid room type"),
];

/**
 * STEP 2: LOCATION VALIDATION
 * Fields: country, state, city, area, fullAddress, pincode, phoneNumber
 */
export const locationStepValidator = [
  body("country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isLength({ min: 2 })
    .withMessage("Country name is too short"),

  body("state")
    .trim()
    .notEmpty()
    .withMessage("State is required"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),

  body("area")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage("Area name is too short"),

  body("fullAddress")
    .trim()
    .notEmpty()
    .withMessage("Full address is required")
    .isLength({ min: 10 })
    .withMessage("Full address must be at least 10 characters"),

  body("pincode")
    .trim()
    .notEmpty()
    .withMessage("Pincode is required")
    .matches(/^[0-9]{5,10}$/)
    .withMessage("Invalid pincode format"),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Invalid phone number format"),

  body("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  body("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
];

/**
 * STEP 3: PRICING VALIDATION
 * Fields: pricePerDay, pricePerWeek, pricePerMonth, cleaningFee, securityDeposit
 */
export const pricingStepValidator = [
  body("pricePerDay")
    .notEmpty()
    .withMessage("Price per day is required")
    .isNumeric()
    .withMessage("Price per day must be a number")
    .custom((value) => {
      if (value < 0) throw new Error("Price cannot be negative");
      if (value > 1000000) throw new Error("Price is too high");
      return true;
    }),

  body("pricePerWeek")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Price per week must be a number")
    .custom((value) => {
      if (value && value < 0) throw new Error("Price cannot be negative");
      return true;
    }),

  body("pricePerMonth")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Price per month must be a number")
    .custom((value) => {
      if (value && value < 0) throw new Error("Price cannot be negative");
      return true;
    }),

  body("cleaningFee")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Cleaning fee must be a number")
    .custom((value) => {
      if (value && value < 0) throw new Error("Cleaning fee cannot be negative");
      return true;
    }),

  body("securityDeposit")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Security deposit must be a number")
    .custom((value) => {
      if (value && value < 0) throw new Error("Security deposit cannot be negative");
      return true;
    }),
];

/**
 * STEP 4: CAPACITY VALIDATION
 * Fields: maxGuests, bedrooms, beds, bathrooms
 */
export const capacityStepValidator = [
  body("maxGuests")
    .notEmpty()
    .withMessage("Max guests is required")
    .isNumeric()
    .withMessage("Max guests must be a number")
    .custom((value) => {
      if (value < 1) throw new Error("Max guests must be at least 1");
      if (value > 100) throw new Error("Max guests cannot exceed 100");
      return true;
    }),

  body("bedrooms")
    .notEmpty()
    .withMessage("Number of bedrooms is required")
    .isNumeric()
    .withMessage("Bedrooms must be a number")
    .custom((value) => {
      if (value < 1) throw new Error("Must have at least 1 bedroom");
      if (value > 50) throw new Error("Too many bedrooms");
      return true;
    }),

  body("beds")
    .notEmpty()
    .withMessage("Number of beds is required")
    .isNumeric()
    .withMessage("Beds must be a number")
    .custom((value) => {
      if (value < 1) throw new Error("Must have at least 1 bed");
      if (value > 100) throw new Error("Too many beds");
      return true;
    }),

  body("bathrooms")
    .notEmpty()
    .withMessage("Number of bathrooms is required")
    .isNumeric()
    .withMessage("Bathrooms must be a number")
    .custom((value) => {
      if (value < 1) throw new Error("Must have at least 1 bathroom");
      if (value > 50) throw new Error("Too many bathrooms");
      return true;
    }),
];

/**
 * STEP 5: AMENITIES VALIDATION
 * Fields: amenities (all boolean)
 */
export const amenitiesStepValidator = [
  body("amenities.wifi")
    .optional()
    .isBoolean()
    .withMessage("WiFi must be true or false"),

  body("amenities.kitchen")
    .optional()
    .isBoolean()
    .withMessage("Kitchen must be true or false"),

  body("amenities.parking")
    .optional()
    .isBoolean()
    .withMessage("Parking must be true or false"),

  body("amenities.washingMachine")
    .optional()
    .isBoolean()
    .withMessage("Washing machine must be true or false"),

  body("amenities.airConditioner")
    .optional()
    .isBoolean()
    .withMessage("Air conditioner must be true or false"),

  body("amenities.tv")
    .optional()
    .isBoolean()
    .withMessage("TV must be true or false"),

  body("amenities.geyser")
    .optional()
    .isBoolean()
    .withMessage("Geyser must be true or false"),

  body("amenities.workspace")
    .optional()
    .isBoolean()
    .withMessage("Workspace must be true or false"),
];

/**
 * STEP 6: IMAGES VALIDATION
 * Files are handled separately in middleware
 */
export const imagesStepValidator = [
  body()
    .custom((value, { req }) => {
      if (!req.files || req.files.length === 0) {
        throw new Error("At least one image is required");
      }
      if (req.files.length > 10) {
        throw new Error("Maximum 10 images allowed");
      }
      return true;
    }),
];

/**
 * STEP 7: AVAILABILITY VALIDATION
 * Fields: availableFrom, availableTo
 */
export const availabilityStepValidator = [
  body("availableFrom")
    .notEmpty()
    .withMessage("Available from date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      const date = new Date(value);
      if (date < new Date()) {
        throw new Error("Available from date cannot be in the past");
      }
      return true;
    }),

  body("availableTo")
    .notEmpty()
    .withMessage("Available to date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value, { req }) => {
      const availableTo = new Date(value);
      const availableFrom = new Date(req.body.availableFrom);
      
      if (availableTo <= availableFrom) {
        throw new Error("Available to date must be after available from date");
      }
      return true;
    }),
];

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
      })),
    });
  }
  next();
};

/**
 * Get validator for a specific step
 */
export const getStepValidator = (step) => {
  const validators = {
    basic: basicStepValidator,
    location: locationStepValidator,
    pricing: pricingStepValidator,
    capacity: capacityStepValidator,
    amenities: amenitiesStepValidator,
    images: imagesStepValidator,
    availability: availabilityStepValidator,
  };

  return validators[step] || [];
};

/**
 * Legacy support for full room creation
 */
export const createRoomValidator = [
  ...basicStepValidator,
  ...locationStepValidator,
  ...pricingStepValidator,
  ...capacityStepValidator,
  ...availabilityStepValidator,
];
