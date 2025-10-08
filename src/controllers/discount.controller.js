import {
    getAllDiscounts,
    createDiscount,
    getDiscountById,
    updateDiscountById,
    changeDiscountStatus,
    deleteDiscountById

} from "../services/discount.service.js"

import response from "../utils/response.js"


export const getAllDiscountsController = async (req, res, next) => {
    try {
        const discounts = await getAllDiscounts();
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Discounts fetched successfully",
            data: discounts
        });
    }
    catch (error) {
        next(error);
    }
}

export const createDiscountController = async (req, res, next) => {
    try {
        const {
            name,
            type,
            discountPercentage,
            discountAmount,
            maxDiscount,
            bonusDays,
            conditions,
            durationTypes,
            packageTypes,
            startDate,
            endDate,
            status
        } = req.body;
        const discount = await createDiscount({
            name,
            type,
            discountPercentage,
            discountAmount,
            maxDiscount,
            bonusDays,
            conditions,
            durationTypes,
            packageTypes,
            startDate,
            endDate,
            status
        });
        return response(res, {
            success: true,
            statusCode: 201,
            message: "Discount created successfully",
            data: discount
        });
    } catch (error) {
        next(error);
    }
}

export const getDiscountByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const discount = await getDiscountById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Discount fetched successfully",
            data: discount
        });
    } catch (error) {
        next(error);
    }
}

export const updateDiscountByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            name,
            type,
            discountPercentage,
            discountAmount,
            maxDiscount,
            bonusDays,
            conditions,
            durationTypes,
            packageTypes,
            startDate,
            endDate,
            status
        } = req.body;
        const discount = await updateDiscountById(id, {
            name,
            type,
            discountPercentage,
            discountAmount,
            maxDiscount,
            bonusDays,
            conditions,
            durationTypes,
            packageTypes,
            startDate,
            endDate,
            status
        })
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Discount updated successfully",
            data: discount
        });
    } catch (error) {
        next(error);
    }
}

export const changeDiscountStatusController = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {status} = req.body;
        const discount = await changeDiscountStatus(id, status);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Discount status changed successfully",
            data: discount
        });
    } catch (error) {
        next(error);
    }
}

export const deleteDiscountByIdController = async (req, res, next) => {
    try {
        const {id} = req.params;
        const discount = await deleteDiscountById(id);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Discount deleted successfully",
            data: {
                message: "Discount deleted successfully"
            }
        });
    } catch (error) {
        next(error);
    }
}