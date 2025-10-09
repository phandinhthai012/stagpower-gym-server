import {
    getUserById,
    updateUser,
    updateUserProfile,
    getAllMembers,
    getAllStaffs,
    changeStatus,
    getAllUsersWithPagination,
    createUser,
    createMember,
    createTrainer,
    createStaff,
    createAdmin,
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

export const createMemberController = async (req, res, next) => {
    try {
        const { 
            fullName, 
            email, 
            phone, 
            gender, 
            dateOfBirth, 
            photo, 
            status,
            memberInfo 
        } = req.body;
        
        const payload = { 
            fullName, 
            email, 
            phone, 
            gender, 
            dateOfBirth, 
            photo, 
            status: status || "active",
            memberInfo 
        };
        const user = await createMember(payload);
        return response(res, {
            success: true,
            statusCode: 201,
            message: "Member created successfully",
            data: user
        });
    } catch (error) {
        return next(error);
    }
}
// Controller riêng cho từng role
export const createTrainerController = async (req, res, next) => {
    try {
        const { 
            fullName, 
            email, 
            phone, 
            gender, 
            dateOfBirth, 
            photo, 
            status,
            trainerInfo 
        } = req.body;
        
        const payload = { 
            fullName, 
            email, 
            phone, 
            gender, 
            dateOfBirth, 
            photo, 
            status: status || "active",
            trainerInfo 
        };
        const user = await createTrainer(payload);
        return response(res, {
            success: true,
            statusCode: 201,
            message: "Trainer created successfully",
            data: user
        });
    } catch (error) {
        return next(error);
    }
}

export const createStaffController = async (req, res, next) => {
    try {
        const { 
            fullName, 
            email, 
            phone, 
            gender, 
            dateOfBirth, 
            photo, 
            status,
            staffInfo 
        } = req.body;
        
        const payload = { 
            fullName, 
            email, 
            phone, 
            gender, 
            dateOfBirth, 
            photo, 
            status: status || "active",
            staffInfo 
        };
        const user = await createStaff(payload);
        return response(res, {
            success: true,
            statusCode: 201,
            message: "Staff created successfully",
            data: user
        });
    } catch (error) {
        return next(error);
    }
}

export const createAdminController = async (req, res, next) => {
    try {
        const { 
            fullName, 
            email, 
            phone, 
            gender, 
            dateOfBirth, 
            photo, 
            status,
            adminInfo 
        } = req.body;
        
        const payload = { 
            fullName, 
            email, 
            phone, 
            gender, 
            dateOfBirth, 
            photo, 
            status: status || "active",
            adminInfo 
        };
        const user = await createAdmin(payload);
        return response(res, {
            success: true,
            statusCode: 201,
            message: "Admin created successfully",
            data: user
        });
    } catch (error) {
        return next(error);
    }
}