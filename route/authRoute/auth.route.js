import { Router } from "express";
import { changePassword, completeRegistration, forgotPassword, inviteWorker, loggedInUserData, login, logout, resetPassword, verifyEmail } from "../../controllers/authControllers/auth.controller.js";
import { routeProtect } from "../../middleware/routeProtect.middleware.js";
import { fileUpload } from "../../config/fileUpload.js";
import { adminOnly } from "../../middleware/adminOnly.middleware.js";

const router = Router()

router.post('/invite-worker', routeProtect, adminOnly, inviteWorker)
router.get('/verify', verifyEmail)
router.post('/complete-register', fileUpload.single('image'), completeRegistration);
router.post('/login', login);
router.post('/logout', logout)
router.post('/forgotPassword', forgotPassword)
router.post('/resetPassword/:token', resetPassword)
router.post('/changePassword', routeProtect, changePassword)
router.get('/userData', routeProtect, loggedInUserData)


export default router