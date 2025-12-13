import { Router } from "express";
import { fetchAllWorkers, removeWorker, updateProfile } from "../../controllers/authControllers/workers.controller.js";
import { routeProtect } from "../../middleware/routeProtect.middleware.js";
import { fileUpload } from "../../config/fileUpload.js";
import { adminOnly } from "../../middleware/adminOnly.middleware.js";

const router = Router()
router.get('/allWorkers', routeProtect, adminOnly,  fetchAllWorkers)
router.delete('/removeWorker/:id', adminOnly, removeWorker)
router.put('/updateProfile', routeProtect, adminOnly, fileUpload.single('image'), updateProfile)

export default router