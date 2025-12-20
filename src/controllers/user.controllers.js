import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uplodeOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefershTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "somthing went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    const { fullName, email, username, password } = req.body
    // console.log("email: ", email);
    // validation - not NULL
    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    // check if user already exists: user, email
    const existedUser = await User.findOne(
        {
            $or: [{ email }, { username }]
        }
    )
    if (existedUser) {
        throw new ApiError(409, "User with emial or username already exists")
    }
    // check for images, and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    } else {
        throw new ApiError(400, "avatar file is required");
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required")
    }
    // upload them in cloudinary, avatar
    const avatar = await uplodeOnCloudinary(avatarLocalPath)
    const coverImage = await uplodeOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400, "avatar file is required")
    }
    // cerate user object - create enter in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // check for user creation 
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registring the user")
    }
    // retrurn res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )
});

const loginUser = asyncHandler(async (req, res) => {
    // req body - data
    const { email, username, password } = req.body;
    // username or email
    if (!username && !email) {
        throw new ApiError(400, "username or emial is required")
    }
    // find the user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    // password check 
    if (!user) {
        throw new ApiError(404, "user does not exist")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "invalid user")
    }
    // access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefershTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    // send cookie
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                user:
                    loggedInUser,
                accessToken,
                refreshToken
            },
                "user logged In Successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out"))

})

export { registerUser, loginUser, logoutUser };