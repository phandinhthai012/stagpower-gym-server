import {
    getUserById,
    updateUser,
    getAllMembers,
    getAllStaffs,
    changeStatus
} from "../services/user.service";
import response from "../utils/response";


export const getAllMembersController = async (req, res, next) => {
    try {
        const members = await getAllMembers();
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Members fetched successfully",
            data: members
        });
    } catch (error) {
        return next(error);
    }
}

export const getAllStaffsController = async (req, res, next) => {
    try {
        const staffs = await getAllStaffs();
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Staffs fetched successfully",
            data: staffs
        });
    } catch (error) {
        return next(error);
    }
}


export const getUserByIdController = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await getUserById(userId);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "User fetched successfully",
            data: user
        });
    } catch (error) {
        return next(error);
    }

}

export const updateMyProfileController = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { fullName, phone, gender, dateOfBirth, photo } = req.body;
        const payload = { fullName, phone, gender, dateOfBirth, photo };
        const user = await updateUser(userId, payload);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "User updated successfully",
            data: user
        });
    } catch (error) {
        return next(error);
    }
}

export const changeStatusController = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { status } = req.body || {};
        const updated = await changeStatus({ userId, status });
        return response(res, {
            success: true,
            statusCode: 200,
            message: "User status updated successfully",    
            data: updated
        });
    } catch (error) {
        return next(error);
    }
}
