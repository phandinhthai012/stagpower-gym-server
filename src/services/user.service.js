import User from "../models/User";
import { paginate } from "../utils/pagination";
import Subscription from '../models/Subscription.js';
export const getAllUsers = async () => {
    const users = await User.find();
    return users;
}

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

export const updateUserProfile = async (userId, updateData) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "USER_NOT_FOUND";
        throw error;
    }
    if (updateData.email) {
        const existingUser = await User.findOne({ email: updateData.email });
        if (existingUser && existingUser._id.toString() !== userId) {
            const error = new Error("Email already exists");
            error.statusCode = 400;
            error.code = "EMAIL_ALREADY_EXISTS";
            throw error;
        }
    }
    // Filter fields theo role của user
    const baseFields = ["fullName", "phone", "gender", "dateOfBirth", "photo", "email", "cccd"];
    let roleSpecificFields = [];

    switch (user.role) {
        case 'member':
            roleSpecificFields = [
                "memberInfo.membership_level",
                "memberInfo.qr_code",
                "memberInfo.health_info_id",
                "memberInfo.notes",
                "memberInfo.is_student",
                "memberInfo.total_spending",
                "memberInfo.membership_month",
                "memberInfo.current_brand_id"
            ];
            break;
        case 'trainer':
            roleSpecificFields = [
                "trainerInfo.specialty",
                "trainerInfo.experience_years",
                "trainerInfo.certificate",
                "trainerInfo.working_hour"
            ];
            break;
        case 'staff':
            roleSpecificFields = [
                "staffInfo.brand_id",
                "staffInfo.position"
            ];
            break;
        case 'admin':
            roleSpecificFields = [
                "adminInfo.permissions",
                "adminInfo.managed_branches"
            ];
            break;
    }

    const allowedFields = [...baseFields, ...roleSpecificFields];

    // Filter chỉ những fields được phép update
    const filteredData = {};
    for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(updateData || {}, key)) {
            filteredData[key] = updateData[key];
        }
    }

    if (Object.keys(filteredData).length === 0) {
        const error = new Error("No valid fields to update");
        error.statusCode = 400;
        error.code = "INVALID_UPDATE_FIELDS";
        throw error;
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: filteredData },
        {
            new: true,
            runValidators: true,
            context: 'query'
        }
    );
    return updatedUser;
}

export const changeStatus = async ({ userId, status }) => {
    const allowed = ["active", "inactive", "pending", "banned"];
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
            { email: { $regex: options.search, $options: 'i' } },
            { phone: { $regex: options.search, $options: 'i' } },
        ];
    }

    // Add status filter if provided
    if (options.status) {
        query.status = options.status;
    }

    return await paginate(User, query, {
        ...options,
        select: '-password -otp', // Exclude sensitive fields
        sort: options.sort || 'createdAt',
        order: options.order || 'desc'
    });
};

export const getAllMembersWithPagination = async (options = {}) => {
    const query = { role: 'member' };

    if (options.search) {
        query.$or = [
            { fullName: { $regex: options.search, $options: 'i' } },
            { email: { $regex: options.search, $options: 'i' } },
            { phone: { $regex: options.search, $options: 'i' } },
        ];
    }

    if (options.status) {
        query.status = options.status;
    }

    if (options.membership_level) {
        query.memberInfo.membership_level = options.membership_level;
    }

    return await paginate(User, query, {
        ...options,
        select: '-password -otp',
        sort: options.sort || 'createdAt',
        order: options.order || 'desc'
    });
};

export const getallStaffsWithPagination = async (options = {}) => {
    const query = {};

    if(options.role) {
        query.role = options.role;
    }else{
        query.role = { $in: ['staff', 'trainer', 'admin'] };
    }
        
    if (options.search) {
        query.$or = [
            { fullName: { $regex: options.search, $options: 'i' } },
            { email: { $regex: options.search, $options: 'i' } },
            { phone: { $regex: options.search, $options: 'i' } },
        ];
    }
    if (options.status) {
        query.status = options.status;
    }
    return await paginate(User, query, {
        ...options,
        select: '-password -otp',
        sort: options.sort || 'createdAt',
        order: options.order || 'desc'
    });
};



export const createUser = async (payload) => {
    const {
        fullName,
        email,
        phone,
        gender,
        dateOfBirth,
        photo,
        password,
        cccd,
        role,
        status = "active",
        memberInfo,
        trainerInfo,
        staffInfo,
        adminInfo
    } = payload;
    if (!fullName || !email || !phone || !password || !role) {
        const error = new Error("Missing required fields");
        error.statusCode = 400;
        error.code = "MISSING_REQUIRED_FIELDS";
        throw error;
    }
    // Check existing user - only check cccd if provided
    const emailCheck = { email };
    const cccdCheck = cccd && cccd.trim() ? { cccd: cccd.trim() } : null;
    const queryConditions = cccdCheck ? [{ email }, cccdCheck] : [{ email }];
    const existingUser = await User.findOne({ $or: queryConditions });
    if (existingUser) {
        if (existingUser.email === email) {
            const error = new Error("Email already exists");
            error.statusCode = 400;
            error.code = "EMAIL_ALREADY_EXISTS";
            throw error;
        }
        if (cccd && cccd.trim() && existingUser.cccd === cccd.trim()) {
            const error = new Error("CCCD already exists");
            error.statusCode = 400;
            error.code = "CCCD_ALREADY_EXISTS";
            throw error;
        }
    }
    const newUserData = {
        fullName,
        email,
        phone,
        gender,
        dateOfBirth,
        photo,
        password,
        cccd: cccd && cccd.trim() ? cccd.trim() : undefined, // Only include cccd if provided
        role,
        status: status || "active"
    };
    switch (role) {
        case 'member':
            newUserData.memberInfo = {
                membership_level: memberInfo?.membership_level || 'basic',
                qr_code: memberInfo?.qr_code || null,
                health_info_id: memberInfo?.health_info_id || null,
                notes: memberInfo?.notes || '',
                is_student: memberInfo?.is_student || false,
                total_spending: memberInfo?.total_spending || 0,
                membership_month: memberInfo?.membership_month || 0,
                current_brand_id: memberInfo?.current_brand_id || null
            };
            break;

        case 'trainer':
            newUserData.trainerInfo = {
                specialty: trainerInfo?.specialty || '',
                experience_years: trainerInfo?.experience_years || 0,
                certificate: trainerInfo?.certificate || [],
                working_hour: trainerInfo?.working_hour || []
            };
            break;

        case 'staff':
            newUserData.staffInfo = {
                brand_id: staffInfo?.brand_id || null,
                position: staffInfo?.position || 'staff'
            };
            break;

        case 'admin':
            newUserData.adminInfo = {
                permissions: adminInfo?.permissions || [],
                managed_branches: adminInfo?.managed_branches || []
            };
            break;

        default:
            const error = new Error("Invalid role");
            error.statusCode = 400;
            error.code = "INVALID_ROLE";
            throw error;
    }
    const newUser = await User.create(newUserData);
    return newUser;
}

// export const deleteUser = async (userId) => {
//     const user = await User.findById(userId);
//     if (!user) {
//         const error = new Error("User not found");
//         error.statusCode = 404;
//         error.code = "USER_NOT_FOUND";
//         throw error;
//     }
//     await User.findByIdAndDelete(userId);
//     return {
//         success: true,
//         userId: userId,
//         role: user.role,
//         status: user.status,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//         message: "User deleted successfully"
//     };
// }

export const getMembersWithActiveSubscriptions = async () => {
    const activeSubscriptions = await Subscription.find({ 
        status: 'Active' 
    }).populate('memberId', 'fullName email phone avatar role status');
    const memberIds = [...new Set(activeSubscriptions.map(sub => sub.memberId._id.toString()))];
    const members = await User.find({
        _id: { $in: memberIds },
        role: 'member',
        status: 'active'
    }).select('-password');
    if(!members) {
        const error = new Error("No members found");
        error.statusCode = 404;
        error.code = "NO_MEMBERS_FOUND";
        throw error;
    }
    return members;
};