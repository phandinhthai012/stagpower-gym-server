import CheckIn from "../models/CheckIn.js";


const createCheckIn = async (checkInData) => {
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
    checkIn.checkOut();
    return checkIn;
};



export {
    createCheckIn,
    getCheckInById,
    updateCheckInById,
    getCheckInByMemberId,
    getCheckInByCheckInTime,
    getAllCheckIns,
    checkOutCheckIn

};