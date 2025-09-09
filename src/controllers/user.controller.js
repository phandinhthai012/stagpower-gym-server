import {
    getUserById,
    updateUser
} from "../services/user.service";
import response from "../utils/response";

export const getUserByIdController = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await getUserById(userId);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "User fetched successfully",
            data: user
        });
    } catch (error) {
        return next(error);
    }

}

export const updateMyProfileController = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { fullName, phone, gender, dateOfBirth, photo } = req.body;
        const payload = { fullName, phone, gender, dateOfBirth, photo };
        const user = await updateUser(userId, payload);
        return response(res, {
            success: true,
            statusCode: 200,
            message: "User updated successfully",
            data: user
        });
    } catch (error) {
        return next(error);
    }
}
