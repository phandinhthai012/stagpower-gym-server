import {
    getAllDiscountTypes,
    createDiscountType,
    getDiscountTypeById,
    updateDiscountType,
    deleteDiscountType
} from '../services/discountType.service.js';
import response from '../utils/response.js';

export const getAllDiscountTypesController = async (req, res, next) => {
    try {
        const discountTypes = await getAllDiscountTypes();
        return response(res, {
            success: true,
            statusCode: 200,
            message: 'Discount types fetched successfully',
            data: discountTypes
        });
    } catch (error) {
        next(error);
    }
};

export const createDiscountTypeController = async (req, res, next) => {
    try {
        const { name, displayName, description,status } = req.body;
        const discountType = await createDiscountType({
            name,
            displayName,
            description,
            status: status || 'Active'
        });
        return response(res, {
            success: true,
            statusCode: 201,
            message: 'Discount type created successfully',
            data: discountType
        });
    } catch (error) {
        next(error);
    }
};

export const getDiscountTypeByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const discountType = await getDiscountTypeById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: 'Discount type fetched successfully',
            data: discountType
        });
    } catch (error) {
        next(error);
    }
};

export const updateDiscountTypeController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, displayName, description,status } = req.body;
        const discountType = await updateDiscountType(id, {
            name,
            displayName,
            description,
            status: status || 'Active'
        });
        return response(res, {
            success: true,
            statusCode: 200,
            message: 'Discount type updated successfully',
            data: discountType
        });
    } catch (error) {
        next(error);
    }
};

export const deleteDiscountTypeController = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteDiscountType(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: 'Discount type deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};