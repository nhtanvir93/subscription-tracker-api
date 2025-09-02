import { NextFunction, Request, Response } from "express";
import aj from "../config/arc";

const arcjetMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decision = await aj.protect(req, { requested: 1 });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit())
                return res.status(429).json({ "message": "Rate limit exceeded" });

            if (decision.reason.isBot())
                return res.status(403).json({ "message": "Bot detected" });

            return res.status(403).json({ message: "Access Denied" });
        }

        next();
    } catch (error) {
        next(error);
    }
};

export default arcjetMiddleware;