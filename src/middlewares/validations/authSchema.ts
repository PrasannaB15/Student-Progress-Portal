import { ParamSchema, checkSchema } from "express-validator";
import { ERRORS } from "../../messages/errors";
import {
  emailAddressSchema,
  passwordSchemaFunct,
  simpleIntSchemaFunc,
  simpleTextSchemaFunc,
} from "../../utils/commonAuthSchema";

// Reusable validator to ensure req.body is not empty
const checkNonEmptyBody = () => ({
  custom: {
    options: (value: any, { req }: any) => {
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new Error(ERRORS.invalidReqBody);
      }
      return true;
    },
  },
});

const signUpSchema = checkSchema({
  customFields: checkNonEmptyBody(),
  email: emailAddressSchema,
  password: passwordSchemaFunct({ label: "password" }) as unknown as ParamSchema,
  name: simpleTextSchemaFunc({ label: "name" }) as unknown as ParamSchema,
});

const signInSchema = checkSchema({
  customFields: checkNonEmptyBody(),
  email: emailAddressSchema,
  password: passwordSchemaFunct({ label: "password" }) as unknown as ParamSchema,
});

const verificationSchema = checkSchema({
  customFields: checkNonEmptyBody(),
  email: emailAddressSchema,
  otp: simpleIntSchemaFunc({ label: "otp" }) as unknown as ParamSchema,
});

const forgotPasswordSchema = checkSchema({
  customFields: checkNonEmptyBody(),
  email: emailAddressSchema,
});

export { signUpSchema, signInSchema, verificationSchema, forgotPasswordSchema };
