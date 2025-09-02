import { Router } from "express";
import {
    getSubscription, getSubscriptions, createSubscription, updateSubscription,
    deleteSubscription, getUserSubscriptions, cancelSubscription, getUpcomingRenewalSubscriptions
} from "../controllers/subscription.controller";

const subscriptionRouter = Router();

subscriptionRouter.get("/", getSubscriptions);

subscriptionRouter.get("/upcoming-renewals", getUpcomingRenewalSubscriptions);

subscriptionRouter.get("/:id", getSubscription);

subscriptionRouter.post("/", createSubscription);

subscriptionRouter.put("/:id", updateSubscription);

subscriptionRouter.delete("/:id", deleteSubscription);

subscriptionRouter.get("/user/:id", getUserSubscriptions);

subscriptionRouter.put("/:id/cancel", cancelSubscription);

export default subscriptionRouter;