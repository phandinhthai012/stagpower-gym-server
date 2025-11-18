import Branch from "../models/Branch";

export const createBranch = async (branchData) => {
    const {
        name,
        address,
        openTime,
        closeTime,
        status,
        phone,
        email,
        adminId,
    } = branchData;
    const store = await Branch.findOne({ name , address });
    if (store) {
        const error = new Error("Branch already exists");
        error.statusCode = 400;
        error.code = "BRANCH_ALREADY_EXISTS";
        throw error;
    }
    
    // Nếu có adminId, kiểm tra admin có tồn tại và có role admin không
    if (adminId) {
        const User = (await import("../models/User.js")).default;
        const admin = await User.findById(adminId);
        if (!admin || admin.role !== 'admin') {
            const error = new Error("Invalid admin ID or user is not an admin");
            error.statusCode = 400;
            error.code = "INVALID_ADMIN";
            throw error;
        }
        // Kiểm tra admin đã được gán cho branch khác chưa
        const existingBranch = await Branch.findOne({ adminId });
        if (existingBranch) {
            const error = new Error("Admin is already assigned to another branch");
            error.statusCode = 400;
            error.code = "ADMIN_ALREADY_ASSIGNED";
            throw error;
        }
    }
    
    const newBranch = await Branch.create({
        name,
        address,
        openTime,
        closeTime,
        status,
        phone,
        email,
        adminId: adminId || null,
    });
    
    // Nếu có adminId, cập nhật adminInfo.branchId của admin
    if (adminId) {
        const User = (await import("../models/User.js")).default;
        await User.findByIdAndUpdate(adminId, {
            'adminInfo.branchId': newBranch._id
        });
    }
    
    return await Branch.findById(newBranch._id).populate('adminId', 'fullName email phone role');
};

export const getAllBranches = async () => {
    const branches = await Branch.find().populate('adminId', 'fullName email phone');
    return branches;
};

export const getBranchById = async (id) => {
    const branch = await Branch.findById(id).populate('adminId', 'fullName email phone role');
    if (!branch) {
        const error = new Error("Branch not found");
        error.statusCode = 404;
        error.code = "BRANCH_NOT_FOUND";
        throw error;
    }
    return branch;
};

export const updateBranchById = async (id, branchData) => {
    const { adminId, ...otherData } = branchData;
    const User = (await import("../models/User.js")).default;
    
    // Lấy branch hiện tại để kiểm tra adminId cũ
    const currentBranch = await Branch.findById(id);
    if (!currentBranch) {
        const error = new Error("Branch not found");
        error.statusCode = 404;
        error.code = "BRANCH_NOT_FOUND";
        throw error;
    }
    
    // Nếu có adminId mới, kiểm tra và cập nhật
    if (adminId !== undefined) {
        if (adminId) {
            // Kiểm tra admin có tồn tại và có role admin không
            const admin = await User.findById(adminId);
            if (!admin || admin.role !== 'admin') {
                const error = new Error("Invalid admin ID or user is not an admin");
                error.statusCode = 400;
                error.code = "INVALID_ADMIN";
                throw error;
            }
            // Kiểm tra admin đã được gán cho branch khác chưa (trừ branch hiện tại)
            const existingBranch = await Branch.findOne({ adminId, _id: { $ne: id } });
            if (existingBranch) {
                const error = new Error("Admin is already assigned to another branch");
                error.statusCode = 400;
                error.code = "ADMIN_ALREADY_ASSIGNED";
                throw error;
            }
        }
        
        // Xóa branchId khỏi admin cũ (nếu có)
        if (currentBranch.adminId) {
            await User.findByIdAndUpdate(currentBranch.adminId, {
                $unset: { 'adminInfo.branchId': '' }
            });
        }
        
        // Gán branchId cho admin mới (nếu có)
        if (adminId) {
            await User.findByIdAndUpdate(adminId, {
                'adminInfo.branchId': id
            });
        }
    }
    
    const updateData = { ...otherData };
    if (adminId !== undefined) {
        updateData.adminId = adminId || null;
    }
    
    const branch = await Branch.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .populate('adminId', 'fullName email phone role');
    return branch;
};

export const deleteBranchById = async (id) => {
    const branch = await Branch.findById(id);
    if (!branch) {
        const error = new Error("Branch not found");
        error.statusCode = 404;
        error.code = "BRANCH_NOT_FOUND";
        throw error;
    }
    
    // Xóa branchId khỏi admin nếu có
    if (branch.adminId) {
        const User = (await import("../models/User.js")).default;
        await User.findByIdAndUpdate(branch.adminId, {
            $unset: { 'adminInfo.branchId': '' }
        });
    }
    
    // Xóa branch
    await Branch.findByIdAndDelete(id);
    return branch;
};


export const changeBranchStatus = async (id, status) => {
    const branch = await Branch.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!branch) {
        const error = new Error("Branch not found");
        error.statusCode = 404;
        error.code = "BRANCH_NOT_FOUND";
        throw error;
    }
    return branch;
};