import { uploadToCloudinary } from "../../util/uploadImgToCloudinary";
import { Driver } from "./driver.model";





const updateDriverProfileIntoDb = async (
    id: string,
    data: any,
    files: any
) => {
    const folder = "drivers";

    const updateData: any = {
        ...data, // spreads text fields like vehicleType, model, etc.
    };

    if (files?.nidOrPassport?.[0]) {
        updateData.nidOrPassport = await uploadToCloudinary(
            files.nidOrPassport[0].path,
            folder
        );
    }
    if (files?.drivingLicense?.[0]) {
        updateData.drivingLicense = await uploadToCloudinary(
            files.drivingLicense[0].path,
            folder
        );
    }
    if (files?.vehicleRegistration?.[0]) {
        updateData.vehicleRegistration = await uploadToCloudinary(
            files.vehicleRegistration[0].path,
            folder
        );
    };

    console.log("updatedData: ", updateData)

    // 🔹 Partial update (PATCH) → only updates provided fields
    const updatedDriver = await Driver.findOneAndUpdate({ user: id }, updateData, { new: true, upsert: true, runValidators: true });

    console.log('Driver profile: ', updatedDriver)


    if (!updatedDriver) {
        throw new Error("Driver not found");
    }

    return updatedDriver;
};


export const driverService = {
    updateDriverProfileIntoDb,
}