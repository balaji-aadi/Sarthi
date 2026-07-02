import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { User } from "../../models/user.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { FCMDevice } from "../../models/fcmdevice.model.js";
import { UserRole } from "../../models/role.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import axios from "axios";
import crypto from "crypto";

const uc = {}

const generateAccessAndRefereshTokens = async (res, user) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong while generating tokens"));
  }
};


uc.registerUser = asyncHandler(async (req, res) => {
  console.log("user register Req.body", req.body);
  const {
    email,
    userRole,
    userRoles,
    firstName,
    lastName,
    phoneNumber,
    address,
    profileImage,
    password,

  } = req.body;

  // Allow userRoles OR userRole
  const requiredFields = {
    email, firstName, lastName, password, phoneNumber
  };

  const missingFields = Object.keys(requiredFields).filter(
    (field) => !requiredFields[field] || requiredFields[field] === "undefined"
  );

  if (!userRole && (!userRoles || userRoles.length === 0)) {
     missingFields.push("userRoles");
  }

  if (missingFields.length > 0) {
    return res.status(400).json(new ApiError(400, `Missing required field: ${missingFields.join(", ")}`));
  }

  const existedUser = await User.findOne({ $or: [{ phoneNumber }, { email }] });

  if (existedUser) {
    return res.status(400).json(new ApiError(400, "User with email or phone already exists"));
  }

  // Handle roles: if userRoles provided use it, else wrap userRole in array
  let rolesToSave = userRoles;
  if (!rolesToSave && userRole) {
      rolesToSave = [userRole];
  }

  const user = await User.create({
    email,
    userRole: userRole || (rolesToSave && rolesToSave[0]), // Backward compatibility
    userRoles: rolesToSave,
    firstName,
    lastName,
    phoneNumber,
    address,
    profileImage,
    password,
  });

  const createdUser = await User.findById(user._id)
    .select("-password -refreshToken -otp -otp_time")
    .populate("userRoles")
    .populate("userRole"); // populate both for now

  if (!createdUser) {
    return res.status(500).json(new ApiError(500, "Something went wrong while registering the user"));
  }

  return res.status(201).json(new ApiResponse(200, createdUser, "User registered Successfully"));

});


uc.loginUser = asyncHandler(async (req, res) => {
  try {
    console.log("Login Req.body", req.body);
    const { email, password } = req.body;

    const requiredFields = {
      email, password
    };

    const missingFields = Object.keys(requiredFields).filter(
      (field) => !requiredFields[field] || requiredFields[field] === "undefined"
    );

    if (missingFields.length > 0) {
      return res.status(400).json(new ApiError(400, `Missing required field: ${missingFields.join(", ")}`));
    }

    let user;
    user = await User.findOne({ email: email }).populate("userRole").populate("userRoles");
    if (!user) return res.status(400).json(new ApiError(400, "Invalid user credentials"));

    if (user.isActive === false) {
      return res.status(403).json(new ApiError(403, "The account is disabled. Contact the admin to enable"));
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(401).json(new ApiError(401, "Invalid user credentials"));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(res, user);

    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;
    delete loggedInUser.otp;
    delete loggedInUser.otpTime;

    const options = { httpOnly: true, secure: true };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged In Successfully"));

  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }

});


uc.logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});


uc.refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(420).json(new ApiError(420, "Unauthorized request"));
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      return res.status(420).json(new ApiError(420, "Invalid refresh token"));
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      return res
        .status(420)
        .json(new ApiError(420, "Refresh token is expired or used"));
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
  } catch (error) {
    return res
      .status(420)
      .json(new ApiError(420, error?.message || "Invalid refresh token"));
  }
});


uc.changeCurrentPassword = asyncHandler(async (req, res) => {
  console.log("change password Req.body", req.body);
  const { oldPassword, newPassword } = req.body;

  const requiredFields = { oldPassword, newPassword };

  const missingFields = Object.keys(requiredFields).filter(
    (field) => !requiredFields[field] || requiredFields[field] === "undefined"
  );

  if (missingFields.length > 0) {
    return res.status(400).json(new ApiError(400, `Missing required field: ${missingFields.join(", ")}`));
  }

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    return res.status(400).json(new ApiError(400, "Invalid old password"));
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});


uc.getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

uc.updateAccountDetails = asyncHandler(async (req, res) => {
  console.log("user update Req.body", req.body);
  console.log("user update Req.file", req.file);
  const { email, firstName, lastName, phoneNumber, address } = req.body;
  const imageLocalPath = req.file?.path;

  const existingUser = await User.findById(req.user?._id)
  if (!existingUser) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  let image = existingUser.profileImage;
  if (imageLocalPath) {
    try {
      const [deleteResult, uploadResult] = await Promise.all([
        existingUser.profileImage ? deleteFromCloudinary(existingUser.profileImage) : Promise.resolve(),
        uploadOnCloudinary(imageLocalPath)
      ]);
      if (!uploadResult?.url) {
        return res.status(400).json(new ApiError(400, "Error while uploading image"));
      }
      image = uploadResult.url
    } catch (error) {
      return res.status(500).json(new ApiError(500, "Image handling failed"));
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        email,
        firstName,
        lastName,
        phoneNumber,
        address,
        profile_image: image,
      },
    },
    { new: true }
  ).select("-password -refreshToken -userRole -otp -otp_time");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));

});

uc.generateOTP = asyncHandler(async (req, res) => {
  console.log("generate otp Req.body", req.body);
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(new ApiError(400, "email is required"));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  console.log("otp", otp);

  let user;
  user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }
  user.otp = otpHash;
  user.otpTime = new Date();
  await user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Forgot Password OTP",
    text: `Dear User, Your Forgot Password OTP is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);

  return res.status(200).json(new ApiResponse(200, "OTP sent successfully"));
});


uc.verifyOTP = asyncHandler(async (req, res) => {
  console.log("verify otp Req.body", req.body);
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json(new ApiError(400, "email and otp is required"));
  }

  let user;
  user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) {
    return res.status(400).json(new ApiError(400, "Invalid OTP"));
  }

  const expirationTime = 5 * 60 * 1000;
  if (new Date() - new Date(user.otpTime) > expirationTime) {
    return res.status(400).json(new ApiError(400, "OTP Expired"));
  }
  return res.status(200).json(new ApiResponse(200, "OTP verified"));

});


uc.resetPassword = asyncHandler(async (req, res) => {
  console.log("reset password Req.body", req.body);
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json(new ApiError(400, "email and new password is required"));
  }

  let user;
  user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }
  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset successfully"));
});


uc.getAllUsers = asyncHandler(async (req, res) => {
  console.log("Req.body", req.body);

  const { filter = {}, sortOrder = -1 } = req.body;
  const userRole = await UserRole.findOne({ name: "projectmanager" });

  let query = { "branchAccess.branchId": req.branchId };

  if(filter.type == "member") {
    // Check if userRoles does NOT contain the projectmanager role
    query = { 
        ...query,
        userRoles: { $nin: [userRole?._id] } 
    }
  }

  const user = await User.find(query)
    .populate("userRole")
    .populate("userRoles")
    .sort({ _id: sortOrder });

  return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});


uc.getUserById = asyncHandler(async (req, res) => {

  if (req.params.userId == "undefined" || !req.params.userId) {
    return res.status(400).json(new ApiError(400, "id not provided"));
  }

  const user = await User.findById(req.params.userId)
    .populate("userRole")
    .populate("userRoles");

  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));

});


uc.updateUser = asyncHandler(async (req, res) => {
  console.log("Req.body", req.body);

  if (req.params.userId == "undefined" || !req.params.userId) {
    return res.status(400).json(new ApiError(400, "id not provided"));
  }

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json(new ApiError(400, "No data provided to update"))
  }

  const { email, userRole, userRoles, firstName, lastName, phoneNumber, address, profileImage } = req.body;

  let updateData = {
        email,
        firstName,
        lastName,
        phoneNumber,
        address,
        profileImage,
  };

  if (userRoles) {
      updateData.userRoles = userRoles;
      if (userRoles.length > 0) updateData.userRole = userRoles[0]; // sync
  } else if (userRole) {
      updateData.userRole = userRole;
      updateData.userRoles = [userRole]; // sync
  }


  const updatedUser = await User.findByIdAndUpdate(
    req.params.userId,
    {
      $set: updateData,
    },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));

});

uc.bulkUpdateUserStatus = asyncHandler(async (req, res) => {
  const { userIds, isActive } = req.body;
  
  if (!userIds || !Array.isArray(userIds) || typeof isActive !== 'boolean') {
    return res.status(400).json(new ApiError(400, "userIds array and isActive boolean are required"));
  }

  // Find the admin role ID
  const adminRole = await UserRole.findOne({ name: "admin" });
  let query = { _id: { $in: userIds } };

  // If we found the admin role, exclude users who have it
  if (adminRole) {
      query.userRole = { $ne: adminRole._id };
      query.userRoles = { $ne: adminRole._id };
  }

  const result = await User.updateMany(query, { $set: { isActive } });

  return res.status(200).json(new ApiResponse(200, {}, `Successfully ${isActive ? 'enabled' : 'disabled'} ${result.modifiedCount} users (Admins were skipped)`));
});


uc.createFCMToken = asyncHandler(async (req, res) => {
  console.log("Req.body -----", req.body);
  const { user_id, fcm_token, device_type, device_id } = req.body;
 
  const requiredFields = {
    user_id, fcm_token, device_type,
    ...(device_type !== "web" && { device_id }),
  };
 
  const missingFields = Object.keys(requiredFields).filter(
    (field) => !requiredFields[field] || requiredFields[field] === "undefined"
  );
 
  if (missingFields.length > 0) {
    return res.status(400).json(new ApiError(400, `Missing required field: ${missingFields.join(", ")}`));
  }
 
  try {
    const query = { user_id, device_type };
    if (device_type !== "web") {
      query.device_id = device_id;
    } else {
      query.fcm_token = fcm_token;
    }
 
    const existingDevice = await FCMDevice.findOne(query);
 
    if (existingDevice) {
        existingDevice.fcm_token = fcm_token;
        await existingDevice.save();
        return res.status(201).json(new ApiResponse(200, "FCM token created successfully"));
 
    } else {
      const newDevice = await FCMDevice.create({
        user_id,
        fcm_token,
        device_type,
        device_id
      });
      console.log("Created Token -----", newDevice);
      return res.status(201).json(new ApiResponse(200, "FCM token created successfully"));
    }
 
  } catch (error) {
      console.error("Error:", error);
      return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
 
})


uc.zohoLogin = asyncHandler(async (req, res) => {
  const { code, accountsServer } = req.body;

  if (!code || !accountsServer) {
    return res.status(400).json(new ApiError(400, "Missing required parameters: code or accountsServer"));
  }

  // SSRF Protection: Validate Zoho Accounts Server domain
  const allowedZohoDomains = /^https:\/\/accounts\.zoho\.(com|in|eu|com\.au|com\.cn|ca|jp|fr|de|uk)$/i;
  if (!allowedZohoDomains.test(accountsServer)) {
    return res.status(400).json(new ApiError(400, "Invalid accounts server domain"));
  }

  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const redirectUri = process.env.ZOHO_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).json(new ApiError(500, "Zoho OAuth environment variables are not configured on the server"));
  }

  try {
    // Exchange Authorization Code for Access Token
    const tokenResponse = await axios.post(`${accountsServer}/oauth/v2/token`, null, {
      params: {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      }
    });

    const { access_token } = tokenResponse.data;
    if (!access_token) {
      console.error("Zoho Token Exchange Error Response:", tokenResponse.data);
      return res.status(400).json(new ApiError(400, tokenResponse.data.error || "Failed to exchange Zoho authorization code"));
    }

    // Retrieve User Info from Zoho
    const userInfoResponse = await axios.get(`${accountsServer}/oauth/v2/userinfo`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const userInfo = userInfoResponse.data;
    if (!userInfo || !userInfo.email) {
      console.error("Zoho User Info Fetch Error Response:", userInfoResponse.data);
      return res.status(400).json(new ApiError(400, "Failed to retrieve user email from Zoho account"));
    }

    const email = userInfo.email.toLowerCase();
    
    // Check if user already exists
    let user = await User.findOne({ email }).populate("userRole").populate("userRoles");

    if (user) {
      if (user.isActive === false) {
        return res.status(403).json(new ApiError(403, "The account is disabled. Contact the admin to enable"));
      }

      const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(res, user);

      const loggedInUser = user.toObject();
      delete loggedInUser.password;
      delete loggedInUser.refreshToken;
      delete loggedInUser.otp;
      delete loggedInUser.otpTime;

      const options = { httpOnly: true, secure: true };
      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Logged in via Zoho successfully"));
    } else {
      // Auto-register new Zoho user
      const firstName = userInfo.first_name || userInfo.given_name || userInfo.name?.split(" ")[0] || "Zoho";
      const lastName = userInfo.last_name || userInfo.family_name || userInfo.name?.split(" ").slice(1).join(" ") || "";
      
      // Find employee/user role for defaults
      let role = await UserRole.findOne({ name: "employee" });
      if (!role) {
        role = await UserRole.findOne({ name: "user" });
      }

      // Generate a strong random password
      const generatedPassword = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(-10) + "A1!";

      const newUser = await User.create({
        email,
        firstName,
        lastName,
        password: generatedPassword,
        userRole: role ? role._id : undefined,
        userRoles: role ? [role._id] : [],
        isActive: true,
        profileImage: userInfo.profile_pic_url || null,
      });

      const populatedUser = await User.findById(newUser._id).populate("userRole").populate("userRoles");

      const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(res, populatedUser);

      const loggedInUser = populatedUser.toObject();
      delete loggedInUser.password;
      delete loggedInUser.refreshToken;
      delete loggedInUser.otp;
      delete loggedInUser.otpTime;

      const options = { httpOnly: true, secure: true };
      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Registered and logged in via Zoho successfully"));
    }
  } catch (error) {
    console.error("Error during Zoho Login backend process:", error.response?.data || error.message || error);
    return res.status(500).json(new ApiError(500, error.response?.data?.error || "Internal Server Error during Zoho authentication"));
  }
});


export default uc
