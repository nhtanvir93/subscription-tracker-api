import { Router } from "express";
import { deleteUser, getUser, getUsers, updateUser } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/", getUsers);

userRouter.get("/:id", getUser);

userRouter.put("/:id", updateUser);

userRouter.delete("/:id", deleteUser);

export default userRouter;