import{
    createCheckIn,
    getAllCheckIns,
    getCheckInById,
    updateCheckInById,
    getCheckInByMemberId,
    getCheckInByCheckInTime,
    checkOutCheckIn,
    getAllCheckInsWithPagination,
    generateQRCodeCheckIn,
    processQRCodeCheckIn
} from "../services/checkIn.service.js";


import response from "../utils/response.js";


export const createCheckInController = async (req, res, next) => {
    try {
        const {
            memberId,
            branchId,
            method,
        } = req.body;
        const checkIn = await createCheckIn({
            memberId,
            branchId,
            method: method || 'Manual',
            checkInTime: new Date()
        });
        return response(res, {
            success: true,
            statusCode: 201,
            message: "CheckIn created successfully",
            data: checkIn
        });
    } catch (error) {
        next(error);
    }
};

export const getAllCheckInsController = async (req, res, next) => {
    try {
        const checkIns = await getAllCheckIns();
        return response(res, {
            success: true,
            statusCode: 200,
            message: "CheckIns fetched successfully",
            data: checkIns
        });
    } catch (error) {
        next(error);
    }
};

export const getCheckInByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const checkIn = await getCheckInById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "CheckIn fetched successfully",
            data: checkIn
        });
    } catch (error) {
        next(error);
    }
};

export const updateCheckInByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            memberId,
            checkInTime,
            checkOutTime,
            duration,
            status,
            notes,
            validationError,    
            checkInMethod,
        } = req.body;
        const checkIn = await updateCheckInById(id, req.body);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "CheckIn updated successfully",
            data: checkIn
        });
    } catch (error) {
        next(error);
    }
};


export const getCheckInByMemberIdController = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const checkIn = await getCheckInByMemberId(memberId);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "CheckIn fetched successfully",
            data: checkIn
        });
    } catch (error) {
        next(error);
    }
};

export const getCheckInByCheckInTimeController = async (req, res, next) => {
    try {
        const { checkInTime } = req.params;
        const checkIn = await getCheckInByCheckInTime(checkInTime);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "CheckIn fetched successfully",
            data: checkIn
        });
    } catch (error) {
        next(error);
    }
};

export const checkOutCheckInController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const checkIn = await checkOutCheckIn(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "CheckIn checked out successfully",
            data: checkIn
        });
    } catch (error) {
        next(error);
    }
};

export const getAllCheckInsWithPaginationController = async (req, res, next) => {
    try {
        const { page, limit, order } = req.query;
        const checkIns = await getAllCheckInsWithPagination({ page, limit, order });
        return response(res, {
            success: true,
            statusCode: 200,
            message: "CheckIns fetched successfully",
            data: checkIns
        });
    } catch (error) {
        next(error);
    }
};

export const generateQRCodeCheckInController = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const qrCode = await generateQRCodeCheckIn({ memberId });
        return response(res, {
            success: true,
            statusCode: 200,
            message: "QR Code generated successfully",
            data: qrCode
        });
    } catch (error) {
        next(error);
    }
};

export const processQRCodeCheckInController = async (req, res, next) => {
    try {
        const { token, branchId } = req.body;
        const checkIn = await processQRCodeCheckIn({ token, branchId });
        return response(res, {
            success: true,
            statusCode: 200,
            message: "CheckIn processed successfully",
            data: checkIn
        });
    } catch (error) {
        next(error);
    }
};