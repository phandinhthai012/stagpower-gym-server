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

const calculateDiscountAmount = (discount, originalAmount) => {
    let discountAmount = 0;

    if (discount.discountPercentage) {
        // Tính theo phần trăm
        discountAmount = (originalAmount * discount.discountPercentage) / 100;
        
        // Áp dụng maxDiscount nếu có
        if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
            discountAmount = discount.maxDiscount;
        }
    } else if (discount.discountAmount) {
        // Tính theo số tiền cố định
        discountAmount = discount.discountAmount;
        
        // Không được vượt quá originalAmount
        if (discountAmount > originalAmount) {
            discountAmount = originalAmount;
        }
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return {
        discountAmount,
        finalAmount
    };
};

// 1. Validate discount code (cho Member)
export const validateDiscountCode = async (data) => {
    const { code, memberId, packageId, originalAmount, packageType, packageCategory } = data;

    // ========== NEW: Tự động lấy packageType và packageCategory từ packageId nếu chưa có ==========
    let finalPackageType = packageType;
    let finalPackageCategory = packageCategory;
    
    if (!finalPackageType || !finalPackageCategory) {
        const Package = (await import("../models/Package.js")).default;
        const packageInfo = await Package.findById(packageId);
        if (packageInfo) {
            if (!finalPackageType) {
                finalPackageType = packageInfo.type; // Membership, Combo, PT
            }
            if (!finalPackageCategory) {
                finalPackageCategory = packageInfo.packageCategory; // ShortTerm, MediumTerm, LongTerm, Trial
            }
        }
    }

    // Tìm discount theo code
    const discount = await Discount.findByCode(code);
    if (!discount) {
        const error = new Error('Mã giảm giá không tồn tại');
        error.statusCode = 404;
        error.code = 'DISCOUNT_NOT_FOUND';
        throw error;
    }

    // Kiểm tra status
    if (discount.status !== 'Active') {
        const error = new Error('Mã giảm giá đã bị vô hiệu hóa');
        error.statusCode = 400;
        error.code = 'DISCOUNT_INACTIVE';
        throw error;
    }

    // Kiểm tra thời gian hiệu lực
    const now = new Date();
    if (now < discount.startDate) {
        const error = new Error('Mã giảm giá chưa có hiệu lực');
        error.statusCode = 400;
        error.code = 'DISCOUNT_NOT_STARTED';
        throw error;
    }
    if (now > discount.endDate) {
        const error = new Error('Mã giảm giá đã hết hạn');
        error.statusCode = 400;
        error.code = 'DISCOUNT_EXPIRED';
        throw error;
    }

    // Kiểm tra số lần sử dụng
    if (discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) {
        const error = new Error('Mã giảm giá đã hết lượt sử dụng');
        error.statusCode = 400;
        error.code = 'DISCOUNT_USAGE_LIMIT_EXCEEDED';
        throw error;
    }

    // Kiểm tra packageType
    if (discount.packageTypes && discount.packageTypes.length > 0) {
        if (!finalPackageType || !discount.packageTypes.includes(finalPackageType)) {
            const error = new Error('Mã này không áp dụng cho loại gói này');
            error.statusCode = 400;
            error.code = 'DISCOUNT_INVALID_PACKAGE_TYPE';
            throw error;
        }
    }

    // Kiểm tra durationType (nếu có)
    if (discount.durationTypes && discount.durationTypes.length > 0 && finalPackageCategory) {
        if (!discount.durationTypes.includes(finalPackageCategory)) {
            const error = new Error('Mã này không áp dụng cho gói này');
            error.statusCode = 400;
            error.code = 'DISCOUNT_INVALID_DURATION_TYPE';
            throw error;
        }
    }

    // Kiểm tra minPurchaseAmount
    if (discount.minPurchaseAmount && originalAmount < discount.minPurchaseAmount) {
        const error = new Error(`Đơn hàng tối thiểu ${discount.minPurchaseAmount.toLocaleString('vi-VN')} VNĐ để sử dụng mã này`);
        error.statusCode = 400;
        error.code = 'DISCOUNT_MIN_PURCHASE_NOT_MET';
        throw error;
    }

    // Tính toán giảm giá
    // Đảm bảo originalAmount là số hợp lệ
    const validOriginalAmount = Number(originalAmount) || 0;
    if (validOriginalAmount <= 0) {
        const error = new Error('Số tiền gốc không hợp lệ');
        error.statusCode = 400;
        error.code = 'INVALID_ORIGINAL_AMOUNT';
        throw error;
    }
    
    const { discountAmount, finalAmount } = calculateDiscountAmount(discount, validOriginalAmount);

    // Tạo discount detail object
    const discountDetails = {
        discountId: discount._id,
        type: discount.type,
        discountPercentage: discount.discountPercentage,
        discountAmount: discountAmount,
        description: discount.conditions
    };

    return {
        discount,
        originalAmount: validOriginalAmount, // Sử dụng validated amount
        discountAmount,
        finalAmount,
        bonusDays: discount.bonusDays || 0,
        discountDetails
    };
};

// 2. Get available discounts (cho Admin)
export const getAvailableDiscounts = async (filters = {}) => {
    const { packageType, packageCategory, memberId } = filters;
    const now = new Date();

    const query = {
        status: 'Active',
        startDate: { $lte: now },
        endDate: { $gte: now }
    };

    // Filter theo packageType
    if (packageType) {
        query.$or = [
            { packageTypes: { $size: 0 } }, // Không giới hạn package type
            { packageTypes: { $in: [packageType] } }
        ];
    }

    // Filter theo packageCategory (durationType)
    if (packageCategory && packageCategory !== 'all') {
        if (!query.$and) query.$and = [];
        query.$and.push({
            $or: [
                { durationTypes: { $size: 0 } },
                { durationTypes: { $in: [packageCategory] } }
            ]
        });
    }

    const discounts = await Discount.find(query).sort({ createdAt: -1 });
    return discounts;
};

// 3. Apply discount manual (cho Admin - không validate nghiêm)
export const applyDiscountManual = async (discountId, originalAmount) => {
    const discount = await Discount.findById(discountId);
    if (!discount) {
        const error = new Error('Discount not found');
        error.statusCode = 404;
        error.code = 'DISCOUNT_NOT_FOUND';
        throw error;
    }

    // Chỉ kiểm tra cơ bản: status, thời gian
    if (discount.status !== 'Active') {
        const error = new Error('Discount is not active');
        error.statusCode = 400;
        error.code = 'DISCOUNT_INACTIVE';
        throw error;
    }

    const now = new Date();
    if (now < discount.startDate || now > discount.endDate) {
        const error = new Error('Discount is not valid at this time');
        error.statusCode = 400;
        error.code = 'DISCOUNT_INVALID_TIME';
        throw error;
    }

    // Tính toán
    const { discountAmount, finalAmount } = calculateDiscountAmount(discount, originalAmount);

    const discountDetails = {
        discountId: discount._id,
        type: discount.type,
        discountPercentage: discount.discountPercentage,
        discountAmount: discountAmount,
        description: discount.conditions
    };

    return {
        discount,
        originalAmount,
        discountAmount,
        finalAmount,
        bonusDays: discount.bonusDays || 0,
        discountDetails
    };
};