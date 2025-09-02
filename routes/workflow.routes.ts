import { Router } from "express";
import { sendRenewalReminders } from "../controllers/workflow.controller";

const workflowRouter = Router();

workflowRouter.post("/subscription/reminder", sendRenewalReminders);

export default workflowRouter;