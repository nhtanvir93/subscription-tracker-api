import { model, Schema, Document } from "mongoose";
import { UserDocument } from "./user.model";

export interface SubscriptionDocument extends Document {
    name: string;
    price: number;
    currency: "USD" | "BDT" | "EUR";
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    paymentMethod: string;
    status: "active" | "cancelled" | "expired";
    startDate: Date;
    renewalDate?: Date;
    category: "sports" | "news" | "entertainment" | "lifestyle" | "technology" | "finance" | "politics" | "others";
    user: UserDocument;
    createdAt?: Date;
    updatedAt?: Date;
}

const subscriptionSchema = new Schema({
    name: {
        type: String,
        required: [true, "Subscription Name is required"],
        trim: true,
        minLength: [3, "Subscription Name must contain at least 3 characters."],
        maxLength: [255, "Subscription Name must not exceed 255 characters."]
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        validate: {
            validator: (value: number) => value > 0,
            message: "Price must be greater than 0."
        }
    },
    currency: {
        type: String,
        enum: ["USD", "BDT", "EUR"],
        default: "BDT"
    },
    frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
        required: [true, "Frequency is required."]
    },
    category: {
        type: String,
        enum: ["sports", "news", "entertainment", "lifestyle", "technology", "finance", "politics", "others"],
        required: [true, "Category is required."]
    },
    paymentMethod: {
        type: String,
        required: [true, "Payment Method is required."],
        trim: true
    },
    status: {
        type: String,
        enum: ["active", "cancelled", "expired"],
        default: "active"
    },
    startDate: {
        type: Date,
        required: [true, "Start Date is required."],
        validate: {
            validator: (value: Date) => value <= new Date(),
            message: "Start Date must be past or today"
        }
    },
    renewalDate: {
        type: Date,
        validate: {
            validator: function (this: SubscriptionDocument, value: Date) {
                return value > this.startDate;
            },
            message: "Renewal Date must be greater than Start Date"
        }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    }
}, { timestamps: true });

subscriptionSchema.pre("save", function (this: SubscriptionDocument, next: () => void) {
    if (!this.renewalDate) {
        const renewalPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365
        };

        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
    }

    if (this.renewalDate < new Date())
        this.status = "expired";

    next();
});

const Subscription = model<SubscriptionDocument>("Subscription", subscriptionSchema);

export default Subscription;