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

        // Fetch member and trainer info
        const User = require('../models/User.js').default;
        const member = await User.findById(bookingRequest.memberId).select('fullName');
        const trainer = await User.findById(bookingRequest.trainerId).select('fullName');

        const requestDate = new Date(bookingRequest.requestDateTime);
        const formattedDate = requestDate.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // tạo notification
        if (user._id === bookingRequest.trainerId) {
            await createNotification({
                userId: bookingRequest.memberId,
                title: "Yêu cầu đặt lịch mới",
                message: `HLV ${trainer?.fullName || 'N/A'} đã gửi yêu cầu đặt lịch tập vào ${formattedDate}.`,
                type: "INFO"
            });
            socketService.emitToUser(bookingRequest.memberId, "new_booking_request", bookingRequest);
        } else if (user._id === bookingRequest.memberId) {
            await createNotification({
                userId: bookingRequest.trainerId,
                title: "Yêu cầu đặt lịch mới",
                message: `Hội viên ${member?.fullName || 'N/A'} đã gửi yêu cầu đặt lịch vào ${formattedDate}.`,
                type: "INFO"
            });
            socketService.emitToUser(bookingRequest.trainerId, "new_booking_request", bookingRequest);
        }else {
            await createNotification({
                userId: bookingRequest.trainerId,
                title: "Yêu cầu đặt lịch mới",
                message: `Yêu cầu đặt lịch với hội viên ${member?.fullName || 'N/A'} vào ${formattedDate} đã được tạo.`,
                type: "INFO"
            });
            await createNotification({
                userId: bookingRequest.memberId,
                title: "Yêu cầu đặt lịch mới",
                message: `Yêu cầu đặt lịch với HLV ${trainer?.fullName || 'N/A'} vào ${formattedDate} đã được tạo.`,
                type: "INFO"
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
        // Fetch member and trainer info
        const User = require('../models/User.js').default;
        const member = await User.findById(bookingRequest.memberId).select('fullName');
        const trainer = await User.findById(bookingRequest.trainerId).select('fullName');

        const requestDate = new Date(bookingRequest.requestDateTime);
        const formattedDate = requestDate.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // tạo notification
        if (user._id === bookingRequest.trainerId) {
            await createNotification({
                userId: bookingRequest.memberId,
                title: "Yêu cầu đặt lịch đã cập nhật",
                message: `HLV ${trainer?.fullName || 'N/A'} đã cập nhật yêu cầu đặt lịch vào ${formattedDate}.`,
                type: "INFO"
            });
            socketService.emitToUser(bookingRequest.memberId, "booking_request_updated", bookingRequest);
        } else if (user._id === bookingRequest.memberId) {
            await createNotification({
                userId: bookingRequest.trainerId,
                title: "Yêu cầu đặt lịch đã cập nhật",
                message: `Hội viên ${member?.fullName || 'N/A'} đã cập nhật yêu cầu đặt lịch vào ${formattedDate}.`,
                type: "INFO"
            });
            socketService.emitToUser(bookingRequest.trainerId, "booking_request_updated", bookingRequest);
        } else {
            await createNotification({
                userId: bookingRequest.trainerId,
                title: "Yêu cầu đặt lịch đã được cập nhật",
                message: `Yêu cầu đặt lịch với hội viên ${member?.fullName || 'N/A'} vào ${formattedDate} đã được cập nhật.`,
                type: "INFO",
            });
            
            await createNotification({
                userId: bookingRequest.memberId,
                title: "Yêu cầu đặt lịch đã được cập nhật", 
                message: `Yêu cầu đặt lịch với HLV ${trainer?.fullName || 'N/A'} vào ${formattedDate} đã được cập nhật.`,
                type: "INFO",
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

        // Fetch member and trainer info
        const User = require('../models/User.js').default;
        const member = await User.findById(bookingRequest.memberId).select('fullName');
        const trainer = await User.findById(bookingRequest.trainerId).select('fullName');

        const requestDate = new Date(bookingRequest.requestDateTime);
        const formattedDate = requestDate.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        await createNotification({
            userId: bookingRequest.trainerId,
            title: "Yêu cầu đặt lịch đã bị xóa",
            message: `Yêu cầu đặt lịch với hội viên ${member?.fullName || 'N/A'} vào ${formattedDate} đã bị xóa.`,
            type: "WARNING",
        });
        await createNotification({
            userId: bookingRequest.memberId,
            title: "Yêu cầu đặt lịch đã bị xóa",
            message: `Yêu cầu đặt lịch với HLV ${trainer?.fullName || 'N/A'} vào ${formattedDate} đã bị xóa.`,
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

        // Fetch member and trainer info
        const User = require('../models/User.js').default;
        const member = await User.findById(result.bookingRequest.memberId).select('fullName');
        const trainer = await User.findById(result.bookingRequest.trainerId).select('fullName');

        const requestDate = new Date(result.bookingRequest.requestDateTime);
        const formattedDate = requestDate.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        await createNotification({
            userId: result.bookingRequest.memberId,
            title: "Yêu cầu đặt lịch đã được xác nhận",
            message: `HLV ${trainer?.fullName || 'N/A'} đã xác nhận lịch tập vào ${formattedDate}. Lịch tập đã được tạo thành công.`,
            type: "INFO"
        });
        await createNotification({
            userId: result.bookingRequest.trainerId,
            title: "Yêu cầu đặt lịch đã được xác nhận",
            message: `Bạn đã xác nhận lịch dạy với hội viên ${member?.fullName || 'N/A'} vào ${formattedDate}.`,
            type: "INFO"
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

        // Fetch member and trainer info
        const User = require('../models/User.js').default;
        const member = await User.findById(bookingRequest.memberId).select('fullName');
        const trainer = await User.findById(bookingRequest.trainerId).select('fullName');

        const requestDate = new Date(bookingRequest.requestDateTime);
        const formattedDate = requestDate.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const reasonText = rejectReason ? ` Lý do: ${rejectReason}` : '';

        await createNotification({
            userId: bookingRequest.memberId,
            title: "Yêu cầu đặt lịch bị từ chối",
            message: `HLV ${trainer?.fullName || 'N/A'} đã từ chối yêu cầu đặt lịch vào ${formattedDate}.${reasonText}`,
            type: "WARNING"
        });
        await createNotification({
            userId: bookingRequest.trainerId,
            title: "Yêu cầu đặt lịch bị từ chối",
            message: `Bạn đã từ chối yêu cầu đặt lịch với hội viên ${member?.fullName || 'N/A'} vào ${formattedDate}.`,
            type: "INFO"
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
