import Payment from "../models/Payment";
import Subscription from "../models/Subscription";
import Package from "../models/Package";
import {
    changeSubscriptionStatus

} from "./subscription.service";

import { paginate } from "../utils/pagination";

// Helper function để xử lý subscription khi payment completed
const handleSubscriptionActivation = async (subscriptionId, paymentDate) => {
    const subscription = await Subscription.findById(subscriptionId);
    
    if (subscription) {
        const packageInfo = await Package.findById(subscription.packageId);
        if (!packageInfo) return;
        
        // Tìm tất cả gói đã thanh toán (Active hoặc NotStarted) của member này
        const paidSubscriptions = await Subscription.find({
            memberId: subscription.memberId,
            status: { $in: ['Active', 'NotStarted'] },
            _id: { $ne: subscription._id }
        }).sort({ endDate: -1 }); // Sắp xếp theo endDate giảm dần
        
        if (paidSubscriptions.length === 0) {
            // Không có gói nào đã thanh toán: Bắt đầu ngay
            subscription.startDate = paymentDate || new Date();
            const newEndDate = new Date(subscription.startDate);
            newEndDate.setMonth(newEndDate.getMonth() + packageInfo.durationMonths);
            subscription.endDate = newEndDate;
            subscription.status = 'Active';
        } else {
            // Có gói đã thanh toán: Tìm latestEndDate
            const latestEndDate = new Date(Math.max(...paidSubscriptions.map(sub => new Date(sub.endDate))));
            
            // Bắt đầu sau gói cuối cùng + 1 ngày
            subscription.startDate = new Date(latestEndDate);
            subscription.startDate.setDate(subscription.startDate.getDate() + 1);
            
            // Tính endDate
            const newEndDate = new Date(subscription.startDate);
            newEndDate.setMonth(newEndDate.getMonth() + packageInfo.durationMonths);
            subscription.endDate = newEndDate;
            
            subscription.status = 'NotStarted';
        }
        
        await subscription.save();
    }
};


export const createPayment = async (paymentData) => {
    const payment = await Payment.create(paymentData);
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
    // If updating to Completed status, set paymentDate
    if (paymentData.paymentStatus === "Completed") {
        paymentData.paymentDate = new Date();
    }
    
    const payment = await Payment.findByIdAndUpdate(id, paymentData, { new: true, runValidators: true });
    
    // If payment is completed, update subscription status to Active
    if (payment && paymentData.paymentStatus === "Completed" && payment.subscriptionId) {
        await handleSubscriptionActivation(payment.subscriptionId, payment.paymentDate);
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