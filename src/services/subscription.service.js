import Subscription from "../models/Subscription";
import Package from "../models/Package";
import User from "../models/User";


export const createSubscription = async (subscriptionData) => {
    
    const existPackage = await Package.findById(subscriptionData.packageId);
    if (!existPackage) {
        const error = new Error("Package not found");
        error.statusCode = 404;
        error.code = "PACKAGE_NOT_FOUND";
        throw error;
    }
    const memberExists = await User.findById(subscriptionData.memberId);
    if (!memberExists) {
        const error = new Error("Member not found");
        error.statusCode = 404;
        error.code = "MEMBER_NOT_FOUND";
        throw error;
    }
    // cần xem lại logic này
    const existSubscription = await Subscription.findOne({ 
        memberId: subscriptionData.memberId, 
        type: subscriptionData.type,
        status: 'Active' });

    if (existSubscription) {
        const error = new Error("Subscription already exists");
        error.statusCode = 400;
        error.code = "SUBSCRIPTION_ALREADY_EXISTS";
        throw error;
    }

    const newSubscription = await Subscription.create(subscriptionData);
    return newSubscription;
};

export const getAllSubscriptions = async () => {
    const subscriptions = await Subscription.find();
    return subscriptions;
};

export const getSubscriptionById = async (id) => {
    const subscription = await Subscription.findById(id);
    return subscription;
};

export const getAllSubscriptionsByMember = async (memberId) => {
    const subscriptions = await Subscription.find({ memberId }).sort({ createdAt: -1 });
    return subscriptions;
};


export const updateSubscription = async (id, subscriptionNewData) => {
    const subscription = await Subscription.findByIdAndUpdate(id, subscriptionNewData, { new: true, runValidators: true });
    if (!subscription) {
        const error = new Error("Subscription not found");
        error.statusCode = 404;
        error.code = "SUBSCRIPTION_NOT_FOUND";
        throw error;
    }
    return subscription;
};

export const deleteSubscription = async (id) => {
    const subscription = await Subscription.findByIdAndDelete(id);
    if (!subscription) {
        const error = new Error("Subscription not found");
        error.statusCode = 404;
        error.code = "SUBSCRIPTION_NOT_FOUND";
        throw error;
    }
    return subscription;
};

// thêm service như gia hạn, kế thừ PT, tạm ngưng, hủy gói, 