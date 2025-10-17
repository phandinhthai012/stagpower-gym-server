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
    getAllBookingRequestsWithPagination,
} from "../services/bookingRequest.service.js";
import socketService from "../services/socket.service.js";
import { createNotification } from "../services/notification.service.js";
import { roleRoomMap } from "../utils/socketUtils.js";

import response from "../utils/response.js";


export const createBookingRequestController = async (req, res, next) => {
    try {
        const user = req.user;
        const {
            memberId,
            trainerId,
            requestDateTime,
            duration,
            notes,
            status
        } = req.body;
        const bookingRequest = await createBookingRequest({
            memberId,
            trainerId,
            requestDateTime,
            duration,
            notes,
            status
        });
        // tạo notification
        if (user._id === bookingRequest.trainerId) {
            await createNotification({
                userId: bookingRequest.memberId,
                title: "New booking request",
                message: "New booking request",
            });
            socketService.emitToUser(bookingRequest.memberId, "new_booking_request", bookingRequest);
        } else if (user._id === bookingRequest.memberId) {
            await createNotification({
                userId: bookingRequest.trainerId,
                title: "New booking request",
                message: "New booking request",
            });
            socketService.emitToUser(bookingRequest.trainerId, "new_booking_request", bookingRequest);
        }else {
            await createNotification({
                userId: bookingRequest.trainerId,
                title: "New booking request",
                message: "New booking request",
            });
            await createNotification({
                userId: bookingRequest.memberId,
                title: "New booking request",
                message: "New booking request",
            });
            socketService.emitToUser(bookingRequest.trainerId, "new_booking_request", bookingRequest);
            socketService.emitToUser(bookingRequest.memberId, "new_booking_request", bookingRequest);
        }
        socketService.emitToRoom(roleRoomMap.admin, "new_booking_request", bookingRequest);
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
        const user = req.user;
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
        // tạo notification
        if (user._id === bookingRequest.trainerId) {
            await createNotification({
                userId: bookingRequest.memberId,
                title: "Booking request updated",
                message: "Booking request updated",
            });
            socketService.emitToUser(bookingRequest.memberId, "booking_request_updated", bookingRequest);
        } else if (user._id === bookingRequest.memberId) {
            await createNotification({
                userId: bookingRequest.trainerId,
                title: "Booking request updated",
                message: "Booking request updated",
            });
            socketService.emitToUser(bookingRequest.trainerId, "booking_request_updated", bookingRequest);
        } else {
            await createNotification({
                userId: bookingRequest.trainerId,
                title: "Yêu cầu đặt lịch đã được cập nhật",
                message: "Yêu cầu đặt lịch đã được admin cập nhật",
                type: "INFO",
                status: "UNREAD"
            });
            
            await createNotification({
                userId: bookingRequest.memberId,
                title: "Yêu cầu đặt lịch đã được cập nhật", 
                message: "Yêu cầu đặt lịch của bạn đã được admin cập nhật",
                type: "INFO",
                status: "UNREAD"
            });
            socketService.emitToUser(bookingRequest.trainerId, "booking_request_updated", bookingRequest);
            socketService.emitToUser(bookingRequest.memberId, "booking_request_updated", bookingRequest);
        }
        socketService.emitToRoom(roleRoomMap.admin, "booking_request_updated", bookingRequest);

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
        await createNotification({
            userId: bookingRequest.trainerId,
            title: "Booking request deleted",
            message: "Booking request deleted",
            type: "WARNING",
        });
        await createNotification({
            userId: bookingRequest.memberId,
            title: "Booking request deleted",
            message: "Booking request deleted",
            type: "WARNING",
        });
        // gửi tới trainer
        socketService.emitToUser(bookingRequest.trainerId, "booking_request_deleted", bookingRequest);
        // gửi tới member
        socketService.emitToUser(bookingRequest.memberId, "booking_request_deleted", bookingRequest);
        // gửi tới admin
        socketService.emitToRoom(roleRoomMap.admin, "booking_request_deleted", bookingRequest);

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
        const user = req.user;
        const result = await confirmBookingRequest(id);
        
        await createNotification({
            userId: result.bookingRequest.memberId,
            title: "Booking request confirmed",
            message: "Booking request confirmed",
        });
        await createNotification({
            userId: result.bookingRequest.trainerId,
            title: "Booking request confirmed",
            message: "Booking request confirmed",
        });

        if(user._id === result.bookingRequest.trainerId) {
            socketService.emitToUser(result.bookingRequest.trainerId, "booking_request_confirmed", result.bookingRequest);
        }
        // gửi tới member
        socketService.emitToUser(result.bookingRequest.memberId, "booking_request_confirmed", result.bookingRequest);
        // gửi tới admin
        socketService.emitToRoom(roleRoomMap.admin, "booking_request_confirmed", result.bookingRequest);

        return response(res, {
            success: true,
            statusCode: 200,
            message: "Booking request confirmed and schedule created successfully",
            data: {
                bookingRequest: result.bookingRequest,
                schedule: result.schedule
            }
        });
    } catch (error) {
        next(error);
    }
}

export const rejectBookingRequestController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rejectReason } = req.body;
        const user = req.user;
        const bookingRequest = await rejectBookingRequest(id, rejectReason);

        await createNotification({
            userId: bookingRequest.memberId,
            title: "Booking request rejected",
            message: "Booking request rejected",
        });
        await createNotification({
            userId: bookingRequest.trainerId,
            title: "Booking request rejected",
            message: "Booking request rejected",
        });
        if(user._id === bookingRequest.trainerId) {
            socketService.emitToUser(bookingRequest.trainerId, "booking_request_rejected", bookingRequest);
        }
        // gửi tới member
        socketService.emitToUser(bookingRequest.memberId, "booking_request_rejected", bookingRequest);
        // gửi tới admin
        socketService.emitToRoom(roleRoomMap.admin, "booking_request_rejected", bookingRequest);

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

export const getAllBookingRequestsWithPaginationController = async (req, res, next) => {
    try {
        const { page, limit, sort, search } = req.query;
        const bookingRequests = await getAllBookingRequestsWithPagination({ page, limit, sort, search });
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
