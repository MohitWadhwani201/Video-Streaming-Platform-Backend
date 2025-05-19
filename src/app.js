import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(cookieParser());
app.use(express.json({ limit: "16mb" }));
app.use(express.urlencoded({ limit: "16mb", extended: true }));
app.use(express.static("public"));

app.use(cors({ origin: true, credentials: true }));

import userRouter from "./routes/user.routes.js";

//router declaration
app.use("/api/v1/users", userRouter);
export { app };
