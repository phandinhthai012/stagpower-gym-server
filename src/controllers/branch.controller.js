import Branch from "../models/Branch";
import {
    createBranch,
    getAllBranches,
    updateBranchById,
    deleteBranchById,
    changeBranchStatus,
    getBranchById,
} from "../services/branch.service.js"

import response from "../utils/response.js";


export const createBranchController = async (req, res, next) => {
    try {
        const {
            name,
            address,
            openTime,
            closeTime,
            status,
            phone,
            email, } = req.body;
        const branch = await createBranch({ name, address, openTime, closeTime, status, phone, email });
        return response(res, {
            success: true,
            statusCode: 201,
            message: "Branch created successfully",
            data: branch
        });
    } catch (error) {
        next(error);
    }
}


export const getAllBranchesController = async (req, res, next) => {
    try {
        const branches = await getAllBranches();
        return response(res, {
            success: true,
            statusCode: 200,
            message: "All branches retrieved successfully",
            data: branches
        });
    }
    catch (error) {
        next(error);
    }
}

export const getPublicBranchesController = async (req, res, next) => {
    try {
        // Only return active branches for public access
        const branches = await Branch.find({ status: 'Active' }).select('name address phone email');
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Active branches retrieved successfully",
            data: branches
        });
    }
    catch (error) {
        next(error);
    }
}

export const getBranchByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const branch = await getBranchById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Branch retrieved successfully",
            data: branch
        });
    }
    catch (error) {
        next(error);
    }
}


export const updateBranchByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, address, openTime, closeTime, status, phone, email } = req.body;
        const branch = await updateBranchById(id, { name, address, openTime, closeTime, status, phone, email });
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Branch updated successfully",
            data: branch
        });
    }
    catch (error) {
        next(error);
    }
}


export const deleteBranchByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteBranchById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Branch deleted successfully",
            data: {
                message: "Branch deleted successfully"
            }
        });
    }
    catch (error) {
        next(error);
    }
}

export const changeBranchStatusController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const branch = await changeBranchStatus(id, status);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Branch status changed successfully",
            data: branch
        });
    } catch (error) {
        next(error);
    }
}