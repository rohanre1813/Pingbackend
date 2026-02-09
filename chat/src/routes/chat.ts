import  express from 'express'
import { isauth } from '../middlewares/isauth.js'
import { createnewchat, getallchats, getmessagesbychat, sendmessage } from '../controllers/chat.js'
import { upload } from '../middlewares/multer.js'
import { askAI } from '../controllers/ai.controller.js'
const router=express.Router()

router.post('/chat/new',isauth,createnewchat)
router.get('/chat/all', isauth, getallchats)
router.post('/message',isauth,upload.single("image"),sendmessage)
router.get('/message/:chatId',isauth, getmessagesbychat)
router.post('/ai/ask',isauth,askAI)
export default router