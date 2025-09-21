import {
    createPayment,
    getAllPayments,
    getPaymentById,
    getPaymentByMemberId,
    updatePayment,
    deletePayment,
    completePaymentMomo
} from '../services/payment.service.js';
import {
    createMomoPayment,
    verifyIpnSignature
} from "../config/momo";

import response from "../utils/response";


export const createPaymentController = async (req, res, next) => {
    try {
        const {
            subscriptionId,
            memberId,
            originalAmount,
            amount,
            discountDetails,
            paymentMethod,
            paymentStatus,
            paymentDate,
        } = req.body;
        const paymentData = {
            subscriptionId,
            memberId,
            originalAmount,
            amount,
            discountDetails,
            paymentMethod,
            paymentStatus,
            paymentDate,
        }
        const payment = await createPayment(paymentData);
        return response(res, {
            success: true,
            statusCode: 201,
            message: "Payment created successfully",
            data: payment
        });
    } catch (error) {
        next(error);
    }
}


export const getAllPaymentsController = async (req, res, next) => {
    try {
        const payments = await getAllPayments();
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Payments fetched successfully",
            data: payments
        });
    } catch (error) {
        next(error);
    }
}

export const getPaymentByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payment = await getPaymentById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Payment fetched successfully",
            data: payment
        });
    } catch (error) {
        next(error);
    }
}

export const updatePaymentController = async (req, res, next) => {
    try {
        const { id } = req.params;
        // có thẻ update nhiều field sau chỉnh sửa thêm ở dây
        const {
            paymentStatus,
            paymentMethod
        } = req.body;
        const payment = await updatePayment(id, req.body);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Payment updated successfully",
            data: payment
        });
    } catch (error) {
        next(error);
    }
}

export const deletePaymentController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payment = await deletePayment(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Payment deleted successfully",
            data: payment
        });
    } catch (error) {
        next(error);
    }
}

export const getPaymentByMemberIdController = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const payment = await getPaymentByMemberId(memberId);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Payment fetched successfully",
            data: payment
        });
    } catch (error) {
        next(error);
    }
}

// payment momo method
export const momoPaymentController = async (req, res, next) => {
    try {
        const {
            subscriptionId,
            memberId,
            originalAmount,
            amount,
            discountDetails,
            paymentMethod,
            paymentStatus,
            paymentDate,
        } = req.body;
        const newPayment = await createPayment({
            subscriptionId,
            memberId,
            originalAmount,
            amount,
            discountDetails,
            paymentMethod: paymentMethod || 'Momo',
            paymentStatus: paymentStatus || 'Pending',
            paymentDate,
        });
        const momoPayment = await createMomoPayment(newPayment.amount, newPayment._id, newPayment.invoiceNumber);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Payment created successfully",
            data: momoPayment
        });
    } catch (error) {
        next(error);
    }
}

export const momoIpnController = async (req, res, next) => {
    try {
        const {
            orderId,
            requestId,
            amount,
            resultCode,
            signature,
            transId,
        } = req.body;
        if (!orderId || !requestId || !amount || resultCode === undefined || !signature) {
            return response(res, {
                success: false,
                statusCode: 400,
                message: "Missing required fields"
            });
          }
        // console.log('verify signature');
        if(!verifyIpnSignature(req.body)){
            console.log('invalid signature');
            return response(res, {
                success: false,
                statusCode: 403,
                message: "Invalid signature"
            });
        }
        let payment = await completePaymentMomo(orderId,transId,resultCode);
        
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Payment completed successfully",
            data: payment
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}
