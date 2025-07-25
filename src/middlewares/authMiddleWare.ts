import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { STATUS } from "../messages/statusCodes";
import { usersCollection } from "../config/firebase-admin";
import { ERRORS } from "../messages/errors";
import jwt from "jsonwebtoken";

// Check if user already exists (for signup)
const checkUserExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await usersCollection.where("email", "==", req.body.email).get();
    if (!user.empty) {
      return res.status(STATUS.badRequest).json({ error: ERRORS.user_already_exists });
    } else {
      return next(); // ✅ return required
    }
  } catch (error) {
   return res.status(STATUS.server).json({ error: ERRORS.serverError });

  }
};


// Check if user exists (for login, forgot password, etc.)
const checkUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userQuerySnapshot = await usersCollection
      .where("email", "==", req.body.email)
      .get();

    if (userQuerySnapshot.empty) {
       res
        .status(STATUS.badRequest)
        .json({ error: ERRORS.user_not_found });
        return;
    }

    return next(); // ✅ Important to add `return` to avoid TS error
  } catch (error) {
    console.error("checkUser error:", error);
     res
      .status(STATUS.server)
      .json({ error: ERRORS.serverError });
      return;
  }
};


// Validate express-validator schema results
const checkSchemaError = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res
      .status(STATUS.badRequest)
      .json({ errors: true, message: errors.array()[0]?.msg });
    return; // Important: prevents further execution
  }

  next();
};


// Authenticate JWT token and set req.user with actual user data
const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    let token = req.headers?.authorization.split(" ")[1];
    try {
      if (token) {
        const decode = jwt.verify(token, process.env.JWT_SECRET || "") as {
          id: string;
        };
        const user = await usersCollection.doc(decode.id).get();

        if (!user.exists) {
          return res.status(STATUS.unauthorized).json({ error: ERRORS.user_not_found });
        }

        (req as any).user = { id: user.id, ...user.data() };
        return next(); // ✅ must return here
      } else {
        return res.status(STATUS.badRequest).json({ error: ERRORS.tokenMissing });
      }
    } catch (error) {
      return res.status(STATUS.badRequest).json({ error: ERRORS.tokenNotFound });
    }
  } else {
    return res.status(STATUS.badRequest).json({ error: ERRORS.tokenMissing });
  }
};


export { checkUserExists, checkSchemaError, checkUser, authMiddleware };
