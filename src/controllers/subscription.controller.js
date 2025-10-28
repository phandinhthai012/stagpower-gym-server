import {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    getAllSubscriptionsByMember,
    updateSubscription,
    deleteSubscription,
    suspendSubscription,
    unsuspendSubscription,
    changeSubscriptionStatus,
    renewSubscription
} from "../services/subscription.service";

import response from "../utils/response";
import socketService from "../services/socket.service";
import { roleRoomMap } from "../utils/socketUtils";
import { createNotification } from "../services/notification.service";
import { createPayment } from "../services/payment.service";
import { withTransaction } from "../utils/transactionHelper";
import {
    createMomoPayment,
} from "../config/momo";
import Package from "../models/Package";

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

        await createNotification({
            userId: newSubscription.memberId,
            title: "Subscription created successfully",
            message: "Gói đã được tạo",
        });
        socketService.emitToUser(newSubscription.memberId, "subscription_created", newSubscription);
        socketService.emitToRoom(roleRoomMap.admin, "subscription_created", newSubscription);

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

        await createNotification({
            userId: subscription.memberId,
            title: "Subscription updated successfully",
            message: "Gói đã được cập nhật",
        });
        socketService.emitToUser(subscription.memberId, "subscription_updated", subscription);
        socketService.emitToRoom(roleRoomMap.admin, "subscription_updated", subscription);


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

        await createNotification({
            userId: subscription.memberId,
            title: "Subscription status changed successfully",
            message: "Trạng thái gói đã được thay đổi",
        });
        socketService.emitToUser(subscription.memberId, "subscription_status_changed", subscription);
        socketService.emitToRoom(roleRoomMap.admin, "subscription_status_changed", subscription);

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

        await createNotification({
            userId: subscription.memberId,
            title: "Subscription deleted successfully",
            message: "Gói đã bị xóa",
        });
        socketService.emitToUser(subscription.memberId, "subscription_deleted", subscription);
        socketService.emitToRoom(roleRoomMap.admin, "subscription_deleted", subscription);


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

        await createNotification({
            userId: subscription.memberId,
            title: "Subscription Suspended",
            message: `Gói đã bị tạm dừng. Lý do: ${suspendData.reason || 'Không có lý do'}`,
        });
        socketService.emitToUser(subscription.memberId, "subscription_suspended", subscription);
        socketService.emitToRoom(roleRoomMap.admin, "subscription_suspended", subscription);

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
        await createNotification({
            userId: subscription.memberId,
            title: "Subscription Unsuspended",
            message: "Gói đã được kích hoạt lại",
        });
        socketService.emitToUser(subscription.memberId, "subscription_unsuspended", subscription);
        socketService.emitToRoom(roleRoomMap.admin, "subscription_unsuspended", subscription);


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

export const renewSubscriptionController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const renewData = req.body;
        const result = await renewSubscription(id, renewData.newPackageId, renewData);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Subscription renewed successfully",
            data: result
        });
    } catch (error) {
        return next(error);
    }
}

export const createSubscriptionWithPaymentController = async (req, res, next) => {
    try {
        const {
            memberId,
            packageId,
            branchId,
            type,
            membershipType,
            durationDays,
            ptsessionsRemaining,
            ptsessionsUsed,
            paymentMethod,
            originalAmount,
            amount,
            discountDetails,
            notes
        } = req.body;
        const result = await withTransaction(async (session) => {
            // 1. Tạo subscription với status PendingPayment
            const subscriptionData = {
                memberId,
                packageId,
                branchId,
                type,
                membershipType,
                durationDays,
                ptsessionsRemaining,
                ptsessionsUsed,
                status: 'PendingPayment'
            };
            const newSubscription = await createSubscription(subscriptionData, session);
            // // 2. Tạo payment với subscriptionId vừa tạo
            // Xác định paymentType dựa trên package type
            let paymentType = 'NEW_SUBSCRIPTION'; // Mặc định là đăng ký gói mới
            const packageInfo = await Package.findById(packageId);
            if (packageInfo && (packageInfo.type === 'PT')) {
                paymentType = 'PT_PURCHASE'; // Mua buổi tập PT
            }
            
            const paymentData = {
                subscriptionId: newSubscription._id,
                memberId,
                originalAmount,
                amount,
                discountDetails,
                paymentMethod,
                paymentStatus: 'Pending',
                paymentType: paymentType,
                notes
            };
            const newPayment = await createPayment(paymentData, session);
            return {
                subscription: newSubscription,
                payment: newPayment,
            }
        });
        let momoPaymentInfo = null;
        
        if (paymentMethod === 'Momo') {
            try {
                momoPaymentInfo = await createMomoPayment(
                    result.payment.amount,
                    result.payment._id,
                    result.payment.invoiceNumber
                );
                if (momoPaymentInfo?.qrCodeUrl || momoPaymentInfo?.payUrl) {
                    result.payment.paymentQrCode = momoPaymentInfo.qrCodeUrl || momoPaymentInfo.payUrl;
                    await result.payment.save();
                }
                
            } catch (momoError) {
                console.error('⚠️ MoMo API error (non-critical):', momoError);
                result.payment.notes = (result.payment.notes || '') + 
                    `\n[ERROR] MoMo QR creation failed: ${momoError.message}`;
                await result.payment.save();
            }
        }
        try {
            // Notification không cần thiết phải trong transaction
            // Nếu fail → không ảnh hưởng data integrity
            await createNotification({
                userId: memberId,
                title: "Subscription and Payment created",
                message: "Gói tập và hóa đơn đã được tạo thành công",
            });

            // Socket events
            socketService.emitToUser(memberId, "subscription_payment_created", result);
            socketService.emitToRoom(roleRoomMap.admin, "subscription_payment_created", result);
        } catch (notificationError) {
            // Log lỗi nhưng không throw (không ảnh hưởng chính)
            console.error('⚠️ Notification/Socket error:', notificationError);
        }

        return response(res, {
            success: true,
            statusCode: 201,
            message: "Subscription and payment created successfully",
            data: {
                subscription: result.subscription,
                payment: result.payment,
                momoPayment: momoPaymentInfo
            }
        });
    } catch (error) {
        return next(error);
    }
}