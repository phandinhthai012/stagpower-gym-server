import Payment from "../models/Payment";
import Subscription from "../models/Subscription";



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
    if(!payment) {
        const error = new Error("Payment not found");
        error.statusCode = 404;
        throw error;
    }
    return payment;
}

export const  getPaymentByMemberId = async (memberId) => {
    const payments = await Payment.findByMember(memberId);
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


export const completePayment = async (id) => {
    const payment = await Payment.findById(id);
    if(!payment) {
        const error = new Error("Payment not found");
        error.statusCode = 404;
        throw error;
    }
    if(payment.paymentStatus === "Completed") {
        const error = new Error("Payment already completed");
        error.statusCode = 400;
        throw error;
    }
    payment.paymentStatus = "Completed";
    await payment.save();
    // kiểm tra để kích hoạt subscription
    // if (payment.subscriptionId) {
    //     const sub = await Subscription.findById(payment.subscriptionId);
    //     if (sub && sub.status !== "Active") {
    //       sub.status = "Active";
    //       await sub.save();
    //     }
    // }
    return payment;
}

