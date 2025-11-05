import { Router } from "express";
import { deleteNotification, notifications } from "../../controllers/authControllers/notifications.controller.js";

const router = Router()
router.get('/:user_id', notifications)
router.delete('/deleteNotice/:id', deleteNotification)

export default router