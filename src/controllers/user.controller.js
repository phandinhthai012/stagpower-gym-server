import {
    getUserById,
    updateUserProfile,
    getAllMembers,
    getAllStaffs,
    changeStatus,
    getAllUsersWithPagination,
    createUser,
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

export const updateUserProfileController = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const payload = req.body;
        const user = await updateUserProfile(userId, payload);
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
// bao gồm cả info của từng role
export const updateUserController = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const payload = req.body;
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

export const getAllUsersWithPaginationController = async (req, res, next) => {
    try {
        const { page, limit, sort, order, search, role, status } = req.query;
        const users = await getAllUsersWithPagination({ page, limit, sort, order, search, role, status });
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Users fetched successfully",
            data: users
        });
    } catch (error) {
        return next(error);
    }
}

export const createUserController = async (req, res, next) => {
    try {
        const payload = req.body;
        const user = await createUser(payload);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "User created successfully",
            data: user
        });
    } catch (error) {
        return next(error);
    }
}