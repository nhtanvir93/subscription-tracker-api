import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import ms from "ms";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env";
import { CustomError } from "../middlewares/error.middleware";
import User from "../models/user.model";

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const error = new CustomError("User already exists");
            error.code = 409;
            throw error;
        }

        const newUsers = await User.create([{ name, email, password }]);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _newPassword, ...newUser } = newUsers[0].toObject();

        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN as ms.StringValue });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                token,
                user: newUser
            }
        });
    } catch (error) {
        next(error);
    }
};

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            const error = new CustomError("User not found");
            error.code = 404;
            throw error;
        }

        const passwordMatched = await bcrypt.compare(password, user.password);

        if (!passwordMatched) {
            const error = new CustomError("Password mismatched");
            error.code = 400;
            throw error;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _newPassword, ...userWithoutPassword } = user.toObject();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN as ms.StringValue });

        return res.status(201).json({
            success: true,
            message: "User signed in successfully",
            data: {
                token,
                user: userWithoutPassword
            }
        });
    } catch (error) {
        next(error);
    }
};