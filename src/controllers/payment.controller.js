import {
    createPayment,
    getAllPayments,
    getPaymentById,
    getPaymentByMemberId,
    updatePayment,
    deletePayment,
    completePayment
} from '../services/payment.service.js';

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
        const {id} = req.params;
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
        const {memberId} = req.params;
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