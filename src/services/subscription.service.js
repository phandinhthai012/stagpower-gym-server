import Subscription from "../models/Subscription";
import Package from "../models/Package";
import User from "../models/User";
import Payment from "../models/Payment";
import mongoose from "mongoose";
import { config } from "dotenv";
import { addMonths, addDays, format } from 'date-fns';
import { withTransaction,createWithSession,findByIdWithSession,saveWithSession } from "../utils/transactionHelper";
import { createMomoPayment } from "../config/momo";


export const createSubscription = async (subscriptionData) => {
    
    const existPackage = await Package.findById(subscriptionData.packageId);
    if (!existPackage) {
        const error = new Error("Package not found");
        error.statusCode = 404;
        error.code = "PACKAGE_NOT_FOUND";
        throw error;
    }
    const memberExists = await User.findById(subscriptionData.memberId);
    if (!memberExists) {
        const error = new Error("Member not found");
        error.statusCode = 404;
        error.code = "MEMBER_NOT_FOUND";
        throw error;
    }
    // Kiểm tra xem member có subscription Active không
    const activeSubscription = await Subscription.findOne({ 
        memberId: subscriptionData.memberId, 
        status: 'Active' 
    });

    // Nếu có subscription Active và đang tạo subscription mới với status Active
    if (activeSubscription && subscriptionData.status === 'Active') {
        const error = new Error("Member already has an active subscription. New subscription must be PendingPayment.");
        error.statusCode = 400;
        error.code = "ACTIVE_SUBSCRIPTION_EXISTS";
        throw error;
    }

    const newSubscription = await Subscription.create(subscriptionData);
    return newSubscription;
};

export const getAllSubscriptions = async () => {
    const subscriptions = await Subscription.find();
    return subscriptions;
};

export const getSubscriptionById = async (id) => {
    const subscription = await Subscription.findById(id);
    return subscription;
};

export const getAllSubscriptionsByMember = async (memberId) => {
    const subscriptions = await Subscription.find({ memberId }).sort({ createdAt: -1 });
    return subscriptions;
};


export const updateSubscription = async (id, subscriptionNewData) => {
    const subscription = await Subscription.findByIdAndUpdate(id, subscriptionNewData, { new: true, runValidators: true });
    if (!subscription) {
        const error = new Error("Subscription not found");
        error.statusCode = 404;
        error.code = "SUBSCRIPTION_NOT_FOUND";
        throw error;
    }
    return subscription;
};

export const deleteSubscription = async (id) => {
    const subscription = await Subscription.findByIdAndDelete(id);
    if (!subscription) {
        const error = new Error("Subscription not found");
        error.statusCode = 404;
        error.code = "SUBSCRIPTION_NOT_FOUND";
        throw error;
    }
    return subscription;
};

export const changeSubscriptionStatus = async (id, status) => {
    const subscription = await Subscription.findById(id);
    if (!subscription) {
        const error = new Error("Subscription not found");
        error.statusCode = 404;
        error.code = "SUBSCRIPTION_NOT_FOUND";
        throw error;
    }
    if(subscription.status ===status){
        const error = new Error("Subscription status is conflict");
        error.statusCode = 409;
        error.code = "SUBSCRIPTION_STATUS_CONFLICT";
        throw error;
    }
    subscription.status = status;
    await subscription.save();
    return subscription;
}

// thêm service như gia hạn, kế thừ PT, tạm ngưng, hủy gói, 

export const suspendSubscription = async (id, suspendData) => {
    try {
        const subscription = await Subscription.findById(id);
        if(!subscription){
            const error = new Error("Subscription not found");
            error.statusCode = 404;
            error.code = "SUBSCRIPTION_NOT_FOUND";
            throw error;
        }
        if (subscription.status !== 'Active') {
            const error = new Error("Subscription is not active");
            error.statusCode = 400;
            error.code = "SUBSCRIPTION_NOT_ACTIVE";
            throw error;
        }
        const suspensionStartDate = suspendData.startDate? new Date(suspendData.startDate) : new Date();
        const suspensionEndDate = new Date(suspendData.endDate);

        if(suspensionEndDate <= suspensionStartDate){
            const error = new Error("End date must be after start date");
            error.statusCode = 400;
            error.code = "END_DATE_MUST_BE_AFTER_START_DATE";
            throw error;
        }
        if(suspensionEndDate <= new Date()){
            const error = new Error("End date must be in the future");
            error.statusCode = 400;
            error.code = "END_DATE_MUST_BE_IN_THE_FUTURE";
            throw error;
        }
        if(Math.ceil((suspensionEndDate - suspensionStartDate) / (1000 * 60 * 60 * 24)) > 60){
            const error = new Error("Suspension cannot exceed 60 days");
            error.statusCode = 400;
            error.code = "SUSPENSION_TOO_LONG";
            throw error;
        }
        // cập nhập ngày hết hạn mới của subscription
        // ngày kết thúc mới = ngày kết thúc cũ + ngày tạm ngưng
        const originalEndDate = new Date(subscription.endDate);
        const newEndDate = new Date(originalEndDate.getTime() + (suspensionEndDate - suspensionStartDate));
        subscription.endDate = newEndDate;
        
        subscription.suspend(suspendData.reason, suspensionStartDate, suspensionEndDate);
        await subscription.save();
        return {
            subscription,
            suspensionInfo: {
                startDate: suspensionStartDate,
                endDate: suspensionEndDate,
                reason: suspendData.reason
            }
        }
        

    } catch (error) {
        throw error;
    }
}

// Khôi phục gói đã tạm ngưng
export const unsuspendSubscription = async (id) => {
    try {
        
        const subscription = await Subscription.findById(id);
        if(!subscription){
            const error = new Error("Subscription not found");
            error.statusCode = 404;
            error.code = "SUBSCRIPTION_NOT_FOUND";
            throw error;
        }
        if (subscription.status !== 'Suspended') {
            const error = new Error("Subscription is not suspended");
            error.statusCode = 400;
            error.code = "NOT_SUSPENDED";
            throw error;
        }
        const today = new Date();
        const suspensionEndDate = new Date(subscription.suspensionEndDate);
        if(today<suspensionEndDate){
            // Người dùng quay lại sớm, cần "trả lại" những ngày chưa nghỉ
            const daysToRefund = Math.ceil((suspensionEndDate - today) / (1000 * 60 * 60 * 24));
            // cập nhập ngày kết thúc mới nếu người dùng quay lại sớm
            subscription.endDate = new Date(subscription.endDate.getTime()- (daysToRefund * 24 * 60 * 60 * 1000));
            subscription.suspensionEndDate = new Date();
            subscription.status = 'Active';
        }
        subscription.unsuspend();
        await subscription.save();
        return subscription;
    } catch (error) {
        throw error;
    }
}

export const autoUnsuspend = async (id) => {
    try {
        const subscription = await Subscription.findById(id);
        if(!subscription){
            return null;
        }
        subscription.unsuspend();
        await subscription.save();
        return subscription;
    }catch (error) {
       return null;
    }
};
// gia hạn hói tập

export const renewSubscription = async (currentSubscriptionId, newPackageId, data) => {
    const { branchId, paymentDetails, bonusDays = 0,isPaid = false,paymentDate } = data;
    const result = await withTransaction(async (session) => {
        const currentSubscription = await findByIdWithSession(Subscription, currentSubscriptionId, session);
        if(!currentSubscription){
            const error = new Error("Subscription not found");
            error.statusCode = 404;
            error.code = "SUBSCRIPTION_NOT_FOUND";
            throw error;
        }
        if (!['Active', 'Expired'].includes(currentSubscription.status)) {
            const error = new Error("Only active or expired subscriptions can be renewed");
            error.statusCode = 400;
            error.code = "SUBSCRIPTION_NOT_ACTIVE_OR_EXPIRED";
            throw error;
        }
        const newPackage = await findByIdWithSession(Package, (newPackageId), session);
        if(!newPackage || newPackage.status !== 'Active') {
            const error = new Error("Package not found or not active");
            error.statusCode = 404;
            error.code = "PACKAGE_NOT_FOUND_OR_NOT_ACTIVE";
            throw error;
        }
        // Backup old state
        const oldState = {
            endDate: currentSubscription.endDate,
            durationDays: currentSubscription.durationDays,
            status: currentSubscription.status,
            packageId: currentSubscription.packageId,
            ptsessionsRemaining: currentSubscription.ptsessionsRemaining
        };
        const now = new Date();
        // ngày kết thúc của gói cũ
        const currentEndDate = new Date(currentSubscription.endDate);
        // kiểm tra xem gói cũ có hết hạn không
        const isExpired = currentEndDate < now;

        // ngày bắt đầu của gói mới (nếu gói cũ chưa hết hạn thì ngày bắt đầu là ngày kết thúc của gói cũ + 1 ngày, nếu gói cũ hết hạn thì ngày bắt đầu là ngày thanh toán)
        const newStartDate = !isExpired ? addDays(currentEndDate, 1) : (paymentDate||now);
        // ngày kết thúc của gói mới (ngày kết thúc của gói mới = ngày bắt đầu của gói mới + số tháng của gói mới)
        const newEndDate = addMonths(newStartDate, newPackage.durationMonths);
        let finalEndDate = newEndDate;
        // nếu gói cũ chưa hết hạn thì ngày kết thúc của gói mới = ngày kết thúc của gói mới + số ngày bonus
        if(!isExpired){ // uu dãi gia hạn sớm
            finalEndDate = addDays(finalEndDate, bonusDays);
        }else {
            finalEndDate = newEndDate;
        }


        let totalPTSessions = 0; // số buổi PT của gói mới
        let inheritedSessions = 0; // số buổi PT còn lại từ gói cũ
        if (newPackage.type === 'PT' || newPackage.type === 'Combo') {
            // Kế thừa số buổi còn lại từ gói cũ (chỉ khi chưa hết hạn)
            inheritedSessions = !isExpired ? (currentSubscription.ptsessionsRemaining || 0) : 0;
            totalPTSessions = inheritedSessions + (newPackage.ptSessions || 0);
        }
        // reset số buổi PT còn lại của gói cũ
        currentSubscription.ptsessionsRemaining = 0;
        await saveWithSession(currentSubscription, session);
        // tạo subscription mới
        let startDate, endDate, status;
        if (isPaid) {
            startDate = newStartDate;
            endDate = finalEndDate;
            status = newStartDate > now ? 'NotStarted' : 'Active';
        } else {
            startDate = null;
            endDate = null;
            status = 'PendingPayment';
        }
        const newSubscription = await createWithSession(Subscription, {
            memberId: currentSubscription.memberId,
            packageId: newPackageId,
            branchId: branchId,
            type: newPackage.type,
            membershipType: newPackage.membershipType,
            startDate: startDate,
            endDate: endDate,
            durationDays: Math.ceil((finalEndDate - newStartDate) / (1000 * 60 * 60 * 24)),
            ptsessionsRemaining: totalPTSessions,
            ptsessionsUsed: 0,
            status: status,
            renewedFrom: currentSubscription._id,
            bonusDays: bonusDays,
        }, session);
        // thanh toán    
        const payment = await createWithSession(Payment, {
            subscriptionId: newSubscription._id,
            memberId: currentSubscription.memberId,
            originalAmount: newPackage.price,
            amount: paymentDetails?.amount || newPackage.price,
            discountDetails: paymentDetails?.discountDetails?.map(discount => ({
                discountId: discount.discountId,
                type: discount.type,
                discountPercentage: discount.discountPercentage,
                discountAmount: discount.discountAmount,
                description: discount.description,
                appliedAt: new Date()
            })) || [],
            paymentMethod: paymentDetails?.paymentMethod || 'Cash',
            paymentStatus: isPaid ? 'Completed' : 'Pending',
            paymentDate: isPaid ? paymentDate : null,
            notes: `Renewal for subscription ${currentSubscriptionId} - ${isExpired ? 'After expiry' : 'Before expiry'} - Inherited ${inheritedSessions} PT sessions`
        }, session);
        const response = {
            subscription: newSubscription,
            payment: payment,
            oldState: oldState
        }
        if (!isPaid && paymentDetails?.paymentMethod === 'Momo') {
            const momoPayment = await createMomoPayment(paymentResponse.amount, paymentResponse._id, paymentResponse.invoiceNumber);
            response.momoPayment = momoPayment;
        }
        return response;

    });
    return result;
}
//         const subscription = await Subscription.findById(id);
//         if (!subscription) {
//             const error = new Error("Subscription not found");
//             error.statusCode = 404;
//             error.code = "SUBSCRIPTION_NOT_FOUND";
//             throw error;
//         }

//         // Calculate new end date
//         const currentEndDate = new Date(subscription.endDate);
//         const newEndDate = new Date(currentEndDate.getTime() + (days * 24 * 60 * 60 * 1000));

//         // Update subscription
//         subscription.endDate = newEndDate;
//         subscription.durationDays += days;
        
//         // Add to extension history
//         subscription.extensionHistory.push({
//             days: days,
//             reason: reason || "Extension",
//             extendedAt: new Date(),
//             newEndDate: newEndDate
//         });

//         await subscription.save();

//         return {
//             subscription,
//             extensionInfo: {
//                 days: days,
//                 oldEndDate: currentEndDate,
//                 newEndDate: newEndDate,
//                 reason: reason || "Extension"
//             }
//         };

//     } catch (error) {
//         throw error;
//     }
// }

// // Hủy gói
// const cancelSubscription = async (id, cancelData) => {
    // try {
    //     const { reason, refundAmount } = cancelData;
        
    //     const subscription = await Subscription.findById(id);
    //     if (!subscription) {
    //         const error = new Error("Subscription not found");
    //         error.statusCode = 404;
    //         error.code = "SUBSCRIPTION_NOT_FOUND";
    //         throw error;
    //     }

    //     if (subscription.status === 'Cancelled') {
    //         const error = new Error("Subscription is already cancelled");
    //         error.statusCode = 400;
    //         error.code = "ALREADY_CANCELLED";
    //         throw error;
    //     }

    //     // Cancel subscription
    //     subscription.status = 'Cancelled';
    //     subscription.cancelledAt = new Date();
    //     subscription.cancellationReason = reason || "No reason";
    //     subscription.refundAmount = refundAmount || 0;

    //     await subscription.save();

    //     return {
    //         subscription,
    //         cancellationInfo: {
    //             reason: reason || "No reason",
    //             cancelledAt: subscription.cancelledAt,
    //             refundAmount: refundAmount || 0
    //         }
    //     };

    // } catch (error) {
    //     throw error;
    // }
// }

// // Lấy lịch sử tạm ngưng
// const getSuspensionHistory = async (id) => {
//     try {
//         const subscription = await Subscription.findById(id);
//         if (!subscription) {
//             const error = new Error("Subscription not found");
//             error.statusCode = 404;
//             error.code = "SUBSCRIPTION_NOT_FOUND";
//             throw error;
//         }

//         return {
//             subscriptionId: id,
//             suspensionHistory: subscription.suspensionHistory,
//             currentStatus: subscription.status,
//             suspensionStartDate: subscription.suspensionStartDate,
//             suspensionEndDate: subscription.suspensionEndDate
//         };

//     } catch (error) {
//         throw error;
//     }
// }

// Export all functions
// export {
//     suspendSubscription,
//     unsuspendSubscription,
//     extendSubscription,
//     cancelSubscription,
//     getSuspensionHistory
// }



// src/services/subscription.service.js - UNCOMMENT VÀ SỬA
// export const extendSubscription = async (id, extendData) => {
//     try {
//         const { days, bonusDays = 0, reason, extendPTSessions = 0 } = extendData;
        
//         if (!days || days <= 0) {
//             const error = new Error("Valid days are required");
//             error.statusCode = 400;
//             error.code = "INVALID_DAYS";
//             throw error;
//         }

//         const subscription = await Subscription.findById(id);
//         if (!subscription) {
//             const error = new Error("Subscription not found");
//             error.statusCode = 404;
//             error.code = "SUBSCRIPTION_NOT_FOUND";
//             throw error;
//         }

//         if (subscription.status !== 'Active') {
//             const error = new Error("Only active subscriptions can be extended");
//             error.statusCode = 400;
//             error.code = "SUBSCRIPTION_NOT_ACTIVE";
//             throw error;
//         }

//         // Tính tổng ngày gia hạn (ngày chính + ngày bonus)
//         const totalDays = days + bonusDays;
        
//         // Lưu thông tin cũ
//         const oldEndDate = new Date(subscription.endDate);
//         const oldDurationDays = subscription.durationDays;
//         const oldPTSessions = subscription.ptsessionsRemaining;

//         // Gia hạn subscription
//         subscription.extend(totalDays);
        
//         // Gia hạn PT sessions nếu có
//         if (extendPTSessions > 0) {
//             subscription.extendPTSessions(extendPTSessions);
//         }

//         // Thêm vào lịch sử gia hạn (nếu có field này)
//         if (!subscription.extensionHistory) {
//             subscription.extensionHistory = [];
//         }
        
//         subscription.extensionHistory.push({
//             days: totalDays,
//             bonusDays: bonusDays,
//             reason: reason || "Extension",
//             extendedAt: new Date(),
//             oldEndDate: oldEndDate,
//             newEndDate: subscription.endDate,
//             oldPTSessions: oldPTSessions,
//             newPTSessions: subscription.ptsessionsRemaining
//         });

//         await subscription.save();

//         return {
//             subscription,
//             extensionInfo: {
//                 days: totalDays,
//                 bonusDays: bonusDays,
//                 oldEndDate: oldEndDate,
//                 newEndDate: subscription.endDate,
//                 oldDurationDays: oldDurationDays,
//                 newDurationDays: subscription.durationDays,
//                 oldPTSessions: oldPTSessions,
//                 newPTSessions: subscription.ptsessionsRemaining,
//                 reason: reason || "Extension"
//             }
//         };

//     } catch (error) {
//         throw error;
//     }
// }