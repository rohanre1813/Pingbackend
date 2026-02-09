import type { Request, NextFunction, Response } from "express";
import { type IUser } from "../model/user.js";
import jwt from 'jsonwebtoken'

export interface authenticatedrequest extends Request {
  user?: IUser | null;

}
interface JwtPayload {
  user: string;
}

export const isauth = async (req: authenticatedrequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authheader = req.headers.authorization
    if (!authheader || !authheader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Please Login-no auth header"
      })
      return;
    }
    const token = authheader.split(" ")[1]
    const decodedvalue = jwt.verify(token, process.env.jwt_secret as string) as JwtPayload;
    if (!decodedvalue || !decodedvalue.user) {
      res.status(401).json({
        message: "Invalid token"
      })
      return;
    }
    // @ts-ignore
    req.user = decodedvalue.user;
    next()
  }
  catch (err) {
    res.status(401).json({
      message: "please login -jwt error"
    })
  }
}