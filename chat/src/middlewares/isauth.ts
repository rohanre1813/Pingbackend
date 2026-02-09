import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import dotenv from 'dotenv'


dotenv.config();
interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
}

export interface authenticatedrequest extends Request {
  user?: IUser | null;
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
    console.log(token)
    const decodedvalue = jwt.verify(token, process.env.jwt_secret as string) as unknown as JwtPayload
    if (!decodedvalue || !decodedvalue.user) {
      console.log(decodedvalue.user);

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