import trycatch from "../config/trycatch.js";
import { redisclient } from "../index.js";
import { publishtoqueue } from "../config/rabbitmq.js";
import { user as userModel } from "../model/user.js";
import { generatetoken } from "../config/generatetokens.js";
import type { authenticatedrequest } from "../middlewares/isauth.js";
export const loginuser = trycatch(async (req, res, next) => {
  const { email } = req.body

  const ratelimitkey = `otp:ratelimit:${email}`
  const ratelimit = await redisclient.get(ratelimitkey)
  if (ratelimit) {
    res.status(429).json({
      message: "too many requests.please wait  before requesting new OTP"
    })
    return
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const otpkey = `otp:${email}`
  await redisclient.set(otpkey, otp, {
    EX: 300,
  })
  await redisclient.set(ratelimitkey, "true", {
    EX: 60,
  })

  const message = {
    to: email,
    subject: "Your OTP Code",
    html: `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
        <div style="max-width:500px; margin:auto; background:white; padding:20px; border-radius:8px;">
          <h2 style="color:#333;">PING Login Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <div style="font-size:32px; font-weight:bold; letter-spacing:4px; margin:20px 0;">
            ${otp}
          </div>
          <p style="color:#555;">This OTP is valid for <b>5 minutes</b>.</p>
          <hr />
          <p style="font-size:12px; color:#999;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `,
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  };

  await publishtoqueue("sent-otp", message)
  res.status(200).json({
    message: "OTP sent to your email successfully"
  })
})

export const verifyuser = trycatch(async (req, res, next) => {
  const { email, otp: enteredotp } = req.body

  if (!email || !enteredotp) {
    res.status(400).json({
      message: "Email and OTP required"
    })
    return;
  }

  const otpkey = `otp:${email}`
  const storedotp = await redisclient.get(otpkey)

  if (!storedotp || storedotp != enteredotp) {
    res.status(400).json({
      message: "Invalid OTP"
    })
    return;
  }
  redisclient.del(otpkey);

  let username = await userModel.findOne({ email })
  if (!username) {
    const name = email.slice(0, 8);
    username = await userModel.create({ name, email })
  }
  const token = generatetoken(username)
  res.json({
    message: "user verified",
    user: username,
    token,
  })
})

export const myprofile = trycatch(async (req: authenticatedrequest, res) => {
  const user = await userModel.findById(req.user?._id);
  res.json(user);
});

export const updatename = trycatch(async (req: authenticatedrequest, res) => {
  const User = await userModel.findById(req.user?._id)
  if (!User) {
    res.status(401).json({
      message: "please login",
    })
    return;
  }
  User.name = req.body.name;
  await User.save();
  const token = generatetoken(User)
  res.json({
    message: "user updated",
    user: User,
    token,
  })
})

export const getallusers = trycatch(async (req: authenticatedrequest, res) => {
  const users = await userModel.find();

  res.json(users);
})
export const getuser = trycatch(async (req: authenticatedrequest, res) => {
  const User = await userModel.findById(req.params.id);
  res.json(User)
})

export const blockUser = trycatch(async (req: authenticatedrequest, res) => {
  const { id } = req.params as { id: string };
  const User = await userModel.findById(req.user?._id);
  if (!User) {
    res.status(401).json({ message: "Please login" });
    return;
  }
  if (User.blocked.includes(id)) {
    res.status(400).json({ message: "User already blocked" });
    return;
  }
  User.blocked.push(id);
  await User.save();
  res.json({ message: "User blocked successfully", blocked: User.blocked });
});

export const unblockUser = trycatch(async (req: authenticatedrequest, res) => {
  const { id } = req.params as { id: string };
  const User = await userModel.findById(req.user?._id);
  if (!User) {
    res.status(401).json({ message: "Please login" });
    return;
  }
  User.blocked = User.blocked.filter((blockedId: any) => blockedId !== id);
  await User.save();
  res.json({ message: "User unblocked successfully", blocked: User.blocked });
});