import {
    getAllDiscounts,
    createDiscount,
    getDiscountById,
    updateDiscountById,
    changeDiscountStatus,
    deleteDiscountById,
    applyDiscountManual,
    getAvailableDiscounts,
    validateDiscountCode

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
            code, 
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
            code,
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
            code,
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
            code,
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

// for member
export const validateDiscountCodeController = async (req, res, next) => {
    try {
        const { code, memberId, packageId, originalAmount, packageType, packageCategory } = req.body;
        if (!code) {
            return response(res, {
                success: false,
                statusCode: 400,
                message: "Discount code is required"
            });
        }
        const result = await validateDiscountCode({
            code,
            memberId,
            packageId,
            originalAmount,
            packageType,
            packageCategory
        });
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Discount validated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
}

// for admin
export const getAvailableDiscountsController = async (req, res, next) => {
    try {
        const { packageType, packageCategory, memberId } = req.query;
        
        const discounts = await getAvailableDiscounts({
            packageType,
            packageCategory,
            memberId
        });

        return response(res, {
            success: true,
            statusCode: 200,
            message: "Available discounts fetched successfully",
            data: discounts
        });
    } catch (error) {
        next(error);
    }
};

export const applyDiscountManualController = async (req, res, next) => {
    try {
        const { discountId, originalAmount } = req.body;

        if (!discountId || !originalAmount) {
            return response(res, {
                success: false,
                statusCode: 400,
                message: "discountId and originalAmount are required"
            });
        }

        const result = await applyDiscountManual(discountId, originalAmount);

        return response(res, {
            success: true,
            statusCode: 200,
            message: "Discount applied successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};