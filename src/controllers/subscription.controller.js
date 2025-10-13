import {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    getAllSubscriptionsByMember,
    updateSubscription,
    deleteSubscription,
    suspendSubscription,
    unsuspendSubscription,
    changeSubscriptionStatus

} from "../services/subscription.service";

import response from "../utils/response";


export const createSubscriptionController = async (req, res, next) => {
    try {
        const {
            memberId,
            packageId,
            branchId,
            type,
            membershipType,
            startDate,
            endDate,
            durationDays,
            ptsessionsRemaining,
            ptsessionsUsed } = req.body;
        const subscriptionData = {
            memberId,
            packageId,
            branchId,
            type,
            membershipType,
            startDate,
            endDate,
            durationDays,
            ptsessionsRemaining,
            ptsessionsUsed
        }
        const newSubscription = await createSubscription(subscriptionData);
        return response(res, {
            success: true,
            statusCode: 201,
            message: "Subscription created successfully",
            data: newSubscription
        });
    } catch (error) {
        return next(error);
    }
};

export const getAllSubscriptionsController = async (req, res, next) => {
    try {
        const subscriptions = await getAllSubscriptions();
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Subscriptions fetched successfully",
            data: subscriptions
        });
    } catch (error) {
        return next(error);
    }
}

export const getSubscriptionByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subscription = await getSubscriptionById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Subscription fetched successfully",
            data: subscription
        });
    } catch (error) {
        return next(error);
    }
}

export const getAllSubscriptionsByMemberController = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const subscriptions = await getAllSubscriptionsByMember(memberId);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Subscriptions fetched successfully",
            data: subscriptions
        });
    } catch (error) {
        return next(error);
    }
}

export const updateSubscriptionController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subscriptionNewData = req.body;
        const subscription = await updateSubscription(id, subscriptionNewData);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Subscription updated successfully",
            data: subscription
        });
    } catch (error) {
        return next(error);
    }
}


export const changeSubscriptionStatusController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const status = req.body;
        const subscription = await changeSubscriptionStatus(id, status);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Subscription status changed successfully",
            data: subscription
        });
    } catch (error) {
        return next(error);
    }
}

export const deleteSubscriptionController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subscription = await deleteSubscription(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Subscription deleted successfully",
            data: {
                message: !subscription ? "Subscription not found" : "Subscription deleted successfully"
            }
        });
    } catch (error) {
        return next(error);
    }
}

export const suspendSubscriptionController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const suspendData = req.body;
        const subscription = await suspendSubscription(id, suspendData);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Subscription suspended successfully",
            data: subscription
        });
    } catch (error) {
        return next(error);
    }
};

export const unsuspendSubscriptionController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subscription = await unsuspendSubscription(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Subscription unsuspended successfully",
            data: subscription
        });
    } catch (error) {
        return next(error);
    }
};