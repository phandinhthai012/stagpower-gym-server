import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Member ID is required'],
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'Branch ID is required'],
    },
    checkInTime: {
        type: Date,
        default: Date.now
    },
    checkOutTime: {
        type: Date,
        
    },
    checkInMethod: {
        type: String,
        required: [true, 'Check-in method is required'],
        enum: ['QR_Code', 'Manual', 'Webcam', 'Card', 'Biometric'],
        default: 'Manual'
    },
    validationError: {
        type: String,
        maxlength: [500, 'Validation error cannot exceed 500 characters']
    },
    duration: {
        type: Number, // phút
        min: [0, 'Duration cannot be negative']
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['Active', 'Completed', 'Cancelled'],
        default: 'Active',
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true,
    collection: 'checkIns'
});

// indexes for better performance
checkInSchema.index({ memberId: 1, checkInTime: -1 });


// Pre-save middleware
checkInSchema.pre('save', function(next) {
    // Tự động tính duration khi check-out
    if (this.checkOutTime && this.checkInTime) {
        const diffMs = this.checkOutTime - this.checkInTime;
        this.duration = Math.round(diffMs / (1000 * 60)); // Convert to minutes
    }
    next();
});


// Static methods
checkInSchema.statics.findByMember = function(memberId) {
    return this.find({ memberId: memberId })
        .sort({ checkInTime: -1 })
};

// Instance methods
checkInSchema.methods.checkOut = async function() {
    if (this.status !== 'Active') {
        const error = new Error('Cannot check out inactive check-in');
        error.statusCode = 400;
        error.code = 'CANNOT_CHECK_OUT_INACTIVE_CHECK_IN';
        throw error;
    }
    this.checkOutTime = new Date();
    this.status = 'Completed';
    await this.save();
    // Duration sẽ được tính tự động trong pre-save
    return this;
};


const CheckIn = mongoose.model('CheckIn', checkInSchema);

export default CheckIn;