// CRUD gói tập, quyền lợi, điều kiện; tìm gói phù hợp.
import Package from "../models/Package";

export const createPackage = async (packageData) => {
    const newPackage = await Package.create(packageData);
    return newPackage;
}

export const getAllPackages = async () => {
    const packages = await Package.find();
    return packages;
}

export const getPackageById = async (id) => {
    const pkg = await Package.findById(id);
    if (!pkg) {
        const error = new Error("Package not found");
        error.statusCode = 404;
        error.code = "PACKAGE_NOT_FOUND";
        throw error;
    }
    return pkg;
}

export const updatePackageById = async (id, data) => {
    const pkg = await Package.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!pkg) {
        const error = new Error("Package not found");
        error.statusCode = 404;
        error.code = "PACKAGE_NOT_FOUND";
        throw error;
    }
    return pkg;
}
export const deletePackageById = async (id) => {
    const pkg = await Package.findByIdAndDelete(id);
    if (!pkg) {
        const error = new Error("Package not found");
        error.statusCode = 404;
        error.code = "PACKAGE_NOT_FOUND";
        throw error;
    }
    return pkg;
}

export const searchPackages = async (query) => {
    const packages = await Package.find(query);
    return packages;
}