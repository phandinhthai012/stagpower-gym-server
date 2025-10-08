import mongoose from 'mongoose';

const bookingRequestSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Member ID is required'],
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Trainer ID is required'],
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: [true, 'Subscription ID is required'],
    },
    requestDateTime: { // ngày giờ yêu cầu buổi tập với trainer
        type: Date,
        required: [true, 'Request date time is required'],
        default: Date.now
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['Pending', 'Confirmed', 'Rejected','Expired'],
        default: 'Pending'
    },
    rejectReason: {
        type: String,
        maxlength: [500, 'Reject reason cannot exceed 500 characters']
    },  
}, {
    timestamps: true,
    collection: 'bookingRequests'
});

//indexe
bookingRequestSchema.index({ memberId: 1, requestDateTime: -1 });
bookingRequestSchema.index({ trainerId: 1, requestDateTime: -1 });


// Auto-expire pending requests in the past
bookingRequestSchema.pre('validate', function(next) {
    if (this.status === 'Pending' && this.requestDateTime < new Date()) {
      this.status = 'Expired';
    }
    next();
});



// Static methods
bookingRequestSchema.statics.findByMember = function(memberId) {
    return this.find({ memberId })
        .sort({ requestDateTime: -1 })
};
bookingRequestSchema.statics.findByTrainer = function(trainerId) {
    return this.find({ trainerId })
        .sort({ requestDateTime: -1 })
};



const BookingRequest = mongoose.model('BookingRequest', bookingRequestSchema);

export default BookingRequest;
