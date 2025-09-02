import mongoose from "mongoose";
import { NODE_ENV, DB_URI } from "../config/env";
import chalk from "chalk";

if (!DB_URI)
    throw new Error(`Please define DB_URI environment varialbe inside .env.${NODE_ENV}.local to connect the mongodb`);

const connectToDB = async () => {
    try {
        await mongoose.connect(DB_URI as string);
        console.log(chalk.green(`Connected to database in ${NODE_ENV} mode`));
    } catch (error) {
        console.error("Error connecting to database", error);
        process.exit(1);
    }
};

export default connectToDB;