import { Router } from "express";
import { changePassword, forgotPassword, loggedInUserData, login, logout, registerUsers, resetPassword } from "../../controllers/authControllers/auth.controller.js";
import { routeProtect } from "../../middleware/routeProtect.middleware.js";
import { fileUpload } from "../../config/fileUpload.js";

const router = Router()

router.post('/register', fileUpload.single('image'), registerUsers);
router.post('/login', login);
router.post('/logout', logout)
router.post('/forgotPassword', forgotPassword)
router.post('/resetPassword/:token', resetPassword)
router.post('/changePassword', routeProtect, changePassword)
router.get('/userData', routeProtect, loggedInUserData)


export default router