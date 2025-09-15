import express from "express";
import {
    createSubscriptionController,
    getAllSubscriptionsController,
    getSubscriptionByIdController,
    getAllSubscriptionsByMemberController,
    updateSubscriptionController,
    deleteSubscriptionController
} from "../controllers/subscription.controller";

import { authenticateToken,authorize } from "../middleware/auth";


const router = express.Router();


router.post("/",authenticateToken, authorize(["admin","staff","member"]), createSubscriptionController);

router.get("/",authenticateToken, authorize(["admin","staff"]), getAllSubscriptionsController);

router.get("/member/:memberId",authenticateToken, getAllSubscriptionsByMemberController);

router.get("/:id",authenticateToken, getSubscriptionByIdController);

router.put("/:id",authenticateToken, authorize(["admin","staff"]), updateSubscriptionController);

router.delete("/:id",authenticateToken, authorize(["admin","staff"]), deleteSubscriptionController);

export default router;