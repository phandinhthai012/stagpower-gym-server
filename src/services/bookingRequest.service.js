import BookingRequest from "../models/BookingRequest";
import User from "../models/User";
import Subscription from "../models/Subscription";
import Schedule from "../models/Schedule";
import { createSchedule } from "./schedule.service.js";
import { paginate } from "../utils/pagination";

// cần chỉnh sửa lại để hợp lí hơn,
export const createBookingRequest = async (bookingRequestData) => {
    const {
        memberId,
        trainerId,
        subscriptionId,
        requestDateTime,
        duration,
        notes
    } = bookingRequestData;

    // Kiểm tra member tồn tại và có role member
    const member = await User.findById(memberId);
    if (!member || member.role !== 'member') {
        const error = new Error("Invalid member");
        error.statusCode = 400;
        error.code = "INVALID_MEMBER";
        throw error;
    }

    // Kiểm tra trainer tồn tại và có role trainer
    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== 'trainer') {
        const error = new Error("Invalid trainer");
        error.statusCode = 400;
        error.code = "INVALID_TRAINER";
        throw error;
    }

    // Kiểm tra subscription tồn tại và thuộc về member
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription || subscription.memberId.toString() !== memberId) {
        const error = new Error("Invalid subscription");
        error.statusCode = 400;
        error.code = "INVALID_SUBSCRIPTION";
        throw error;
    }

    // Kiểm tra subscription còn active và có PT sessions
    if (subscription.status !== 'Active' || subscription.remainingPtSessions <= 0) {
        const error = new Error("Subscription not active or no PT sessions remaining");
        error.statusCode = 400;
        error.code = "SUBSCRIPTION_INVALID";
        throw error;
    }

    // Chuyển đổi requestDateTime thành Date object
    const requestDate = new Date(requestDateTime);

    // Kiểm tra thời gian không được trong quá khứ
    if (requestDate < new Date()) {
        const error = new Error("Request date time cannot be in the past");
        error.statusCode = 400;
        error.code = "INVALID_DATETIME";
        throw error;
    }

    // Kiểm tra duration hợp lệ (30-120 phút)
    if (duration < 30 || duration > 150) {
        const error = new Error("Duration must be between 30 and 150 minutes");
        error.statusCode = 400;
        error.code = "INVALID_DURATION";
        throw error;
    }

    // Kiểm tra trainer có conflict với booking khác không
    const startTime = new Date(requestDate.getTime());
    const endTime = new Date(requestDate.getTime() + duration * 60000);
    const existingBooking = await BookingRequest.findOne({
        trainerId,
        status: { $in: ['Pending', 'Confirmed'] },
        $or: [
            {
                requestDateTime: { $gte: startTime, $lte: endTime }
            },
            {
                requestDateTime: {
                    $gte: new Date(startTime.getTime() - duration * 60000),
                    $lte: startTime
                }
            }
        ]
    });

    if (existingBooking) {
        const error = new Error("Trainer is not available at this time");
        error.statusCode = 400;
        error.code = "TRAINER_NOT_AVAILABLE";
        throw error;
    }

    const bookingRequest = await BookingRequest.create({
        memberId,
        trainerId,
        subscriptionId,
        requestDateTime: requestDate,
        duration,
        notes,
        status: 'Pending'
    });

    return bookingRequest;
};

export const getAllBookingRequests = async () => {
    const bookingRequests = await BookingRequest.find();
    return bookingRequests;
};

export const getBookingRequestById = async (id) => {
    const bookingRequest = await BookingRequest.findById(id);
    if (!bookingRequest) {
        const error = new Error("Booking request not found");
        error.statusCode = 404;
        error.code = "BOOKING_REQUEST_NOT_FOUND";
        throw error;
    }
    return bookingRequest;
};



export const deleteBookingRequestById = async (id) => {
    const bookingRequest = await BookingRequest.findByIdAndDelete(id);
    if (!bookingRequest) {
        const error = new Error("Booking request not found");
        error.statusCode = 404;
        error.code = "BOOKING_REQUEST_NOT_FOUND";
        throw error;
    }
    return bookingRequest;
};

export const getBookingRequestsByMember = async (memberId) => {
    const bookingRequests = await BookingRequest.findByMember(memberId);
    return bookingRequests;
};

export const getBookingRequestsByTrainer = async (trainerId) => {
    const bookingRequests = await BookingRequest.findByTrainer(trainerId);
    return bookingRequests;
};

export const getBookingRequestByStatus = async (status) => {
    const bookingRequests = await BookingRequest.find({ status });
    return bookingRequests;
};

const checkBookingRequest = async (bookingRequestData) => {
    const {
        memberId,
        trainerId,
        subscriptionId,
        requestDateTime,
        duration,
        notes
    } = bookingRequestData;
    const requestDate = new Date(requestDateTime);
    const startTime = new Date(requestDate.getTime() - duration * 60000);
    const endTime = new Date(requestDate.getTime() + duration * 60000);
    const existingBooking = await BookingRequest.findOne({
        trainerId,
        requestDateTime: {
            $gte: startTime,
            $lte: endTime
        },
        status: { $in: ['Pending', 'Confirmed'] }
    });
    return !!existingBooking;
}

export const updateBookingRequestById = async (id, bookingRequestData) => {
    const bookingRequest = await BookingRequest.findByIdAndUpdate(id, bookingRequestData, { new: true, runValidators: true });
    if (!bookingRequest) {
        const error = new Error("Booking request not found");
        error.statusCode = 404;
        error.code = "BOOKING_REQUEST_NOT_FOUND";
        throw error;
    }
    return bookingRequest;
}

export const confirmBookingRequest = async (id) => {
    const bookingRequest = await BookingRequest.findById(id);
    if (!bookingRequest) {
        const error = new Error("Booking request not found");
        error.statusCode = 404;
        error.code = "BOOKING_REQUEST_NOT_FOUND";
        throw error;
    }

    // Kiểm tra booking request chưa được confirm
    if (bookingRequest.status === 'Confirmed') {
        const error = new Error("Booking request already confirmed");
        error.statusCode = 400;
        error.code = "BOOKING_REQUEST_ALREADY_CONFIRMED";
        throw error;
    }

    // Cập nhật status thành Confirmed
    bookingRequest.status = 'Confirmed';
    await bookingRequest.save();

    // Kiểm tra xem đã có schedule cho booking request này chưa
    const existingSchedule = await Schedule.findOne({
        memberId: bookingRequest.memberId,
        trainerId: bookingRequest.trainerId,
        dateTime: bookingRequest.requestDateTime,
        status: { $in: ['Confirmed', 'Completed'] }
    });

    if (existingSchedule) {
        const error = new Error("Schedule already exists for this booking request");
        error.statusCode = 400;
        error.code = "SCHEDULE_ALREADY_EXISTS";
        throw error;
    }

    // Lấy thông tin subscription để xác định branch
    const subscription = await Subscription.findById(bookingRequest.subscriptionId);
    if (!subscription) {
        const error = new Error("Subscription not found");
        error.statusCode = 404;
        error.code = "SUBSCRIPTION_NOT_FOUND";
        throw error;
    }

    // Tự động tạo schedule từ booking request
    const scheduleData = {
        memberId: bookingRequest.memberId,
        trainerId: bookingRequest.trainerId,
        subscriptionId: bookingRequest.subscriptionId,
        branchId: subscription.branchId, // Sử dụng branchId từ subscription
        dateTime: bookingRequest.requestDateTime,
        durationMinutes: bookingRequest.duration,
        notes: bookingRequest.notes,
        assignedExercises: []
    };

    const schedule = await createSchedule(scheduleData);

    return {
        bookingRequest,
        schedule
    };
}

export const rejectBookingRequest = async (id, rejectReason) => {
    const bookingRequest = await BookingRequest.findByIdAndUpdate(id, {
        status: 'Rejected',
        rejectReason: rejectReason
    }, { new: true });
    if (!bookingRequest) {
        const error = new Error("Booking request not found");
        error.statusCode = 404;
        error.code = "BOOKING_REQUEST_NOT_FOUND";
        throw error;
    }
    return bookingRequest;
}


export const getAllBookingRequestsWithPagination = async (options) => {
    const bookingRequests = await paginate(BookingRequest, {}, options);
    return bookingRequests;
}

