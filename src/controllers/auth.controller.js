import { register } from "../services/auth.service";
import response from "../utils/response";

export const registerController = async (req, res, next) => {
    try {
        const {email, password, phone, fullName, role, dateOfBirth, gender} = req.body;
        const user = await register({email, password, phone, fullName, role, dateOfBirth, gender});
        return response(res, {
            success: true,
            statusCode: 201,
            message: "User registered successfully",
            data: user
        });
    } catch (error) {
        // để errorHandler handle
        return next(error);
    }
}