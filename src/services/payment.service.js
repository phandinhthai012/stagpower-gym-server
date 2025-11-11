import Payment from "../models/Payment";
import Subscription from "../models/Subscription";
import Package from "../models/Package";
import User from "../models/User";
import {
    changeSubscriptionStatus

} from "./subscription.service";

import { paginate } from "../utils/pagination";

// Helper function to update member's total spending
const updateMemberTotalSpending = async (memberId, paymentAmount) => {
    try {
        const user = await User.findById(memberId);
        if (!user || user.role !== 'member') return;
        
        // Initialize memberInfo if it doesn't exist
        if (!user.memberInfo) {
            user.memberInfo = {};
        }
        
        // Update total spending
        const currentSpending = user.memberInfo.total_spending || 0;
        user.memberInfo.total_spending = currentSpending + paymentAmount;
        
        await user.save();
        console.log(`Updated member ${memberId} total spending: ${user.memberInfo.total_spending}`);
    } catch (error) {
        console.error('Error updating member total spending:', error);
        // Don't throw error, just log it to avoid breaking payment flow
    }
};

// Helper function để xử lý subscription khi payment completed
const handleSubscriptionActivation = async (subscriptionId, paymentDate) => {
    const subscription = await Subscription.findById(subscriptionId);
    
    if (subscription) {
        const packageInfo = await Package.findById(subscription.packageId);
        if (!packageInfo) return;
         // Xác định các gói xung đột dựa trên type
        let conflictingSubscriptions;
        if (subscription.type === 'Membership' || subscription.type === 'Combo') {
            // Membership và Combo xung đột với nhau (vì cả 2 đều cho phép vào gym)
            conflictingSubscriptions = await Subscription.find({
                memberId: subscription.memberId,
                type: { $in: ['Membership', 'Combo'] },
                status: { $in: ['Active', 'NotStarted'] },
                _id: { $ne: subscription._id }
            }).sort({ endDate: -1 });
        } else if (subscription.type === 'PT') {
            // PT chỉ xung đột với PT khác, không xung đột với Membership/Combo
            conflictingSubscriptions = await Subscription.find({
                memberId: subscription.memberId,
                type: 'PT',
                status: { $in: ['Active', 'NotStarted'] },
                _id: { $ne: subscription._id }
            }).sort({ endDate: -1 });
        }
        if (!conflictingSubscriptions || conflictingSubscriptions.length === 0) {
            // Không có gói nào xung đột: Bắt đầu ngay
            subscription.startDate = paymentDate || new Date();
            const newEndDate = new Date(subscription.startDate);
            newEndDate.setMonth(newEndDate.getMonth() + packageInfo.durationMonths);
            newEndDate.setDate(newEndDate.getDate() + (subscription.bonusDays || 0));
            subscription.endDate = newEndDate;
            subscription.status = 'Active';
        } else {
            // Có gói xung đột: Tìm latestEndDate và xếp hàng
            const latestEndDate = new Date(Math.max(...conflictingSubscriptions.map(sub => new Date(sub.endDate))));
            
            // Bắt đầu sau gói cuối cùng + 1 ngày
            subscription.startDate = new Date(latestEndDate);
            subscription.startDate.setDate(subscription.startDate.getDate() + 1);
            
            // Tính endDate
            const newEndDate = new Date(subscription.startDate);
            newEndDate.setMonth(newEndDate.getMonth() + packageInfo.durationMonths);
            newEndDate.setDate(newEndDate.getDate() + (subscription.bonusDays || 0));
            subscription.endDate = newEndDate;
            
            subscription.status = 'NotStarted';
        }
        // Tìm tất cả gói đã thanh toán (Active hoặc NotStarted) của member này
        // const paidSubscriptions = await Subscription.find({
        //     memberId: subscription.memberId,
        //     type: subscription.type,
        //     status: { $in: ['Active', 'NotStarted'] },
        //     _id: { $ne: subscription._id }
        // }).sort({ endDate: -1 }); // Sắp xếp theo endDate giảm dần
        
        // if (paidSubscriptions.length === 0) {
        //     // Không có gói nào đã thanh toán: Bắt đầu ngay
        //     subscription.startDate = paymentDate || new Date();
        //     const newEndDate = new Date(subscription.startDate);
        //     newEndDate.setMonth(newEndDate.getMonth() + packageInfo.durationMonths);
        //     newEndDate.setDate(newEndDate.getDate() + (subscription.bonusDays || 0)); // thêm cái này nếu có ưu dãi gì đó
        //     subscription.endDate = newEndDate;
        //     subscription.status = 'Active';
        // } else {
        //     // Có gói đã thanh toán: Tìm latestEndDate
        //     const latestEndDate = new Date(Math.max(...paidSubscriptions.map(sub => new Date(sub.endDate))));
            
        //     // Bắt đầu sau gói cuối cùng + 1 ngày
        //     subscription.startDate = new Date(latestEndDate);
        //     subscription.startDate.setDate(subscription.startDate.getDate() + 1);
            
        //     // Tính endDate
        //     const newEndDate = new Date(subscription.startDate);
        //     newEndDate.setMonth(newEndDate.getMonth() + packageInfo.durationMonths);
        //     newEndDate.setDate(newEndDate.getDate() + (subscription.bonusDays || 0)); // thêm cái này nếu có ưu dãi gì đó
        //     subscription.endDate = newEndDate;
            
        //     subscription.status = 'NotStarted';
        // }
        
        await subscription.save();
    }
};


export const createPayment = async (paymentData, session = null) => {
    if (!paymentData.memberId) {
        const error = new Error("Member ID is required");
        error.statusCode = 400;
        error.code = "MEMBER_ID_REQUIRED";
        throw error;
    }

    if (paymentData.dueDate) {
        paymentData.dueDate = new Date(paymentData.dueDate);
    }

    let packageIdForSubscription = paymentData.packageId;
    let branchIdForSubscription = paymentData.branchId;

    // Nếu chưa có subscriptionId nhưng có packageId => tự tạo subscription mới
    if (!paymentData.subscriptionId && packageIdForSubscription) {
        const packageInfo = await Package.findById(packageIdForSubscription);
        if (!packageInfo) {
            const error = new Error("Package not found");
            error.statusCode = 404;
            error.code = "PACKAGE_NOT_FOUND";
            throw error;
        }

        const durationDays = (packageInfo.durationMonths || 0) * 30;
        if (!durationDays) {
            const error = new Error("Package duration invalid");
            error.statusCode = 400;
            error.code = "INVALID_PACKAGE_DURATION";
            throw error;
        }

        const subscriptionPayload = {
            memberId: paymentData.memberId,
            packageId: packageIdForSubscription,
            branchId: branchIdForSubscription || null,
            type: packageInfo.type,
            membershipType: packageInfo.membershipType || 'Basic',
            durationDays: durationDays,
            status: 'PendingPayment',
            ptsessionsRemaining: (packageInfo.type === 'PT' || packageInfo.type === 'Combo') ? (packageInfo.ptSessions || 0) : undefined,
            ptsessionsUsed: (packageInfo.type === 'PT' || packageInfo.type === 'Combo') ? 0 : undefined,
        };

        // loại bỏ undefined để tránh validation
        Object.keys(subscriptionPayload).forEach((key) => {
            if (subscriptionPayload[key] === undefined) {
                delete subscriptionPayload[key];
            }
        });

        const newSubscription = session
            ? await Subscription.create([subscriptionPayload], { session }).then(docs => docs[0])
            : await Subscription.create(subscriptionPayload);

        paymentData.subscriptionId = newSubscription._id;
    }

    delete paymentData.packageId;
    delete paymentData.branchId;

    // Nếu chưa có paymentType, tự động xác định dựa trên subscription
    if (!paymentData.paymentType && paymentData.subscriptionId) {
        try {
            const subscription = await Subscription.findById(paymentData.subscriptionId)
                .populate('packageId', 'type');
            
            if (subscription) {
                // Kiểm tra nếu là renewal (có renewedFrom)
                if (subscription.renewedFrom) {
                    paymentData.paymentType = 'RENEWAL';
                } 
                // Kiểm tra nếu là PT package
                else if (subscription.packageId && subscription.packageId.type === 'PT') {
                    paymentData.paymentType = 'PT_PURCHASE';
                } 
                // Mặc định là đăng ký gói mới
                else {
                    paymentData.paymentType = 'NEW_SUBSCRIPTION';
                }
            }
        } catch (error) {
            console.error('Error determining paymentType:', error);
            // Nếu lỗi, mặc định là NEW_SUBSCRIPTION
            paymentData.paymentType = 'NEW_SUBSCRIPTION';
        }
    }
    
    const payment = session
        ? await Payment.create([paymentData], { session }).then(docs => docs[0])
        : await Payment.create(paymentData);
    
    return payment;
}

export const getAllPayments = async () => {
    const payments = await Payment.find()
        .populate('memberId', 'fullName email phone')
        .populate('subscriptionId', 'type membershipType')
        .populate({
            path: 'subscriptionId',
            populate: {
                path: 'packageId',
                select: 'name type durationMonths price'
            }
        });
    return payments;
}

export const getPaymentById = async (id) => {
    const payment = await Payment.findById(id);
    if (!payment) {
        const error = new Error("Payment not found");
        error.statusCode = 404;
        throw error;
    }
    return payment;
}

export const getPaymentByMemberId = async (memberId) => {
    const payments = await Payment.findByMember(memberId);
    return payments;
}


export const getPaymentByInvoiceNumber = async (invoiceNumber) => {
    const payment = await Payment.findOne({ invoiceNumber });
    return payment;
}

export const getPaymentByStatus = async (status) => {
    const payments = await Payment.find({ paymentStatus: status });
    return payments;
}

export const updatePayment = async (id, paymentData) => {
    // Get old payment to check if status changed
    const oldPayment = await Payment.findById(id);
    const wasNotCompleted = oldPayment && oldPayment.paymentStatus !== "Completed";
    
    // If updating to Completed status, set paymentDate
    if (paymentData.paymentStatus === "Completed") {
        paymentData.paymentDate = new Date();
    }
    
    const payment = await Payment.findByIdAndUpdate(id, paymentData, { new: true, runValidators: true });
    
    // If payment is completed, update subscription status to Active
    if (payment && paymentData.paymentStatus === "Completed" && payment.subscriptionId) {
        await handleSubscriptionActivation(payment.subscriptionId, payment.paymentDate);
        
        // Update member's total spending (only if status changed from not-completed to completed)
        if (wasNotCompleted) {
            await updateMemberTotalSpending(payment.memberId, payment.amount);
        }
    }
    
    return payment;
}

export const deletePayment = async (id) => {
    const payment = await Payment.findByIdAndDelete(id);
    return payment;
}

// use for payment method cash
export const completePayment = async (id) => {
    const payment = await Payment.findById(id);
    if (!payment) {
        const error = new Error("Payment not found");
        error.statusCode = 404;
        throw error;
    }
    if (payment.paymentStatus === "Completed") {
        const error = new Error("Payment already completed");
        error.statusCode = 400;
        throw error;
    }
    payment.paymentStatus = "Completed";
    payment.paymentDate = new Date(); // Set payment date
    await payment.save();
    
    // Handle subscription activation
    await handleSubscriptionActivation(payment.subscriptionId, payment.paymentDate);
    
    // Update member's total spending
    await updateMemberTotalSpending(payment.memberId, payment.amount);
    
    return payment;
}

export const completePaymentMomo = async (id, transactionId, resultCode) => {
    const payment = await Payment.findById(id);
    if (!payment) {
        const error = new Error("Payment not found");
        error.statusCode = 404;
        throw error;
    }
    if (payment.paymentStatus === "Completed") {
        const error = new Error("Payment already completed");
        error.statusCode = 400;
        throw error;
    }
    if (resultCode && resultCode !== 0) {
        payment.paymentStatus = "Failed";
        await payment.save();
        return payment;
    }
    payment.paymentStatus = "Completed";
    payment.paymentDate = new Date(); // Set payment date
    if (transactionId) {
        payment.transactionId = transactionId;
    }
    await payment.save();
    
    // Handle subscription activation
    await handleSubscriptionActivation(payment.subscriptionId, payment.paymentDate);
    
    // Update member's total spending
    await updateMemberTotalSpending(payment.memberId, payment.amount);
    
    return payment;
}


export const getAllPaymentsWithPagination = async (options) => {
    const payments = await paginate(Payment, {}, options);
    return payments;
}

export const getPaymentStats = async () => {
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ paymentStatus: 'Completed' });
    const pendingPayments = await Payment.countDocuments({ paymentStatus: 'Pending' });
    const failedPayments = await Payment.countDocuments({ paymentStatus: 'Failed' });
    
    const totalAmount = await Payment.aggregate([
        { $match: { paymentStatus: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const monthlyStats = await Payment.aggregate([
        {
            $match: {
                paymentStatus: 'Completed',
                createdAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);
    
    return {
        totalPayments,
        completedPayments,
        pendingPayments,
        failedPayments,
        totalAmount: totalAmount[0]?.total || 0,
        monthlyAmount: monthlyStats[0]?.total || 0,
        monthlyCount: monthlyStats[0]?.count || 0
    };
}