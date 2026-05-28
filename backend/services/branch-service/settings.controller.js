import { GlobalSettings } from "../../models/globalSettings.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

const getSettings = asyncHandler(async (req, res) => {
    let settings = await GlobalSettings.findOne({});
    if (!settings) {
        settings = await GlobalSettings.create({
            subscriptionType: "free"
        });
    }
    return res.status(200).json(new ApiResponse(200, settings, "Settings fetched successfully"));
});

const updateSettings = asyncHandler(async (req, res) => {
    // Only super admin can update global settings
    if (req.user?.email !== "balajiaadi2000@gmail.com") {
        throw new ApiError(403, "Only super admin can update global settings");
    }

    const { subscriptionType } = req.body;
    
    let settings = await GlobalSettings.findOne({});
    if (!settings) {
        settings = new GlobalSettings();
    }

    settings.subscriptionType = subscriptionType;
    settings.updatedBy = req.user._id;

    await settings.save();

    return res.status(200).json(new ApiResponse(200, settings, "Settings updated successfully"));
});

export const GlobalSettingsController = {
    getSettings,
    updateSettings
};
