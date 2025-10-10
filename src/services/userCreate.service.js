import User from "../models/User.js";
import bcrypt from "bcryptjs";

/**
 * Service tạo user tổng quát
 * @param {Object} userData - Dữ liệu user
 * @returns {Object} User đã được tạo
 */
export const createUser = async (userData) => {
    try {
        const { 
            fullName, 
            email, 
            phone, 
            gender, 
            dateOfBirth, 
            photo, 
            password,
            cccd,
            role, 
            status = "active",
            memberInfo,
            trainerInfo,
            staffInfo,
            adminInfo
        } = userData;

        // 1. Validate required fields
        if (!fullName || !email || !phone || !password || !role) {
            const error = new Error("Missing required fields");
            error.statusCode = 400;
            error.code = "MISSING_REQUIRED_FIELDS";
            throw error;
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error("Email already exists");
            error.statusCode = 400;
            error.code = "EMAIL_ALREADY_EXISTS";
            throw error;
        }

        // 3. Check CCCD if provided
        if (cccd) {
            const existingCCCD = await User.findOne({ cccd });
            if (existingCCCD) {
                const error = new Error("CCCD already exists");
                error.statusCode = 400;
                error.code = "CCCD_ALREADY_EXISTS";
                throw error;
            }
        }

        // 4. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Prepare user data
        const newUserData = {
            fullName,
            email,
            phone,
            gender: gender || "male",
            dateOfBirth,
            photo,
            password: hashedPassword,
            cccd,
            role,
            status
        };

        // 6. Add role-specific information
        switch (role) {
            case 'member':
                newUserData.memberInfo = {
                    membership_level: memberInfo?.membership_level || 'basic',
                    qr_code: memberInfo?.qr_code || null,
                    health_info_id: memberInfo?.health_info_id || null,
                    notes: memberInfo?.notes || '',
                    is_student: memberInfo?.is_student || false,
                    total_spending: memberInfo?.total_spending || 0,
                    membership_month: memberInfo?.membership_month || 0,
                    current_brand_id: memberInfo?.current_brand_id || null
                };
                break;

            case 'trainer':
                newUserData.trainerInfo = {
                    specialty: trainerInfo?.specialty || '',
                    experience_years: trainerInfo?.experience_years || 0,
                    certificate: trainerInfo?.certificate || [],
                    working_hour: trainerInfo?.working_hour || []
                };
                break;

            case 'staff':
                newUserData.staffInfo = {
                    brand_id: staffInfo?.brand_id || null,
                    position: staffInfo?.position || 'staff'
                };
                break;

            case 'admin':
                newUserData.adminInfo = {
                    permissions: adminInfo?.permissions || [],
                    managed_branches: adminInfo?.managed_branches || []
                };
                break;

            default:
                const error = new Error("Invalid role");
                error.statusCode = 400;
                error.code = "INVALID_ROLE";
                throw error;
        }

        // 7. Create user
        const newUser = await User.create(newUserData);
        
        // 8. Return user without password
        const userResponse = newUser.toJSON();
        delete userResponse.password;
        
        return userResponse;

    } catch (error) {
        throw error;
    }
};

/**
 * Service tạo member
 * @param {Object} memberData - Dữ liệu member
 * @returns {Object} Member đã được tạo
 */
export const createMember = async (memberData) => {
    try {
        const { memberInfo, ...basicInfo } = memberData;
        
        const userData = {
            ...basicInfo,
            role: 'member',
            memberInfo: {
                membership_level: memberInfo?.membership_level || 'basic',
                qr_code: memberInfo?.qr_code || null,
                health_info_id: memberInfo?.health_info_id || null,
                notes: memberInfo?.notes || '',
                is_student: memberInfo?.is_student || false,
                total_spending: memberInfo?.total_spending || 0,
                membership_month: memberInfo?.membership_month || 0,
                current_brand_id: memberInfo?.current_brand_id || null
            }
        };

        return await createUser(userData);
    } catch (error) {
        throw error;
    }
};

/**
 * Service tạo trainer
 * @param {Object} trainerData - Dữ liệu trainer
 * @returns {Object} Trainer đã được tạo
 */
export const createTrainer = async (trainerData) => {
    try {
        const { trainerInfo, ...basicInfo } = trainerData;
        
        const userData = {
            ...basicInfo,
            role: 'trainer',
            trainerInfo: {
                specialty: trainerInfo?.specialty || '',
                experience_years: trainerInfo?.experience_years || 0,
                certificate: trainerInfo?.certificate || [],
                working_hour: trainerInfo?.working_hour || []
            }
        };

        return await createUser(userData);
    } catch (error) {
        throw error;
    }
};

/**
 * Service tạo staff
 * @param {Object} staffData - Dữ liệu staff
 * @returns {Object} Staff đã được tạo
 */
export const createStaff = async (staffData) => {
    try {
        const { staffInfo, ...basicInfo } = staffData;
        
        const userData = {
            ...basicInfo,
            role: 'staff',
            staffInfo: {
                brand_id: staffInfo?.brand_id || null,
                position: staffInfo?.position || 'staff'
            }
        };

        return await createUser(userData);
    } catch (error) {
        throw error;
    }
};

/**
 * Service tạo admin
 * @param {Object} adminData - Dữ liệu admin
 * @returns {Object} Admin đã được tạo
 */
export const createAdmin = async (adminData) => {
    try {
        const { adminInfo, ...basicInfo } = adminData;
        
        const userData = {
            ...basicInfo,
            role: 'admin',
            adminInfo: {
                permissions: adminInfo?.permissions || [],
                managed_branches: adminInfo?.managed_branches || []
            }
        };

        return await createUser(userData);
    } catch (error) {
        throw error;
    }
};

/**
 * Service tạo user với validation nâng cao
 * @param {Object} userData - Dữ liệu user
 * @param {string} createdBy - ID của user tạo
 * @returns {Object} User đã được tạo
 */
export const createUserWithValidation = async (userData, createdBy = null) => {
    try {
        // 1. Validate role permissions
        if (createdBy) {
            const creator = await User.findById(createdBy);
            if (!creator) {
                const error = new Error("Creator not found");
                error.statusCode = 404;
                error.code = "CREATOR_NOT_FOUND";
                throw error;
            }

            // Only admin can create admin
            if (userData.role === 'admin' && creator.role !== 'admin') {
                const error = new Error("Only admin can create admin");
                error.statusCode = 403;
                error.code = "INSUFFICIENT_PERMISSIONS";
                throw error;
            }
        }

        // 2. Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(userData.email)) {
            const error = new Error("Invalid email format");
            error.statusCode = 400;
            error.code = "INVALID_EMAIL_FORMAT";
            throw error;
        }

        // 3. Validate phone format
        const phoneRegex = /^(0|\+84|84)[0-9]{9}$/;
        if (!phoneRegex.test(userData.phone)) {
            const error = new Error("Invalid phone format");
            error.statusCode = 400;
            error.code = "INVALID_PHONE_FORMAT";
            throw error;
        }

        // 4. Validate password strength
        if (userData.password.length < 6) {
            const error = new Error("Password must be at least 6 characters");
            error.statusCode = 400;
            error.code = "WEAK_PASSWORD";
            throw error;
        }

        // 5. Validate CCCD format
        if (userData.cccd && !/^\d{12}$/.test(userData.cccd)) {
            const error = new Error("CCCD must be 12 digits");
            error.statusCode = 400;
            error.code = "INVALID_CCCD_FORMAT";
            throw error;
        }

        // 6. Create user
        return await createUser(userData);

    } catch (error) {
        throw error;
    }
};

/**
 * Service tạo user hàng loạt
 * @param {Array} usersData - Mảng dữ liệu users
 * @returns {Array} Users đã được tạo
 */
export const createMultipleUsers = async (usersData) => {
    try {
        const results = [];
        const errors = [];

        for (let i = 0; i < usersData.length; i++) {
            try {
                const user = await createUser(usersData[i]);
                results.push(user);
            } catch (error) {
                errors.push({
                    index: i,
                    data: usersData[i],
                    error: error.message
                });
            }
        }

        return {
            success: results,
            errors: errors,
            total: usersData.length,
            successCount: results.length,
            errorCount: errors.length
        };

    } catch (error) {
        throw error;
    }
};
