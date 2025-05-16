import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiErrors.js';
import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
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
    const {username,email,password,fullname }=req.body 
    console.log(username, email, password, fullname);
    if ([fullname, username, email, password].some((field) =>
        field?.trim() ==="")) 
    {
        throw new ApiError(400, "Please fill all the fields");
    }
    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }
    const exist = User.findOne({
        $or: [{username},{email}]
    })
    if(exit){
        throw new ApiError(409, "User or email already exists");
    }
    const avatarLocalPath=req.files?.avatar[0]?.path
    console.log(req.files);
    const coverLocalPath = req.files?.coverImage[0]?.path
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }
    const avatar =await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverLocalPath)
    if(!avatar){
        throw new ApiError(501, "Avatar upload failed");
    }
    const user =await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password
    })
    const userCreated = User.findById(user._id).select(
        "-password -refreshToken  -createdAt -updatedAt"
    )
    if(!userCreated){
        throw new ApiError(500, "Something went wrong while creating user");
    }
    return res
        .status(201)
        .json(new ApiResponse(200, userCreated, "User created successfully"));
})

export {register}