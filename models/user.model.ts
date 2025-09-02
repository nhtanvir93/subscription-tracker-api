import bcrypt from "bcryptjs";
import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "User Name is required."],
        minLength: [3, "User Name must contain at least 3 characters."],
        maxLength: [255, "User Name must not exceed 255 characters."],
        trim: true
    },
    email: {
        type: String,
        unique: [true, "Provided email already exists. Please fill a different email."],
        required: [true, "Email is required."],
        minLength: [3, "Email must contain at lease 3 characters."],
        maxLength: [255, "Email must not contain more than 255 characters."],
        match: [/\S+@\S+\.\S+/, "Please fill a valid email address."],
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        minLength: [8, "Password must contain at least 8 characters."],
        maxLength: [50, "Password must not exceed 50 characters"],
        trim: true
    }
}, { timestamps: true });

userSchema.pre("save", async function (next: () => void) {
    if (this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    next();
});

const User = model("User", userSchema);

type IUser = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<IUser>;

export default User;