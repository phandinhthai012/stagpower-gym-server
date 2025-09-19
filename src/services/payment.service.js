import Payment from "../models/Payment";
import {
    changeSubscriptionStatus

} from "./subscription.service";


export const createPayment = async (paymentData) => {
    const payment = await Payment.create(paymentData);
    return payment;
}

export const getAllPayments = async () => {
    const payments = await Payment.find();
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

