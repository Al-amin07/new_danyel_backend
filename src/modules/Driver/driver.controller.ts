import { Request, Response } from "express";
import catchAsync from "../../util/catchAsync";
import { driverService } from "./driver.service";
import { JwtPayload } from "jsonwebtoken";




const updateDriverProfile = catchAsync(async (req: Request, res: Response) => {
    try {
        const id = (req.user as JwtPayload).id;
        const data = req.body;
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        const driver = await driverService.updateDriverProfileIntoDb(id, data, files);

        res.status(201).json({
            success: true,
            message: "Driver profile created successfully",
            data: driver,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
},
)


export const driverController = {
    updateDriverProfile,
}