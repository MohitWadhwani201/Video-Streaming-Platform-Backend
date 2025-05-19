import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
export const verifyJWT = asyncHandler(async (req, res, next) => {
	try {
		let token = null;

		// Check cookie first
		if (req.cookies && req.cookies.accessToken) {
			token = req.cookies.accessToken;
		} else {
			// Check Authorization header
			const authHeader = req.header("Authorization") || req.header("authorization");
			if (authHeader && authHeader.startsWith("Bearer ")) {
				token = authHeader.split(" ")[1];
			}
		}

		if (!token) {
			throw new ApiError(401, "Unauthorized: No token provided");
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
