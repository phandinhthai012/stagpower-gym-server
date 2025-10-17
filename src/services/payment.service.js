import Payment from "../models/Payment";
import {
    changeSubscriptionStatus

} from "./subscription.service";

import { paginate } from "../utils/pagination";


export const createPayment = async (paymentData) => {
    const payment = await Payment.create(paymentData);
    return payment;
}

export const getAllPayments = async () => {
    const payments = await Payment.find()
        .populate('memberId', 'name email phone')
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
    const payment = await Payment.findByIdAndUpdate(id, paymentData, { new: true, runValidators: true });
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
    await changeSubscriptionStatus(payment.subscriptionId, "Active");
    await payment.save();
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
    if (transactionId) {
        payment.transactionId = transactionId;
    }
    await payment.save();
    // kiểm tra để kích hoạt subscription
    await changeSubscriptionStatus(payment.subscriptionId, "Active");
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