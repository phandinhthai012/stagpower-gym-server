import CheckIn from "../models/CheckIn.js";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import { paginate } from "../utils/pagination";
import { generateQRCode, validateQRCode } from "../utils/QRCode/qrCode.js";

const createCheckIn = async (checkInData) => {
    // kiểm tra member có thời hạn không
    const member = await User.findById(checkInData.memberId);
    if (!member) {
        const error = new Error("Member not found");
        error.statusCode = 404;
        error.code = "MEMBER_NOT_FOUND";
        throw error;
    }
    
    // 2. Check member có phải role 'member' không
    if (member.role !== 'member') {
        const error = new Error("Only members can check in");
        error.statusCode = 400;
        error.code = "INVALID_ROLE";
        throw error;
    }
     // 3. Check member có bị cấm không
     if (member.status === 'banned') {
        const error = new Error("Member is banned");
        error.statusCode = 403;
        error.code = "MEMBER_BANNED";
        throw error;
    }
     // 4. ✅ QUAN TRỌNG: Check subscription theo nghiệp vụ
     const activeSubscription = await Subscription.findOne({
        memberId: member._id,
        type: { $in: ['Membership', 'Combo'] },
        status: 'Active',
        endDate: { $gte: new Date() },
        isSuspended: false
    });
    if (!activeSubscription) {
        const error = new Error("Member does not have an active subscription");
        error.statusCode = 400;
        error.code = "MEMBER_NO_ACTIVE_SUBSCRIPTION";
        throw error;
    }
    // 5. ✅ NGHIỆP VỤ: Chỉ cho phép Membership và Combo check-in
    if (activeSubscription.type === 'PT') {
        const error = new Error("PT subscription does not allow gym access");
        error.statusCode = 403;
        error.code = "PT_SUBSCRIPTION_NO_GYM_ACCESS";
        throw error;
    }
    
    // 6. Check branch access (nếu subscription có giới hạn branch)
    if (activeSubscription.branchId && activeSubscription.branchId.toString() !== checkInData.branchId) {
        const error = new Error("Subscription not valid for this branch");
        error.statusCode = 403;
        error.code = "INVALID_BRANCH";
        throw error;
    }
    // 7. Check member có đang check-in ở chi nhánh khác không
    const activeCheckIn = await CheckIn.findOne({
        memberId: member._id,
        status: 'Active'
    });
    if (activeCheckIn) {
        const error = new Error("Member is already checked in");
        error.statusCode = 400;
        error.code = "ALREADY_CHECKED_IN";
        throw error;
    }

    const checkIn = await CheckIn.create(checkInData);
    return checkIn;
};

const getAllCheckIns = async () => {
    const checkIns = await CheckIn.find();
    return checkIns;
};

const getCheckInById = async (id) => {
    const checkIn = await CheckIn.findById(id);
    if (!checkIn) {
        const error = new Error("CheckIn not found");
        error.statusCode = 404;
        error.code = "CHECKIN_NOT_FOUND";
        throw error;
    }
    return checkIn;
};

const updateCheckInById = async (id, checkInData) => {
    const checkIn = await CheckIn.findByIdAndUpdate(id, checkInData, { new: true, runValidators: true });
    if (!checkIn) {
        const error = new Error("CheckIn not found");
        error.statusCode = 404;
        error.code = "CHECKIN_NOT_FOUND";
        throw error;
    }
    if(checkIn.checkOutTime) {
        await checkIn.save();
    }
    return checkIn;
};

const getCheckInByMemberId = async (memberId) => {
    const checkIns = await CheckIn.findByMember(memberId);
    return checkIns;
};

const getCheckInByCheckInTime = async (checkInTime) => {
    const checkIn = await CheckIn.find({ checkInTime: checkInTime });
    return checkIn;
};

const checkOutCheckIn = async (id) => {
    const checkIn = await CheckIn.findById(id);
    if (!checkIn) {
        const error = new Error("CheckIn not found");
        error.statusCode = 404;
        error.code = "CHECKIN_NOT_FOUND";
        throw error;
    }
    await checkIn.checkOut();
    return checkIn;
};

const getAllCheckInsWithPagination = async (options) => {
    const checkIns = await paginate(CheckIn, {}, options);
    return checkIns;
}

// phần QR Code check in 
const generateQRCodeCheckIn = async (data) => {
    const { memberId } = data;
    const qrCode = await generateQRCode({ memberId });
    // ổn sẽ lưu vào db collection user.memberInfo.qr_code
    const user = await User.findById(memberId);
    if(!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.code = "USER_NOT_FOUND";
        throw error;
    }
    user.memberInfo.qr_code = qrCode;
    await user.save();
    return qrCode;
}
const processQRCodeCheckIn = async (data) => {
    const { token, branchId } = data;
    if(!token) {
        const error = new Error("Token QR Code is required");
        error.statusCode = 400;
        error.code = "TOKEN_QR_CODE_REQUIRED";
        throw error;
    }
    const validationResult = validateQRCode(token);
    if(!validationResult.isValid) {
        const error = new Error(validationResult.error);
        error.statusCode = 400;
        error.code = "INVALID_QR_CODE";
        throw error;
    }
    const { memberId } = validationResult.data;
    const checkIn = await createCheckIn({
        memberId,
        branchId,
        checkInMethod: 'QR_Code',
     });
    return checkIn;
}



export {
    createCheckIn,
    getCheckInById,
    updateCheckInById,
    getCheckInByMemberId,
    getCheckInByCheckInTime,
    getAllCheckIns,
    checkOutCheckIn,
    getAllCheckInsWithPagination,
    generateQRCodeCheckIn,
    processQRCodeCheckIn

};