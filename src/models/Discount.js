import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    type: {
        type: String,
        enum: ['HSSV', 'VIP', 'Group', 'Company', 'Voucher'],
        required: [true, 'Discount type is required'],
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
    bonusDays: {
        type: Number,        // Số ngày tặng thêm membership
        min: [0, 'Bonus days cannot be negative'],
        max: [60, 'Bonus days cannot exceed 60']
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


discountSchema.pre('validate', function (next) {
    if (this.endDate && this.startDate && this.endDate <= this.startDate) {
        const error = new Error('End date must be after start date');
        error.statusCode = 400;
        return next(error);
    }
    next();
});


const Discount = mongoose.model('Discount', discountSchema);

export default Discount;