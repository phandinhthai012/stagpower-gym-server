import mongoose from 'mongoose';

/**
 * Transaction Helper - Tự động detect và sử dụng transactions
 * @param {Function} callback - Function cần chạy trong transaction
 * @returns {Promise} - Kết quả của callback
 */
export const withTransaction = async (callback) => {
    // Kiểm tra xem MongoDB có hỗ trợ transactions không
    const isReplicaSet = await checkReplicaSet();
    
    if (isReplicaSet) {
        // Sử dụng transactions
        const session = await mongoose.startSession();
        try {
            await session.startTransaction();
            const result = await callback(session);
            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    } else {
        // Không sử dụng transactions (fallback)
        console.warn('⚠️ MongoDB không hỗ trợ transactions. Chạy không có transaction.');
        return await callback(null);
    }
};

/**
 * Kiểm tra MongoDB có phải replica set không
 */
const checkReplicaSet = async () => {
    try {
        const admin = mongoose.connection.db.admin();
        const result = await admin.command({ isMaster: 1 });
        return result.ismaster === false; // Replica set sẽ có ismaster = false
    } catch (error) {
        console.warn('Không thể kiểm tra replica set:', error.message);
        return false;
    }
};

/**
 * Helper để tạo document với hoặc không có session
 */
export const createWithSession = async (Model, data, session = null) => {
    if (session) {
        return await Model.create(data, { session });
    } else {
        return await Model.create(data);
    }
};

/**
 * Helper để tìm document với hoặc không có session
 */
export const findByIdWithSession = async (Model, id, session = null) => {
    if (session) {
        return await Model.findById(id).session(session);
    } else {
        return await Model.findById(id);
    }
};

/**
 * Helper để save document với hoặc không có session
 */
export const saveWithSession = async (doc, session = null) => {
    if (session) {
        return await doc.save({ session });
    } else {
        return await doc.save();
    }
};