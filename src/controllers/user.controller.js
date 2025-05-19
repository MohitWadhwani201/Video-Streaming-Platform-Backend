import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const generateAccessandRefreshToken = async (userId) => {
	try {
		const user = await User.findById(userId);
		const refreshToken = user.createRefreshToken();
		const accessToken = user.generateAccessToken();
		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });
		return { accessToken, refreshToken };
	} catch (err) {
		throw new ApiError(500, "Something went wrong while generating tokens");
	}
};
const register = asyncHandler(async (req, res) => {
	//get user details from frontend
	//validate user details
	//check if user already exists
	//Avatar is there or not cover image optional
	// upload them to cloudinary
	//create user object- create entry in db
	//remove password and refresh token from response
	//check for user creation
	//return response
	const { username, email, password, fullname } = req.body;
	console.log(username, email, password, fullname);
	if ([fullname, username, email, password].some((field) => field?.trim() === "")) {
		throw new ApiError(400, "Please fill all the fields");
	}
	if (password.length < 6) {
		throw new ApiError(400, "Password must be at least 6 characters");
	}
	const exist = await User.findOne({
		$or: [{ username }, { email }],
	});
	if (exist) {
		throw new ApiError(409, "User or email already exists");
	}
	const avatarLocalPath = req.files?.avatar[0]?.path;
	console.log(req.files);
	//const coverLocalPath = req.files?.coverImage[0]?.path;
	let coverLocalPath;
	if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
		coverLocalPath = req.files.coverImage[0].path;
	}
	if (!avatarLocalPath) {
		throw new ApiError(400, "Avatar is required");
	}

	if (!fs.existsSync(avatarLocalPath)) {
		console.error("Avatar file does not exist:", avatarLocalPath);
	}
	const avatar = await uploadOnCloudinary(avatarLocalPath.replace(/\\/g, "/"));
	const coverImage = await uploadOnCloudinary(coverLocalPath?.replace(/\\/g, "/"));
	if (!avatar) {
		throw new ApiError(501, "Avatar upload failed");
	}
	const user = await User.create({
		fullname,
		avatar: avatar.url,
		coverImage: coverImage?.url || "",
		email,
		username: username.toLowerCase(),
		password,
	});
	const userCreated = await User.findById(user._id).select("-password -refreshToken  -createdAt -updatedAt");
	if (!userCreated) {
		throw new ApiError(500, "Something went wrong while creating user");
	}
	return res.status(201).json(new ApiResponse(200, userCreated, "User created successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
	//request body
	//validate request body
	//check if user exists according to email or username
	//check if password is correct
	//create access token and refresh token
	//send cookies

	const { username, email, password } = req.body;
	if (!(username || email)) {
		throw new ApiError(400, "Please provide username or email");
	}
	if (!password) {
		throw new ApiError(400, "Please provide password");
	}
	const user = await User.findOne({
		$or: [{ username }, { email }],
	});
	if (!user) {
		throw new ApiError(404, "User not found");
	}
	const isMatch = await user.isPasswordCorrect(password);
	if (!isMatch) {
		throw new ApiError(401, "Invalid credentials");
	}
	const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id);

	const looggedUser = await User.findById(user._id).select("-password -refreshToken ");
	const options = {
		httpOnly: true,
		secure: false,
		sameSite: "lax",
	};
	return res
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(new ApiResponse(200, { user: looggedUser, accessToken, refreshToken }, "User loged in successfully"))
		.status(200);
});
const logoutUser = asyncHandler(async (req, res) => {
	await User.findByIdAndUpdate(
		req.user._id,
		{
			$set: {
				refreshToken: undefined,
			},
		},
		{ new: true }
	);
	const options = {
		httpOnly: true,
		secure: true,
	};
	return res
		.status(200)
		.clearCookie("accessToken", options)
		.clearCookie("refreshToken", options)
		.json(new ApiResponse(200, {}, "User logged out successfully"));
});
export { register };
export { loginUser };
export { logoutUser };
