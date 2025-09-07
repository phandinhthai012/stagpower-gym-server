import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: [true, 'Subscription ID is required'],
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Member ID is required'],
    },
    originalAmount: {
        type: Number,
        required: [true, 'Original amount is required'],
        min: [0, 'Original amount cannot be negative']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    discountDetails: [{
        discountId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        type: {
            type: String,
            enum: ['HSSV', 'VIP', 'Group', 'Company', 'Voucher'],
        }, 
        discountPercentage: {
            type: Number,
            min: [0, 'Discount percentage cannot be negative'],
            max: [100, 'Discount percentage cannot exceed 100']
        },
        discountAmount: {
            type: Number,
            min: [0, 'Discount amount cannot be negative']
        },
        description: {
            type: String,
            maxlength: [200, 'Description cannot exceed 200 characters']
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }],
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: ['Momo', 'ZaloPay', 'Cash', 'Card', 'BankTransfer', 'VNPay']
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        required: [true, 'Payment status is required'],
        enum: ['Pending', 'Completed', 'Failed', 'Refunded','Cancelled'],
        default: 'Pending'
    },
    invoiceNumber: {
        type: String,
        required: [true, 'Invoice number is required'],
        unique: true,
        // index: true,
        // default: function() {
        //     return `INV${Date.now()}${Math.floor(Math.random() * 1000)}`;
        // }
    },
    transactionId: {
        type: String,
        index: true 
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true,
    collection: 'payments'
});

// custom toJSON method
paymentSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.__v;
        return ret;
    }
});

// Indexes for better performance
paymentSchema.index({ memberId: 1, paymentDate: -1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ invoiceNumber: 1 });


// Pre-save middleware
paymentSchema.pre('save', function(next) {
    if (!this.invoiceNumber) {
        this.invoiceNumber = `INV${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }
    next();
});

// Static methods
paymentSchema.statics.findByMember = function(memberId) {
    return this.find({ memberId });
};



const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;