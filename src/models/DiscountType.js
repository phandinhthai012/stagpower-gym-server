import mongoose from 'mongoose';


const DiscountTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Discount type name is required'],
        unique: true,
        trim: true,
        uppercase: true,
        index: true,
        // Ví dụ: 'HSSV', 'VIP', 'GROUP', 'COMPANY', 'VOUCHER'
    },
    displayName: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true,
        // Ví dụ: 'Học Sinh Sinh Viên', 'VIP Member', 'Group Booking'
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, { timestamps: true });

const DiscountType = mongoose.model('DiscountType', DiscountTypeSchema);

export default DiscountType;