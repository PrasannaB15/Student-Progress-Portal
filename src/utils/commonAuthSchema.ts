import { Location } from "express-validator";
import { ERRORS } from "../messages/errors";

export const emailAddressSchema = {
  in: "body" as Location,
  exists: { options: { checkNull: true, checkFalsy: true } },
  errorMessage: "Email is required",
  isString: {
    errorMessage: "Email must be a string",
    bail: true,
  },
  notEmpty: {
    options: { ignore_whitespace: true },
    errorMessage: "Email must not be empty",
    bail: true,
  },
  isEmail: {
    errorMessage: "Invalid email format",
    bail: true,
  },
  normalizeEmail: true,
  trim: true,
};

interface BaseSchemaOptions {
  dataIn?: Location;
  label?: string;
  required?: boolean;
}

export const passwordSchemaFunct = ({
  dataIn = "body",
  label = "Password",
  required = true,
}: BaseSchemaOptions) => ({
  in: [dataIn],
  exists: required ? { options: { checkNull: true, checkFalsy: true } } : undefined,
  errorMessage: `${label} ${ERRORS.required}`,
  isString: {
    errorMessage: `${label} ${ERRORS.mustBeString}`,
  },
  isStrongPassword: {
    options: {
      minSymbols: 0,
      minNumbers: 1,
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
    },
    errorMessage: ERRORS.invalidPassType,
  },
});

export const simpleTextSchemaFunc = ({
  dataIn = "body",
  label = "Field",
  required = true,
}: BaseSchemaOptions) => ({
  in: dataIn,
  exists: required ? { options: { checkNull: true, checkFalsy: true } } : undefined,
  optional: !required ? { options: { nullable: true } } : undefined,
  errorMessage: `${label} ${ERRORS.required}`,
  isString: {
    errorMessage: `${label} ${ERRORS.mustBeString}`,
    bail: true,
  },
  notEmpty: {
    options: { ignore_whitespace: true },
    errorMessage: `${label} ${ERRORS.required}`,
    bail: true,
  },
  trim: true,
});

export const simpleIntSchemaFunc = ({
  dataIn = "body",
  label = "Field",
  required = true,
}: BaseSchemaOptions) => ({
  in: [dataIn],
  exists: required ? { options: { checkNull: true, checkFalsy: true } } : undefined,
  optional: !required ? { options: { nullable: true } } : undefined,
  errorMessage: `${label} ${ERRORS.required}`,
  isInt: {
    errorMessage: `${label} ${ERRORS.mustBeAnInt}`,
    bail: true,
  },
  notEmpty: {
    options: { ignore_whitespace: true },
    errorMessage: `${label} ${ERRORS.required}`,
    bail: true,
  },
  trim: true,
});
