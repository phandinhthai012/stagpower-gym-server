import {
    createBookingRequest,
    getAllBookingRequests,
    getBookingRequestById,
    updateBookingRequestById,
    deleteBookingRequestById,
    getBookingRequestByStatus,
    getBookingRequestsByMember,
    getBookingRequestsByTrainer,
    confirmBookingRequest,
    rejectBookingRequest,
} from "../services/bookingrequest.service.js";

import response from "../utils/response.js";


export const createBookingRequestController = async (req, res, next) => {
    try {
        const {
            memberId,
            trainerId,
            subscriptionId,
            requestDateTime,
            duration,
            notes,
            status
        } = req.body;
        const bookingRequest = await createBookingRequest({
            memberId,
            trainerId,
            subscriptionId,
            requestDateTime,
            duration,
            notes,
            status
        });
        return response(res, {
            success: true,
            statusCode: 201,
            message: "Booking request created successfully",
            data: bookingRequest
        });
    } catch (error) {
        next(error);
    }
}


export const getAllBookingRequestsController = async (req, res, next) => {
    try {
        const bookingRequests = await getAllBookingRequests();
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Booking requests fetched successfully",
            data: bookingRequests
        });
    } catch (error) {
        next(error);
    }
}

export const getBookingRequestByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const bookingRequest = await getBookingRequestById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Booking request fetched successfully",
            data: bookingRequest
        });
    } catch (error) {
        next(error);
    }
}


export const updateBookingRequestByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            trainerId,
            subscriptionId,
            requestDateTime,
            duration,
            notes,
            status,
        } = req.body;
        const bookingRequest = await updateBookingRequestById(id, {
            trainerId,
            subscriptionId,
            requestDateTime,
            duration,
            notes,
            status,
        });
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Booking request updated successfully",
            data: bookingRequest
        });
    } catch (error) {
        next(error);
    }
}

export const deleteBookingRequestByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const bookingRequest = await deleteBookingRequestById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Booking request deleted successfully",
            data:{
                message: "Booking request deleted successfully"
            }
        });
    } catch (error) {
        next(error);
    }
}

export const confirmBookingRequestController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const bookingRequest = await confirmBookingRequest(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Booking request confirmed successfully",
            data: bookingRequest
        });
    } catch (error) {
        next(error);
    }
}

export const rejectBookingRequestController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rejectReason } = req.body;
        const bookingRequest = await rejectBookingRequest(id, rejectReason);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Booking request rejected successfully",
            data: bookingRequest
        });
    } catch (error) {
        next(error);
    }
}

export const getBookingRequestByStatusController = async (req, res, next) => {
    try {
        const { status } = req.params;
        const bookingRequest = await getBookingRequestByStatus(status);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Booking request fetched successfully",
            data: bookingRequest
        });
    } catch (error) {
        next(error);
    }
}

export const getBookingRequestsByMemberController = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const bookingRequests = await getBookingRequestsByMember(memberId);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Booking requests fetched successfully",
            data: bookingRequests
        });
    } catch (error) {
        next(error);
    }
}

export const getBookingRequestsByTrainerController = async (req, res, next) => {
    try {
        const { trainerId } = req.params;
        const bookingRequests = await getBookingRequestsByTrainer(trainerId);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Booking requests fetched successfully",
            data: bookingRequests
        });
    } catch (error) {
        next(error);
    }
}