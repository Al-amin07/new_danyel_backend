import { Types } from 'mongoose';
import catchAsync from '../../util/catchAsync';
import sendResponse from '../../util/sendResponse';
import idConverter from '../../util/idConvirter';
import userServices from './user.service';

const createUser = catchAsync(async (req, res) => {
  const user = req.body;
  const result = await userServices.createUser(user);
  res.status(200).json({
    message: result.message|| 'user created successfully' ,
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userServices.getAllUsers();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All users',
    data: result,
  });
});

const updateProfileData = catchAsync(async (req, res) => {

  const user_id = typeof req.user.id === 'string' ? idConverter(req.user.id) : req.user.id;
  const payload = req.body
  const result= await userServices.updateProfileData(user_id,payload)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'profile updated',
    data: result,
  });
});

const deleteSingleUser = catchAsync(async (req, res) => {
  const user_id= req.query.user_id as string;
  const userIdConverted = idConverter(user_id);
  console.log(user_id,userIdConverted)
  if(!userIdConverted){
    throw new Error ("user id conversiopn failed")
  }
  const result =await userServices.deleteSingleUser(userIdConverted);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'user deleted',
    data: result,
  });
});


const selfDistuct = catchAsync(async (req, res) => {
  const user_id= req.user.id;
  const userIdConverted = idConverter(user_id)
  if (!userIdConverted){
    throw new Error("user id conversion failed")
  }
  const result = await userServices.selfDistuct(userIdConverted)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'your account deletation successfull',
    data: result,
  });
});

const uploadOrChangeImg = catchAsync(async (req, res) => {
  const actionType = req.query.actionType as string; // Fixed typo in `actionType`
  const user_id = req.user.id;
  const imgFile = req.file;

  if (!user_id || !imgFile) {
    throw new Error("User ID and image file are required.");
  }

  // Ensure `idConverter` returns only the ObjectId
  const userIdConverted = idConverter(user_id);
  if (!(userIdConverted instanceof Types.ObjectId)) {
    throw new Error("User ID conversion failed");
  }

  // Call the service function to handle the upload
  const result = await userServices.uploadOrChangeImg(userIdConverted, imgFile as Express.Multer.File);

  // Send response
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Your profile picture has been ${actionType || "updated"}`,
    data: result,
  });
});

const getProfile= catchAsync(async(req,res)=>{
  const user_id = req.user.id
  const converted_user_id= idConverter(user_id)
  if(!converted_user_id)
  {
    throw Error("id conversation failed")
  }
  const result = await userServices.getProfile(converted_user_id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message:"your position retrived",
    data: result,
  });
})


const userController = {
  createUser,
  getAllUsers,
  updateProfileData,
  deleteSingleUser,
  selfDistuct,
  uploadOrChangeImg,
  getProfile,
};


export default userController;
