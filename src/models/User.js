import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    uid: {
        type: String,

    },
    role: {
        type: String,
        enum: ['member', 'admin', 'trainer', 'staff'],
        default: 'member'
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        // unique: true
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        // unique: true,
        trim: true,
        // match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
        validate: {
            validator: function (value) {
                return /^(0|\+84|84)[0-9]{9}$/.test(value);
            },
            message: 'Please enter a valid Vietnamese phone number(e.g., 0123456789, +84123456789)'
        }
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'male'
    },
    // ít nhất 6 kí tự , bao gồm ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 số, có thể có kí tự đặc biệt
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    cccd: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
        trim: true,
        match: [/^\d{12}$/, 'Please enter a valid 12-digit CCCD']
    },
    dateOfBirth: {
        type: Date,
        required: false,
        // match: [/^\d{2}-\d{2}-\d{4}$/, 'Please enter a valid date of birth in the format DD-MM-YYYY']

    },
    photo: {
        type: String,
        required: false
    },
    joinDate: {
        type: Date,
        required: false,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'Banned'],
        default: 'active'
    },
    // memberInfo - if role is member
    memberInfo: {
        membership_level: {
            type: String,
            enum: ['vip', 'basic'],
            default: 'basic'
        },
        qr_code: {
            type: String,
            unique: true,
            sparse: true // allow null or undefined
        },
        health_info_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'HealthInfo'
        },
        notes: {
            type: String,
            maxlength: [500, 'Notes cannot exceed 500 characters']
        },
        is_student: {
            type: Boolean,
            default: false
        },
        total_spending: {
            type: Number,
            min: [0, 'Total spending cannot be less than 0'],
            default: 0
        },
        membership_month: {
            type: Number,
            min: [0, 'Membership month cannot be less than 0'],
            default: 0
        },
        current_brand_id: {
            type: mongoose.Schema.Types.ObjectId,
            // ref: 'Brand'
        },
    },
    // TrainerInfo - if role is trainer
    trainerInfo: {
        specialty: {
            type: String,
        },
        experience_years: {
            type: Number,
            min: [0, 'Experience years cannot be less than 0'],
            default: 0
        },
        certificate: {
            type: Array,
            default: []
        },
        working_hour: {
            type: Array,
            default: []
        },
    },
    // StaffInfo - if role is staff
    staffInfo: {
        brand_id: {
            type: mongoose.Schema.Types.ObjectId,
            // ref: 'Brand'
        },
        position: {
            type: String,
            enum: ['manager', 'trainer', 'staff', 'receptionist'],
        },
    },
    // adminInfo - if role is admin
    adminInfo: {
        permissions: {
            type: Array,
            default: []
        },
        managed_branches: {
            type: Array,
            default: []
        },
    },
    // để revoka token 
    tokenVersion: {
        type: Number,
        default: 0
    },
    otp: {
        code: { type: String, default: null },
        expiresAt: { type: Date, default: null },
        isUsed: { type: Boolean, default: false }
    }
}, {
    timestamps: true,
    collection: 'users'
})

// custom toJSON method
userSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        const basicInfo = {
            _id: ret._id,
            uid: ret.uid,
            fullName: ret.fullName,
            email: ret.email,
            phone: ret.phone,
            gender: ret.gender,
            dateOfBirth: ret.dateOfBirth,
            photo: ret.photo,
            joinDate: ret.joinDate,
            status: ret.status,
            role: ret.role,
            createdAt: ret.createdAt,
            updatedAt: ret.updatedAt,
            otp: ret.otp
        };
        switch (ret.role) {
            case 'member':
                basicInfo.memberInfo = ret.memberInfo;
                break;
            case 'trainer':
                basicInfo.trainerInfo = ret.trainerInfo;
                break;
            case 'staff':
                basicInfo.staffInfo = ret.staffInfo;
                break;
            case 'admin':
                basicInfo.adminInfo = ret.adminInfo;
                break;
            default:
                break;
        }
        return basicInfo;
    }
});

// indexs for better query performance
userSchema.index({ uid: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });

// pre-save middleware
userSchema.pre('save', async function (next) {
    if (this.role === 'member' && !this.uid) {
        try {
            const count = await mongoose.model('User').countDocuments({ role: 'member' });
            this.uid = `MEM${String(count + 1).padStart(6, '0')}`;
            next();
        } catch (error) {
            next(error);
        }
    } else if (this.role === 'trainer' || this.role === 'staff' ) {
        try {
            const count = await mongoose.model('User').countDocuments({ role: { $in: ['trainer', 'staff'] } });
            this.uid = `EMP${String(count + 1).padStart(6, '0')}`;
            next();
        } catch (error) {
            next(error);
        }
    } else if (this.role === 'admin') {
        try {
            const count = await mongoose.model('User').countDocuments({ role: 'admin' });
            this.uid = `ADM${String(count + 1).padStart(6, '0')}`;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
})
// hash password middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// Auto generate qr code for member


// instance methods (functions of the instance)
userSchema.methods.correctPassword = async function (userPassword) {
    console.log("compare password");
    return await bcrypt.compare(userPassword, this.password);
    // return userPassword === this.password;
};
userSchema.methods.isVipMember = function () {
    return this.role === 'member' &&
        this.memberInfo &&
        this.memberInfo.membership_level === 'vip';
};
userSchema.methods.getAge = function () {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    return age;
};

// static methods (functions)
userSchema.statics.findByRole = function (role) {
    return this.find({ role });
};
userSchema.statics.findByEmail = function (email) {
    return this.find({ email });
};
userSchema.statics.findByPhone = function (phone) {
    return this.find({ phone });
};
userSchema.statics.findByUid = function (uid) {
    return this.find({ uid });
};
userSchema.statics.findByCccd = function (cccd) {
    return this.find({ cccd });
};
userSchema.statics.findByDateOfBirth = function (dateOfBirth) {
    return this.find({ dateOfBirth });
};

const User = mongoose.model('User', userSchema);

export default User;