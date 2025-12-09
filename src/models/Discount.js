import mongoose from 'mongoose';
import DiscountType from './DiscountType.js';

const discountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    code: {
        type: String,
        unique: true,
        sparse: true, // Cho phép null nhưng vẫn unique nếu có giá trị
        uppercase: true,
        trim: true,
        index: true,
        // Chỉ required cho type 'Voucher'
        // validate: {
        //     validator: function (value) {
        //         // Nếu là Voucher thì phải có code
        //         if (this.type === 'Voucher') {
        //             return value && value.length > 0;
        //         }
        //         return true; // Các type khác không bắt buộc
        //     },
        //     message: 'Voucher code is required for Voucher type'
        // }
    },
    type: {
        type: String,
        required: [true, 'Discount type is required'],
        uppercase: true,
        trim: true,
    },
    discountPercentage: {
        type: Number,        // 0..100 (%)
        min: [0, 'Percentage cannot be negative'],
        max: [100, 'Percentage cannot exceed 100']
    },
    discountAmount: {
        type: Number,        // VND
        min: [0, 'Amount cannot be negative']
    },
    maxDiscount: {
        type: Number,        // VND
        min: [0, 'Max discount cannot be negative']
    },
    minPurchaseAmount: {
        type: Number,        // VND - Số tiền tối thiểu để áp dụng
        min: [0, 'Min purchase amount cannot be negative'],
        default: 0
    },
    bonusDays: {
        type: Number,        // Số ngày tặng thêm membership
        min: [0, 'Bonus days cannot be negative'],
        max: [60, 'Bonus days cannot exceed 60']
    },
    // Thêm vào schema (sau bonusDays):
    usageLimit: {
        type: Number,
        min: [0, 'Usage limit cannot be negative'],
        default: null  // null = không giới hạn
    },
    usageCount: {
        type: Number,
        min: [0, 'Usage count cannot be negative'],
        default: 0 // số lần sử dụng discount
    },
    conditions: {
        type: String,        // Mô tả điều kiện áp dụng
        required: [true, 'Conditions are required'],
        maxlength: [500, 'Conditions cannot exceed 500 characters']
    },
    durationTypes: {
        type: [String],      // ShortTerm, MediumTerm, LongTerm
        default: [],
        validate: {
            validator: arr => arr.every(v => ['ShortTerm', 'MediumTerm', 'LongTerm'].includes(v)),
            message: 'Invalid duration type'
        }
    },
    packageTypes: {
        type: [String],      // Membership, Combo, PT
        default: [],
        validate: {
            validator: arr => arr.every(v => ['Membership', 'Combo', 'PT'].includes(v)),
            message: 'Invalid package type'
        }
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],

    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],

    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['Active', 'Inactive'],
        default: 'Active',

    },
}, {
    timestamps: true,
    collection: 'discounts'
});

//indexes
discountSchema.index({ name: 1 });
discountSchema.index({ type: 1 });
discountSchema.index({ startDate: 1 });
discountSchema.index({ endDate: 1 });
discountSchema.index({ status: 1 });


discountSchema.pre('validate', async function (next) {
    if (this.endDate && this.startDate && this.endDate <= this.startDate) {
        const error = new Error('End date must be after start date');
        error.statusCode = 400;
        return next(error);
    }
    // Kiểm tra phải có discountPercentage hoặc discountAmount
    if (!this.discountPercentage && !this.discountAmount) {
        const error = new Error('Must have either discountPercentage or discountAmount');
        error.statusCode = 400;
        return next(error);
    }
    // Kiểm tra code format (nếu có)
    if (this.code) {
        // Chỉ cho phép chữ cái, số, và dấu gạch dưới
        const codeRegex = /^[A-Z0-9_]+$/;
        if (!codeRegex.test(this.code)) {
            const error = new Error('Code must contain only uppercase letters, numbers, and underscores');
            error.statusCode = 400;
            return next(error);
        }
        // Độ dài hợp lý
        if (this.code.length < 3 || this.code.length > 20) {
            const error = new Error('Code must be between 3 and 20 characters');
            error.statusCode = 400;
            return next(error);
        }
    }
    if (this.type) {
        const normalizedType = this.type.toUpperCase().trim();
        const discountType = await DiscountType.findOne({ name: normalizedType });
        if (!discountType) {
            const error = new Error(`Discount type '${normalizedType}' does not exist. Please create it in DiscountType first.`);
            error.statusCode = 400;
            error.code = 'INVALID_DISCOUNT_TYPE';
            return next(error);
        }
        // Đảm bảo type được normalize
        this.type = normalizedType;
    }

    next();
});

// Virtual field để lấy thông tin loại discount
discountSchema.virtual('typeInfo', {
    ref: 'DiscountType',
    localField: 'type',
    foreignField: 'name',
    justOne: true
});
discountSchema.set('toJSON', { virtuals: true });
discountSchema.set('toObject', { virtuals: true });
// Pre-save middleware để tự động uppercase code
discountSchema.pre('save', function (next) {
    if (this.code && this.isModified('code')) {
        this.code = this.code.toUpperCase().trim();
    }
    next();
});

// Instance method để kiểm tra discount có thể sử dụng không
discountSchema.methods.isUsable = function () {
    const now = new Date();
    return (
        this.status === 'Active' &&
        now >= this.startDate &&
        now <= this.endDate &&
        (this.usageLimit === null || this.usageCount < this.usageLimit)
    );
};

// Thêm method tăng usage:
discountSchema.methods.incrementUsage = async function () {
    this.usageCount = (this.usageCount || 0) + 1;
    await this.save();
    return this;
};

discountSchema.statics.findByCode = function (code) {
    return this.findOne({ code: code.toUpperCase().trim() });
};


const Discount = mongoose.model('Discount', discountSchema);

export default Discount;