import chalk from "chalk";
import cookieParser from "cookie-parser";
import express, { Express, Request, Response, Router } from "express";
import { PORT } from "./config/env";
import connectToDB from "./database/mongodb";
import errorMiddleware from "./middlewares/error.middleware";
import authRouter from "./routes/auth.routes";
import subscriptionRouter from "./routes/subscription.routes";
import userRouter from "./routes/user.routes";
import arcjetMiddleware from "./middlewares/arcjet.middleware";
import authorize from "./middlewares/auth.middleware";

const app: Express = express();

app.use(arcjetMiddleware);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to Subscription Tracker API!!!");
});

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", authorize, userRouter);
apiRouter.use("/subscriptions", authorize, subscriptionRouter);

app.use("/api/v1", apiRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(chalk.green(`Subscription Tracker API is running on http://localhost:${PORT}`));
    connectToDB();
});

export default app; 