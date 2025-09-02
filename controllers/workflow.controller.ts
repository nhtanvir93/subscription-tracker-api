import { WorkflowContext } from "@upstash/workflow";
import { serve } from "@upstash/workflow/express";
import dayjs from "dayjs";
import Subscription, { SubscriptionDocument } from "../models/subscription.model";

const renewalPeriods = [7, 5, 3, 2, 1];

export const sendRenewalReminders = serve<{ subscriptionId: string }>(async (context) => {
    const subscriptionId = context.requestPayload.subscriptionId;
    const subscription = await fetchSubscription(context, subscriptionId);

    if (!subscription) {
        console.log(`Workflow - Sending Renewal Reminders (${subscriptionId}) : No subscription found to run workflow`);
        return;
    }

    if (subscription.status !== "active") {
        console.log(`Workflow - Sending Renewal Reminders (${subscriptionId}) : no active subscription found to run workflow`);
        return;
    }

    const today = dayjs();

    for (const renewalPeriod of renewalPeriods) {
        const reminderDate = dayjs(subscription.renewalDate).subtract(renewalPeriod, "day");

        if (reminderDate.isSame(today, "day"))
            await triggerRenewalNotification(context, subscription, renewalPeriod);
        else if (reminderDate.isAfter(today))
            await sleepUntilRenewalNotification(context, subscription, renewalPeriod, reminderDate);
    }
});

const fetchSubscription = async (context: WorkflowContext, subscriptionId: string): Promise<SubscriptionDocument | null> => {
    return context.run("fetch subscription", async () => {
        return await Subscription.findById(subscriptionId);
    });
};

const triggerRenewalNotification = async (context: WorkflowContext, subscription: SubscriptionDocument, renewalPeriod: number): Promise<void> => {
    await context.run("sending notification", async () => {
        console.log(`Workflow - Sending Renewal Reminders (${subscription._id}) : email notification before ${renewalPeriod} days has been sent successfully`);
    });
};

const sleepUntilRenewalNotification = async (
    context: WorkflowContext,
    subscription: SubscriptionDocument,
    renewalPeriod: number,
    reminderDate: dayjs.Dayjs
): Promise<void> => {
    const label = `Workflow - Sending Renewal Reminders (${subscription._id}) : sleep for ${renewalPeriod} days until reminder at ${reminderDate.format("DD-MM-YYYY")}`;
    console.log(label);
    await context.sleepUntil(label, reminderDate.toDate());
};