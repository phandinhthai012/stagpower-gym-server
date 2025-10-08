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
    } = branchData;
    const store = await Branch.findOne({ name , address });
    if (store) {
        const error = new Error("Branch already exists");
        error.statusCode = 400;
        error.code = "BRANCH_ALREADY_EXISTS";
        throw error;
    }
    const newBranch = await Branch.create({
        name,
        address,
        openTime,
        closeTime,
        status,
        phone,
        email,
    });
    return newBranch;
};

export const getAllBranches = async () => {
    const branches = await Branch.find();
    return branches;
};

export const getBranchById = async (id) => {
    const branch = await Branch.findById(id);
    if (!branch) {
        const error = new Error("Branch not found");
        error.statusCode = 404;
        error.code = "BRANCH_NOT_FOUND";
        throw error;
    }
    return branch;
};

export const updateBranchById = async (id, branchData) => {
    const branch = await Branch.findByIdAndUpdate(id, branchData, { new: true, runValidators: true });
    if (!branch) {
        const error = new Error("Branch not found");
        error.statusCode = 404;
        error.code = "BRANCH_NOT_FOUND";
        throw error;
    }
    return branch;
};

export const deleteBranchById = async (id) => {
    const branch = await Branch.findByIdAndDelete(id);
    if (!branch) {
        const error = new Error("Branch not found");
        error.statusCode = 404;
        error.code = "BRANCH_NOT_FOUND";
        throw error;
    }
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