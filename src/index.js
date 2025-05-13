// import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./db/dbconnect.js";
import { app } from "./app.js";
dotenv.config({ path: "./env" });

connectDB()
	.then(() => {
		app.listen(process.env.PORT, () => {
			console.log(`Server is running on port ${process.env.PORT}`);
		});
	})
	.catch((err) => {
		console.error(`MongoDB Connection failed Error: ${err.message}`);
		process.exit(1); // Exit process with failure
	});
