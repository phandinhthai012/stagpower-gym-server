import express from "express";
import { authenticateToken, authorize } from "../middleware/auth.js";
import {
    createBookingRequestController,
    getAllBookingRequestsController,
    getBookingRequestByIdController,
    updateBookingRequestByIdController,
    deleteBookingRequestByIdController,
    confirmBookingRequestController,
    rejectBookingRequestController,
    getBookingRequestByStatusController,
    getBookingRequestsByMemberController,
    getBookingRequestsByTrainerController,
    getAllBookingRequestsWithPaginationController

} from "../controllers/bookingRequest.controller.js";

const router = express.Router();


router.get("/paginated", getAllBookingRequestsWithPaginationController);

router.post("/", createBookingRequestController);


router.get("/",authenticateToken, authorize(["admin", "staff", "trainer"]), getAllBookingRequestsController);

router.get("/:id", authenticateToken, getBookingRequestByIdController);

router.put("/:id",authenticateToken, updateBookingRequestByIdController);

router.delete("/:id",authenticateToken, deleteBookingRequestByIdController);

router.put("/:id/confirm",authenticateToken, confirmBookingRequestController);

router.put("/:id/reject",authenticateToken, rejectBookingRequestController);

router.get("/status/:status",authenticateToken, getBookingRequestByStatusController);

router.get("/member/:memberId",authenticateToken, getBookingRequestsByMemberController);

router.get("/trainer/:trainerId",authenticateToken, getBookingRequestsByTrainerController);

export default router;



// GET /api/booking-requests/paginated
// GET /api/booking-requests/member/:memberId/paginated
// GET /api/booking-requests/trainer/:trainerId/paginate