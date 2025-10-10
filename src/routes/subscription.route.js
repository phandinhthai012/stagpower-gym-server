import express from "express";
import {
    createSubscriptionController,
    getAllSubscriptionsController,
    getSubscriptionByIdController,
    getAllSubscriptionsByMemberController,
    updateSubscriptionController,
    deleteSubscriptionController,
    suspendSubscriptionController,
    unsuspendSubscriptionController
} from "../controllers/subscription.controller";

import { authenticateToken,authorize } from "../middleware/auth";
import { validSubscriptionCreate,validSubscriptionUpdate } from "../middleware/validations";

const router = express.Router();


router.post("/",validSubscriptionCreate,authenticateToken, authorize(["admin","staff","member"]), createSubscriptionController);

router.get("/",authenticateToken, authorize(["admin","staff"]), getAllSubscriptionsController);

router.get("/member/:memberId",authenticateToken, getAllSubscriptionsByMemberController);

router.get("/:id",authenticateToken, getSubscriptionByIdController);

router.put("/:id",validSubscriptionUpdate,authenticateToken, authorize(["admin","staff","member"]), updateSubscriptionController);

router.delete("/:id",authenticateToken, authorize(["admin","staff"]), deleteSubscriptionController);

router.post("/:id/suspend",authenticateToken, authorize(["admin","staff"]), suspendSubscriptionController);

router.post("/:id/unsuspend",authenticateToken, authorize(["admin","staff"]), unsuspendSubscriptionController);


export default router;