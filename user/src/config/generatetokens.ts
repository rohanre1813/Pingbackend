import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config();

export const generatetoken = (user: any) => {
  return jwt.sign(
    { user },
    process.env.jwt_secret as string,
    { expiresIn: "15d" }
  );
};
