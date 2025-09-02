import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import User from "../models/user.model";

interface AuthPayload {
    userId: string;
}

const authorize = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const headers = req.headers;

        let token;

        if (headers.authorization && headers.authorization.startsWith("Bearer")) {
            token = headers.authorization.split(" ")[1];
        }

        if (!token)
            return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, JWT_SECRET as string) as AuthPayload;
        const user = await User.findById(decoded.userId, { password: false });

        if (!user)
            return res.status(401).json({ message: "Unauthorized" });

        req.user = user;

        next();
    } catch (error) {
        next(error);
    }
};

export default authorize;