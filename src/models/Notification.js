import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    title: {
        type: String,
        trim: true,
        required: [true, 'Title is required']
    },
    type: {
        type: String,
        enum: ['INFO', 'WARNING', 'ERROR'],
        default: 'INFO'
    },
    message: {
        type: String,
        trim: true,
        required: [true, 'Message is required']
    },
    status: {
        type: String,
        enum: ['UNREAD', 'READ'],
        default: 'UNREAD'
    }
}, {
    timestamps: true,
    collection: 'notifications'
});

notificationSchema.index({ userId: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });

const Notification = mongoose.model('Notification', notificationSchema);




export default Notification;