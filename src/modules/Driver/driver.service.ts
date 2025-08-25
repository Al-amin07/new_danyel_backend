import config from '../../config';
import fs from 'fs';
import path from 'path';
import { Driver } from './driver.model';
const updateDriverProfileIntoDb = async (
  id: string,
  payload: any,
  files: any,
) => {
  const folder = 'uploads/drivers'; // local folder for drivers
  const { location, ...restDriverData } = payload;
  //   console.log({ payload, files, folder });

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  const updateData: any = { ...restDriverData };

  const fileFields: Record<string, string> = {
    nidOrPassport: 'nidOrPassport',
    drivingLicense: 'drivingLicense',
    vehicleRegistration: 'vehicleRegistration',
  };
  for (const [key, field] of Object.entries(fileFields)) {
    if (files?.[key]?.[0]) {
      const file = files[key][0];

      // Move file to /uploads/drivers with unique name
      const fileName = `${Date.now()}-${file.originalname}`;
      const destPath = path.join(folder, fileName);

      fs.renameSync(file.path, destPath);
      console.log(`File saved to ${destPath}`);
      // Save relative URL for DB
      updateData[field] = {
        type: file.mimetype,
        url: `${config.server_url}/uploads/drivers/${fileName}`,
      };
    }
  }
  if (location) {
    (Object.keys(location) as (keyof {})[]).forEach((key) => {
      updateData[`location.${key}`] = location[key];
    });
  }
  console.log({ id });
  const result = await Driver.findOneAndUpdate({ user: id }, updateData, {
    new: true,
  });
  return result;
};

export const driverService = {
  updateDriverProfileIntoDb,
};

// const updateDriverProfileIntoDb = async (
//     id: string,
//     data: any,
//     files: any
// ) => {
//     const folder = "drivers";

//     const updateData: any = {
//         ...data, // spreads text fields like vehicleType, model, etc.
//     };

//     if (files?.nidOrPassport?.[0]) {
//         updateData.nidOrPassport = await uploadToCloudinary(
//             files.nidOrPassport[0].path,
//             folder
//         );
//     }
//     if (files?.drivingLicense?.[0]) {
//         updateData.drivingLicense = await uploadToCloudinary(
//             files.drivingLicense[0].path,
//             folder
//         );
//     }
//     if (files?.vehicleRegistration?.[0]) {
//         updateData.vehicleRegistration = await uploadToCloudinary(
//             files.vehicleRegistration[0].path,
//             folder
//         );
//     };

//     console.log("updatedData: ", updateData)

//     // 🔹 Partial update (PATCH) → only updates provided fields
//     const updatedDriver = await Driver.findOneAndUpdate({ user: id }, updateData, { new: true, upsert: true, runValidators: true });

//     console.log('Driver profile: ', updatedDriver)

//     if (!updatedDriver) {
//         throw new Error("Driver not found");
//     }

//     return updatedDriver;
// };
