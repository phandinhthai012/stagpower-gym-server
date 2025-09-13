import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Branch name is required'],
        trim: true,
        maxlength: [100, 'Branch name cannot exceed 100 characters']
    },
    address: {
        type: String,
        required: [true, 'Branch address is required'],
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters']
    },
    openTime: {
        type: String,
        required: [true, 'Open time is required'],
        trim: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 'Please enter a valid time format (e.g., 6:00 AM)']
    },
    closeTime: {
        type: String,
        required: [true, 'Close time is required'],
        trim: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 'Please enter a valid time format (e.g., 10:00 PM)']
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['Active', 'Maintenance', 'Closed'],
        default: 'Active'
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function (value) {
                if (!value) return true; // Optional field
                return /^(0|\+84|84)[0-9]{9}$/.test(value);
            },
            message: 'Please enter a valid Vietnamese phone number'
        }
    },
    email: {
        type: String,
        trim: true,
        validate: {
            validator: function (value) {
                if (!value) return true; // Optional field
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
            },
            message: 'Please enter a valid email address'
        }
    }
}, {
    timestamps: true,
    collection: 'branches'
});

// Custom toJSON method
branchSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.__v;
        return ret;
    }
});

// Indexes for better performance
branchSchema.index({ name: 1 });
branchSchema.index({ status: 1 });
branchSchema.index({ address: 'text', name: 'text' }); // Text search

// Static methods
branchSchema.statics.findActive = function() {
    return this.find({ status: 'Active' });
};

branchSchema.statics.findByStatus = function(status) {
    return this.find({ status });
};

// Instance methods
branchSchema.methods.isOpen = function() {
    if (this.status !== 'Active') return false;
    
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    
    // Simple time comparison (you might want to implement more sophisticated logic)
    return this.status === 'Active';
};

branchSchema.methods.getOperatingHours = function() {
    return `${this.openTime} - ${this.closeTime}`;
};

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;
