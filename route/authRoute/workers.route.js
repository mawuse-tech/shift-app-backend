import { Router } from "express";
import { fetchAllWorkers, removeWorker, updateProfile } from "../../controllers/authControllers/workers.controller.js";
import { routeProtect } from "../../middleware/routeProtect.middleware.js";
import { fileUpload } from "../../config/fileUpload.js";

const router = Router()
router.get('/allWorkers', routeProtect, fetchAllWorkers)
router.delete('/removeWorker/:id', removeWorker)
router.put('/updateProfile', routeProtect, fileUpload.single('image'), updateProfile)

export default router