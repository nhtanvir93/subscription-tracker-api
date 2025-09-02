import { NextFunction, Request, Response } from "express";
import Subscription from "../models/subscription.model";
import { CustomError } from "../middlewares/error.middleware";
import workflowClient from "../config/uptash";
import { SERVER_URL } from "../config/env";

export const getSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subscriptions = await Subscription.find().populate("user", "_id name email");
        res.status(200).json({ success: true, data: subscriptions });
    } catch (error) {
        next(error);
    }
};

export const getSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subscription = await Subscription.findById(req.params.id).populate("user", "_id email name");

        if (!subscription) {
            const error = new CustomError("No subscription found");
            error.code = 404;
            throw error;
        }

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

export const createSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subscription = await Subscription.create({ ...req.body, user: req.user?._id });

        const { workflowRunId } = await workflowClient.trigger({
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            body: {
                subscriptionId: subscription._id
            },
            headers: {
                "Content-Type": "application/json"
            },
            retries: 0
        });

        res.status(200).json({ success: true, data: { subscription, workflowRunId } });
    } catch (error) {
        next(error);
    }
};

export const updateSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subscriptionId = req.params.id;
        const subscription = await Subscription.findById(subscriptionId);

        if (!subscription) {
            const error = new CustomError("No subscription found for update");
            error.code = 404;
            throw error;
        }

        const updatedSubscription = await Subscription.findByIdAndUpdate(subscriptionId, { ...req.body }, { new: true });
        res.status(200).json({ success: true, message: "Subscription updated successfully", data: updatedSubscription });
    } catch (error) {
        next(error);
    }
};

export const deleteSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deleted = await Subscription.findByIdAndDelete(req.params.id);

        if (!deleted) {
            const error = new CustomError("No subscription found for delete");
            error.code = 404;
            throw error;
        }

        res.status(200).json({ success: true, message: "Subscription deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const getUserSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;

        if (userId !== req.user?.id) {
            const error = new CustomError("Sorry, your are not the owner");
            error.code = 401;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: userId }).populate("user", "_id name email");
        res.status(200).json({ success: true, data: subscriptions });
    } catch (error) {
        next(error);
    }
};

export const cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subscriptionId = req.params.id;
        const subscription = await Subscription.findById(subscriptionId);

        if (!subscription) {
            const error = new CustomError("No subscription found for update");
            error.code = 404;
            throw error;
        }

        if (subscription.status === "cancelled") {
            const error = new CustomError("Subscription cancelled already");
            error.code = 400;
            throw error;
        }

        const updatedSubscription = await Subscription.findByIdAndUpdate(subscriptionId, { status: "cancelled" }, { new: true });
        res.status(200).json({ success: true, message: "Subscription cancelled successfully", data: updatedSubscription });
    } catch (error) {
        next(error);
    }
};

export const getUpcomingRenewalSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const subscriptions = await Subscription.find({ renewalDate: { $gte: today } }).populate("user", "_id name email");
        res.status(200).json({ success: true, data: subscriptions });
    } catch (error) {
        next(error);
    }
};
