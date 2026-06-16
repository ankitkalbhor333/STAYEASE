import { body } from "express-validator";

export const createRoomValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title required"),

  body("description")
    .notEmpty()
    .withMessage("Description required"),

  body("city")
    .notEmpty()
    .withMessage("City required"),

  body("state")
    .notEmpty()
    .withMessage("State required"),

  body("pricePerDay")
    .isNumeric()
    .withMessage("Price required"),

  body("maxGuests")
    .isNumeric()
    .withMessage("Max guests required"),
];
