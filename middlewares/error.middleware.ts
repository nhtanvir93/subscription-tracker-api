import { NextFunction, Request, Response } from "express";

interface Error {
    path: string;
    message: string;
}

export class CustomError extends Error {
    code: number;
    errors?: Error[];
    validationErrors?: Error[];

    constructor(message: string, code = 500) {
        super(message);
        this.name = "CustomError";
        this.code = code;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}

const errorMiddleware = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    try {
        let error = { ...err };
        error.message = err.message;

        console.error(error);

        if (err.name === "CastError") {
            const message = "Resource not found";
            error = new CustomError(message);
            error.code = 404;
        }

        if (err.name === "ValidationError") {
            error = new CustomError("Validation Errors");
            error.code = 422;
            error.validationErrors = Object.values(err.errors || {}).map(error => ({ path: error.path, message: error.message }));
        }

        if (err.code === 11000) {
            const message = "Duplicate field value entered";
            error = new CustomError(message);
            error.code = 400;
        }

        if (!error.validationErrors)
            return res.status(error.code || 500).json({ success: false, message: error.message || "Server Error" });

        return res.status(error.code).json({ success: false, message: error.message, errors: error.validationErrors });

    } catch (error) {
        next(error);
    }
};

export default errorMiddleware;