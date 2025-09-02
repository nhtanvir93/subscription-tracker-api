import { NextFunction, Request, Response } from "express";
import User from "../models/user.model";
import { CustomError } from "../middlewares/error.middleware";

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find({}, { password: false });
        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.params.id, { password: false });

        if (!user) {
            const error = new CustomError("User not found");
            error.code = 404;
            throw error;
        }

        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);

        if (!user) {
            const error = new CustomError("User not found for update");
            error.code = 404;
            throw error;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...req.body
        }, {
            new: true,
            projection: { password: false }
        });

        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);

        if (deleted)
            res.status(200).json({ success: true, message: "User deleted successfully" });
        else
            res.status(404).json({ success: true, message: "User not found for delete" });
    } catch (error) {
        next(error);
    }
};