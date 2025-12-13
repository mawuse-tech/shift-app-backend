import { Router } from "express";
import { routeProtect } from "../../middleware/routeProtect.middleware.js";
import { adminOnly } from "../../middleware/adminOnly.middleware.js";
import { createShift, deleteShift, editShift, fetchAllShifts, getMyShifts, getWorkerShiftHistory } from "../../controllers/authControllers/shift.controller.js";

const router = Router()

router.post('/', routeProtect, adminOnly, createShift)
router.get('/allShifts', routeProtect, fetchAllShifts)
router.delete('/deleteShift/:id', adminOnly, deleteShift)
router.put('/editShift/:shift_id', adminOnly, editShift)
router.get('/myShift', routeProtect, getMyShifts)
router.get("/history/:workerId", adminOnly, getWorkerShiftHistory);

export default router