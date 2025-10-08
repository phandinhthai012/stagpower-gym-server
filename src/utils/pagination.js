// Basic pagination function - đơn giản nhất
export const paginate = async (model, query = {}, options = {}) => {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const sort = options.sort || 'createdAt';
    const order = options.order || 'desc';
    
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
        model.find(query)
            .sort({ [sort]: order === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(limit),
        model.countDocuments(query)
    ]);
    
    return {
        data,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
            limit
        }
    };
};

// Search function riêng cho Users
export const searchUsers = (keyword) => {
    return {
        $or: [
            { fullName: { $regex: keyword, $options: 'i' } },
            { email: { $regex: keyword, $options: 'i' } }
        ]
    };
};

// Search function riêng cho Exercises
export const searchExercises = (keyword) => {
    return {
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } }
        ]
    };
};

// Search function riêng cho Schedules
export const searchSchedules = (keyword) => {
    return {
        $or: [
            { notes: { $regex: keyword, $options: 'i' } }
        ]
    };
};

// Search function riêng cho Payments
export const searchPayments = (keyword) => {
    return {
        $or: [
            { notes: { $regex: keyword, $options: 'i' } },
            { paymentMethod: { $regex: keyword, $options: 'i' } }
        ]
    };
};

// Search function riêng cho CheckIns
export const searchCheckIns = (keyword) => {
    return {
        $or: [
            { notes: { $regex: keyword, $options: 'i' } }
        ]
    };
};