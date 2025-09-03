import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();


export const register = async (data) => {
    const {
        email,
        password,
        phone,
        fullName,
        role,
        dateOfBirth,
        gender } = data;

    const existingUser = await User.findOne({email});
    if(existingUser) {
        const error = new Error("User already exists");
        error.statusCode = 409;
        error.code = "DUPLICATE_KEY";
        throw error;
    }

    const newUser = await User.create({
        email,
        password,
        phone,
        fullName,
        role,
        dateOfBirth,
        gender
    });
    return newUser;
}