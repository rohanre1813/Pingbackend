import express from "express";
import { blockUser, unblockUser, getallusers, getuser, loginuser, myprofile, updatename, verifyuser } from "../controllers/user.js";
import { isauth } from "../middlewares/isauth.js";

const router = express.Router()
router.post('/login', loginuser)
router.post('/verify-user', verifyuser)
router.get('/me', isauth, myprofile)
router.get('/user/all', isauth, getallusers)
router.get('/user/:id', getuser)
router.post('/user/update', isauth, updatename)
router.put('/user/block/:id', isauth, blockUser);
router.put('/user/unblock/:id', isauth, unblockUser);
export default router