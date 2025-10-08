import {
    createPackage,
    getAllPackages,
    getPackageById,
    updatePackageById,
    deletePackageById
} from "../services/package.service";
import response from "../utils/response";

/**
 * Tạo mới gói tập
 * POST /api/packages
 */
export const createPackageController = async (req, res, next) => {
    try {
        const packageData = req.body;
        const newPackage = await createPackage(packageData);
        
        return response(res, {
            success: true,
            statusCode: 201,
            message: "Package created successfully",
            data: newPackage
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Lấy danh sách tất cả gói tập
 * GET /api/packages
 */
export const getAllPackagesController = async (req, res, next) => {
    try {
        const packages = await getAllPackages();
        
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Packages fetched successfully",
            data: packages
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Lấy thông tin chi tiết gói tập theo ID
 * GET /api/packages/:id
 */
export const getPackageByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const packageData = await getPackageById(id);
        
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Package fetched successfully",
            data: packageData
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Cập nhật gói tập theo ID
 * PUT /api/packages/:id
 */
export const updatePackageByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedPackage = await updatePackageById(id, updateData);
        
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Package updated successfully",
            data: updatedPackage
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Xóa gói tập theo ID
 * DELETE /api/packages/:id
 */
export const deletePackageByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedPackage = await deletePackageById(id);
        
        return response(res, {
            success: true,
            statusCode: 200,
            message: "Package deleted successfully",
            data: {message: "Package deleted successfully",
                id: deletedPackage._id
            }
        });
    } catch (error) {
        return next(error);
    }
}
