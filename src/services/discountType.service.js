import DiscountType from '../models/DiscountType.js';
import Discount from '../models/Discount.js';
export const getAllDiscountTypes = async () => {
    return await DiscountType.find({ status: 'Active' }).sort({ name: 1 });
};

export const createDiscountType = async (data) => {
    const discountType = await DiscountType.create({
        ...data,
        name: data.name?.toUpperCase().trim(),
        status: 'Active'
    });
    return discountType;
};

export const getDiscountTypeById = async (id) => {
    const discountType = await DiscountType.findById(id);
    if (!discountType) {
        const error = new Error('Discount type not found');
        error.statusCode = 404;
        error.code = 'DISCOUNT_TYPE_NOT_FOUND';
        throw error;
    }
    return discountType;
};

export const updateDiscountType = async (id, data) => {
    // Nếu đang update name, kiểm tra xem có discount nào đang dùng name cũ không
    if (data.name) {
        const oldType = await DiscountType.findById(id);
        if (oldType && oldType.name !== data.name.toUpperCase().trim()) {
            const count = await Discount.countDocuments({ type: oldType.name });
            if (count > 0) {
                const error = new Error('Cannot change discount type name. There are discounts using this type.');
                error.statusCode = 400;
                error.code = 'DISCOUNT_TYPE_IN_USE';
                throw error;
            }
        }
    }

    const discountType = await DiscountType.findByIdAndUpdate(
        id, 
        { ...data, name: data.name?.toUpperCase().trim() }, 
        { new: true, runValidators: true }
    );
    if (!discountType) {
        const error = new Error('Discount type not found');
        error.statusCode = 404;
        error.code = 'DISCOUNT_TYPE_NOT_FOUND';
        throw error;
    }
    return discountType;
};

export const deleteDiscountType = async (id) => {
    const discountType = await DiscountType.findById(id);
    if (!discountType) {
        const error = new Error('Discount type not found');
        error.statusCode = 404;
        error.code = 'DISCOUNT_TYPE_NOT_FOUND';
        throw error;
    }

    // Kiểm tra xem có discount nào đang dùng type này không
    const count = await Discount.countDocuments({ type: discountType.name });
    if (count > 0) {
        const error = new Error('Cannot delete discount type that is in use');
        error.statusCode = 400;
        error.code = 'DISCOUNT_TYPE_IN_USE';
        throw error;
    }

    await DiscountType.findByIdAndDelete(id);
    return { message: 'Discount type deleted successfully' };
};