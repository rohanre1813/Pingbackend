import type { Request, NextFunction, Response } from "express";
import type { IUser } from "../model/user.js";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}
export type authenticatedrequest = AuthenticatedRequest;

interface MyJwtPayload {
  user: string;
}

export const isauth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authheader = req.headers.authorization;

    if (!authheader || !authheader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Please Login - no auth header",
      });
      return;
    }

 const token = authheader.split(" ")[1] as string;

if (!token) {
  res.status(401).json({ message: "Token missing" });
  return;
}


    // ✅ tell TS it's definitely string
const secret = process.env.jwt_secret;

if (!secret) {
  throw new Error("jwt_secret not set");
}




    // ✅ cast through unknown (official TS fix)
    const decodedvalue = jwt.verify(token, secret) as unknown as MyJwtPayload;


    if (!decodedvalue?.user) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }

    req.user = decodedvalue.user as any;

    next();
  } catch {
    res.status(401).json({
      message: "please login - jwt error",
    });
  }
};
