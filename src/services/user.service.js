import User from "../models/User";
import { paginate } from "../utils/pagination";

export const getAllMembers = async () => {
    const members = await User.find({ role: "member" });
    return members;
}

// include staff, trainer, admin
export const getAllStaffs = async () => {
    const employees = await User.find({ role: { $in: ["staff", "trainer", "admin"] } });
    return employees;
}


export const getUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "USER_NOT_FOUND";
        throw error;
    }
    return user;
}

// Only allow updating profile fields: fullName, phone, gender, dateOfBirth, photo
export const updateUser = async (userId, payload) => {
    const allowedFields = ["fullName", "phone", "gender", "dateOfBirth", "photo"];
    const setPayload = {};
    for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(payload || {}, key)) {
            setPayload[key] = payload[key];
        }
    }
    if (Object.keys(setPayload).length === 0) {
        const error = new Error("No valid fields to update");
        error.statusCode = 400;
        error.code = "INVALID_UPDATE_FIELDS";
        throw error;
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: setPayload },
        { new: true, runValidators: true }
    );
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "USER_NOT_FOUND";
        throw error;
    }
    return user;
}

export const updateMemberInfo = async (userId, payload) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "USER_NOT_FOUND";
        throw error;
    }
    if (user.role !== "member") {
        const error = new Error("Only member can update memberInfo");
        error.statusCode = 400;
        error.code = "ROLE_MISMATCH";
        throw error;
    }

    const allowed = [
        "membership_level",
        "qr_code",
        "health_info_id",
        "notes",
        "is_student",
        "total_spending",
        "membership_month",
        "current_brand_id"
    ];
    const setPayload = {};
    for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(payload || {}, key)) {
            setPayload[`memberInfo.${key}`] = payload[key];
        }
    }
    if (Object.keys(setPayload).length === 0) {
        const error = new Error("No valid memberInfo fields to update");
        error.statusCode = 400;
        error.code = "INVALID_UPDATE_FIELDS";
        throw error;
    }

    const updated = await User.findByIdAndUpdate(
        userId,
        { $set: setPayload },
        { new: true, runValidators: true }
    );
    return updated;
}

export const updateTrainerInfo = async (userId, payload) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "USER_NOT_FOUND";
        throw error;
    }
    if (user.role !== "trainer") {
        const error = new Error("Only trainer can update trainerInfo");
        error.statusCode = 400;
        error.code = "ROLE_MISMATCH";
        throw error;
    }

    const allowed = ["specialty", "experience_years", "certificate", "working_hour"];
    const setPayload = {};
    for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(payload || {}, key)) {
            setPayload[`trainerInfo.${key}`] = payload[key];
        }
    }
    if (Object.keys(setPayload).length === 0) {
        const error = new Error("No valid trainerInfo fields to update");
        error.statusCode = 400;
        error.code = "INVALID_UPDATE_FIELDS";
        throw error;
    }

    const updated = await User.findByIdAndUpdate(
        userId,
        { $set: setPayload },
        { new: true, runValidators: true }
    );
    return updated;
}

export const changeStatus = async ({ userId, status }) => {
    const allowed = ["active", "inactive", "pending", "Banned"];
    if (!allowed.includes(status)) {
        const error = new Error("Invalid status value");
        error.statusCode = 400;
        error.code = "INVALID_STATUS";
        throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "USER_NOT_FOUND";
        throw error;
    }
    if (user.status === status) {
        return user;
    }

    const updated = await User.findByIdAndUpdate(
        userId,
        { $set: { status } },
        { new: true, runValidators: true }
    );
    return updated;
}
export const searchUsers = async (query) => {
    // const { fullName, phone, email, status } = query;
    // const searchQuery = {};
    // if (fullName) {
    //     searchQuery.fullName = { $regex: fullName, $options: "i" };
    // }
    // if (phone) {
    //     searchQuery.phone = { $regex: phone, $options: "i" };
    // }
    // if (email) {
    //     searchQuery.email = { $regex: email, $options: "i" };
    // }
    // if (status) {
    //     searchQuery.status = status;
    // }
    // const users = await User.find(searchQuery).select("-password -otp");
    // return users;
}

export const getAllUsersWithPagination = async (options = {}) => {
    const query = {};
    
    // Add role filter if provided
    if (options.role) {
        query.role = options.role;
    }
    
    // Add search if provided
    if (options.search) {
        query.$or = [
            { fullName: { $regex: options.search, $options: 'i' } },
            { email: { $regex: options.search, $options: 'i' } }
        ];
    }
    
    // Add status filter if provided
    if (options.status) {
        query.isActive = options.status === 'active';
    }
    
    return await paginate(User, query, {
        ...options,
        select: '-password -otp', // Exclude sensitive fields
        sort: options.sort || 'createdAt',
        order: options.order || 'desc'
    });
};