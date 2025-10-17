import mongoose from 'mongoose';


const subscriptionSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Member ID is required'],

    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: [true, 'Package ID is required'],
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null, // nếu null thì subscription có thể sử dụng ở tất cả các chi nhánh
    },
    type: {
        type: String,
        enum: ['Membership', 'Combo', 'PT'],
        required: [true, 'Type is required'],
    },
    membershipType: {
        type: String,
        enum: ['Basic', 'VIP'],
        required: [true, 'Membership type is required'],
    },
    startDate: {
        type: Date,
        required: false, // Không bắt buộc, sẽ được set khi thanh toán
        default: null,
    },
    endDate: {
        type: Date,
        required: false, // Không bắt buộc, sẽ được set khi thanh toán
        default: null,
    },
    durationDays: {
        type: Number,
        required: [true, 'Duration days is required'],
    },
    ptsessionsRemaining: {
        type: Number,
        min: [0, 'Ptsessions remaining cannot be negative'],
        required: function () {
            return this.type === 'PT' || this.type === 'Combo';
        },
    },
    ptsessionsUsed: {
        type: Number,
        min: [0, 'Ptsessions used cannot be negative'],
        required: function () {
            return this.type === 'PT' || this.type === 'Combo';
        },
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['Active', 'Expired', 'Suspended', 'PendingPayment', 'NotStarted'],
        default: 'PendingPayment',
    },
    suspensionHistory: [{
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        reason: {
            type: String,
            required: true,
            maxlength: [200, 'Suspension reason cannot exceed 200 characters']
        },
        status: {
            type: String,
            enum: ['Active', 'Completed'],
            default: 'Active'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isSuspended: {
        type: Boolean,
        default: false
    },
    suspensionStartDate: {
        type: Date,
        required: function () {
            return this.isSuspended === true;
        }
    },
    suspensionEndDate: {
        type: Date,
        required: function () {
            return this.isSuspended === true;
        }
    },
    suspensionReason: {
        type: String,
        maxlength: [200, 'Suspension reason cannot exceed 200 characters'],
        required: function () {
            return this.isSuspended === true;
        }
    },
    renewedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        default: null,
    },
    bonusDays: {
        type: Number,
        min: [0, 'Bonus days cannot be negative'],
        default: 0,
    },
}, {
    timestamps: true,
    collection: 'subscriptions',
});


// custom toJSON method
subscriptionSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.__v;
        return ret;
    }
});



// Indexes for better performance
subscriptionSchema.index({ memberId: 1, status: 1 });
subscriptionSchema.index({ startDate: 1, endDate: 1 });
subscriptionSchema.index({ endDate: 1, status: 1 });

subscriptionSchema.pre('save', function(next) {
    if (!this.endDate && this.startDate && this.durationDays) {
        this.endDate = new Date(this.startDate.getTime() + (this.durationDays * 24 * 60 * 60 * 1000));
    }
    next();
});


// Static methods
subscriptionSchema.statics.findActiveByMember = function(memberId) {
    return this.find({ 
        memberId, 
        status: 'Active',
        endDate: { $gt: new Date() }
    });
};

// Find subscriptions expiring soon 7 days from now
subscriptionSchema.statics.findExpiringSoon = function(days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.find({
        status: 'Active',
        endDate: { $lte: futureDate, $gt: new Date() }
    });
};


// Instance methods
subscriptionSchema.methods.isExpired = function() {
    return new Date() > this.endDate;
};
subscriptionSchema.methods.isActive = function() {
    return this.status === 'Active' && !this.isSuspended && !this.isExpired();
};
subscriptionSchema.methods.canUsePT = function() {
    return (this.type === 'PT' || this.type === 'Combo') && this.ptsessionsRemaining > 0;
};

subscriptionSchema.methods.usePTSession = function() {
    if (this.canUsePT()) {
        this.ptsessionsRemaining -= 1;
        this.ptsessionsUsed += 1;
        return true;
    }
    return false;
};

subscriptionSchema.methods.suspend = function(reason, startDate, endDate) {
    this.isSuspended = true;
    this.suspensionStartDate = startDate? new Date(startDate) : new Date();
    this.suspensionEndDate = new Date(endDate);
    this.suspensionReason = reason || 'No reason';
    this.status = 'Suspended';
};

subscriptionSchema.methods.unsuspend = function() {
    // Lưu thông tin tạm ngưng trước khi xóa
    const suspensionInfo = {
        startDate: this.suspensionStartDate,
        endDate: this.suspensionEndDate,
        reason: this.suspensionReason,
        status: 'Completed',
        completedAt: new Date()
    };
    
    // Thêm vào lịch sử
    this.suspensionHistory.push(suspensionInfo);
    
    // Reset thông tin tạm ngưng
    this.isSuspended = false;
    this.suspensionStartDate = undefined;
    this.suspensionEndDate = undefined;
    this.suspensionReason = undefined;
    this.status = 'Active';
};

subscriptionSchema.methods.extend = function(days) {
    this.endDate = new Date(this.endDate.getTime() + (days * 24 * 60 * 60 * 1000));
    this.durationDays += days;
};

subscriptionSchema.methods.extendPTSessions = function(sessions) {
    if (this.type === 'PT' || this.type === 'Combo') {
        this.ptsessionsRemaining += sessions;
        return true;
    }
    return false;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;