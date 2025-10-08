import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Package name is required'],
        trim: true,
        maxlength: [100, 'Package name cannot exceed 100 characters']
    },
    type: {
        type: String,
        required: [true, 'Package type is required'],
        enum: {
            values: ['Membership', 'Combo', 'PT'],
            message: 'Package type must be Membership, Combo, or PT'
        },
    },
    packageCategory: {
        type: String,
        required: [true, 'Package category is required'],
        enum: {
            values: ['ShortTerm', 'MediumTerm', 'LongTerm', 'Trial'],
            message: 'Package category must be ShortTerm, MediumTerm, LongTerm, or Trial'
        },
    },
    durationMonths: {
        type: Number,
        required: [true, 'Duration in months is required'],
        min: [1, 'Duration must be at least 1 month'],
    },
    membershipType: {
        type: String,
        enum: {
            values: ['Basic', 'VIP'],
            message: 'Membership type must be Basic or VIP'
        },
        required: function() {
            return this.type === 'Membership' || this.type === 'Combo';
        }
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    ptSessions: {
        type: Number,
        min: [0, 'PT sessions cannot be negative'],
        required: function() {
            return this.type === 'PT' || this.type === 'Combo';
        }
    },
    ptSessionDuration: {
        type: Number,
        min: [30, 'PT session duration must be at least 30 minutes'],
        max: [150, 'PT session duration cannot exceed 150 minutes'],
        required: function() {
            return this.type === 'PT' || this.type === 'Combo';
        }
    },
    branchAccess: {
        type: String,
        required: [true, 'Branch access is required'],
        enum: {
            values: ['Single', 'All'],
            message: 'Branch access must be Single or All'
        },
        default: 'All'
    },
    isTrial: {
        type: Boolean,
        required: [true, 'IsTrial is required'],
        default: false
    },
    
    maxTrialDays: {
        type: Number,
        min: [1, 'Max trial days must be at least 1'],
        max: [7, 'Max trial days cannot exceed 7'],
        required: function() {
            return this.isTrial === true;
        }
    },
    
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: {
            values: ['Active', 'Inactive', 'Draft'],
            message: 'Status must be Active or Inactive or Draft'
        },
        default: 'Active'
    }
}, {
    timestamps: true,
    collection: 'packages'
})

// Indexes for better performance
packageSchema.index({ type: 1 });
packageSchema.index({ packageCategory: 1 });
packageSchema.index({ status: 1 });
packageSchema.index({ price: 1 });
packageSchema.index({ isTrial: 1 });
packageSchema.index({ createdAt: -1 });


// Static methods
packageSchema.statics.findByType = function(type) {
    return this.find({ type, status: 'Active' });
};

packageSchema.statics.findByCategory = function(category) {
    return this.find({ packageCategory: category, status: 'Active' });
};

packageSchema.statics.findTrialPackages = function() {
    return this.find({ isTrial: true, status: 'Active' });
};

packageSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
    return this.find({ 
        price: { $gte: minPrice, $lte: maxPrice },
        status: 'Active'
    });
};

const Package = mongoose.model('Package', packageSchema);

export default Package;
