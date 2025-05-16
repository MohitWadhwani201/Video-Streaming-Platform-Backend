import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import jwt from "jsonwebtoken";
import User from "../models/user.models";

export const verifyJWT = asyncHandler(async (req, res, next) => {
	try {
		const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];
		if (!token) {
			throw new ApiError(401, "Unauthorized");
		}
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		const user = await User.findById(decoded?._id).select("-password -refreshToken");
		if (!user) {
			throw new ApiError(401, "Invalid Access Token");
		}
		req.user = user;
		next();
	} catch (error) {
		throw new ApiError(401, error?.message || "Unauthorized");
	}
});
