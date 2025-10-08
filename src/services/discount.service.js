import Discount from "../models/Discount";


export const createDiscount = async (discountData) => {
    const discount = await Discount.create(discountData);
    return discount;
};

export const getAllDiscounts = async () => {
    const discounts = await Discount.find();
    return discounts;
};

export const getDiscountById = async (id) => {
    const discount = await Discount.findById(id);
    if(!discount){
        const error = new Error("Discount not found");
        error.statusCode = 404;
        error.code = "DISCOUNT_NOT_FOUND";
        throw error;
    }
    return discount;
}

export const updateDiscountById = async (id, discountNewData) => {
    const discount = await Discount.findByIdAndUpdate(id, discountNewData, { new: true, runValidators: true });
    if(!discount){
        const error = new Error("Discount not found");
        error.statusCode = 404;
        error.code = "DISCOUNT_NOT_FOUND";
        throw error;
    }
    return discount;
}

export const changeDiscountStatus = async (id, status) => {
    const discount = await Discount.findByIdAndUpdate(id,{status},{new:true,runValidators:true});
    if(!discount){
        const error = new Error("Discount not found");
        error.statusCode = 404;
        error.code = "DISCOUNT_NOT_FOUND";
        throw error;
    }
    return discount;
}

export const deleteDiscountById = async (id) => {
    const discount = await Discount.findByIdAndDelete(id);
    if(!discount){
        const error = new Error("Discount not found");
        error.statusCode = 404;
        error.code = "DISCOUNT_NOT_FOUND";
        throw error;
    }
    return discount;
}