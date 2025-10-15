// CRUD gói tập, quyền lợi, điều kiện; tìm gói phù hợp.
import Package from "../models/Package";
import { paginate } from "../utils/pagination";

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

export const updatePackageById = async (id, packageNewData) => {
    const pkg = await Package.findByIdAndUpdate(id, packageNewData, { new: true, runValidators: true });
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

export const changePackageStatus = async (id, status) => {
    if(!status) {
        const error = new Error("Status is required");
        error.statusCode = 400;
        error.code = "STATUS_REQUIRED";
        throw error;
    }
    if(status !== 'Active' && status !== 'Inactive' && status !== 'Draft') {
        const error = new Error("Status is invalid, must be Active, Inactive or Draft");
        error.statusCode = 400;
        error.code = "STATUS_INVALID";
        throw error;
    }
    const pkg = await Package.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!pkg) {
        const error = new Error("Package not found");
        error.statusCode = 404;
        error.code = "PACKAGE_NOT_FOUND";
        throw error;
    }
    return pkg;
}

export const getAllPackagesWithPagination = async (options) => {
    const query = {};
    if (options.status) {
        query.status = options.status;
    }
    if (options.search) {
        query.$or = [
            { name: { $regex: options.search, $options: 'i' } },
            {description: { $regex: options.search, $options: 'i' } },
        ];
    }
    if (options.type) {
        query.type = options.type;
    }

    if (options.packageCategory) {
        query.packageCategory = options.packageCategory;
    }

    if (options.membershipType) {
        query.membershipType = options.membershipType;
    }
    const packages = await paginate(Package, query, options);
    return packages;
}