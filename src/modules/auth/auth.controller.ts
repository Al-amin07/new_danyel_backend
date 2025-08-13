import catchAsync from '../../util/catchAsync';
import authServices from './auth.service';


const logIn = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authServices.logIn(email, password);
  const { approvalToken, refreshToken, updatedUser } = result;

  res.status(200).json({
    message: 'Log In Successful',
    approvalToken: approvalToken,
    refreshToken: refreshToken,
    user: updatedUser,
  });
});

const logOut = catchAsync(async (req, res) => {
  const userId = req?.user.id;

  if (!userId) {
    throw Error('token is missing');
  }

  const result = await authServices.logOut(userId);
  res.status(200).json({
    message: 'Log OUT Successful',
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const authorizationToken = req.headers?.authorization as string;

  const result = await authServices.changePassword(
    authorizationToken,
    oldPassword,
    newPassword,
  );
  res.status(200).json({
    success: true,
    message: 'password changed',
    body: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await authServices.refreshToken(refreshToken);

  res.status(200).json({
    success: true,
    message: 'log token refreshed',
    body: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {

  const email = req.body?.email;
  const result = await authServices.forgetPassword(email);
  res.status(200).json({
    success: true,
    message: 'reset password token genarated check your email',
    body: result,
  });

});

const resetPassword = catchAsync(async (req, res) => {
  const { id, newPassword } = req.body;
  const authorizationToken = req.headers?.authorization as string;
  // console.log(req.body)

  const result = await authServices.resetPassword(
    authorizationToken,
    id,
    newPassword,
  );

  res.status(200).json({
    success: true,
    message: 'password changed',
    body: result,
  });
});

const collectProfileData = catchAsync(async (req, res) => {
  const user = req.user 
  const result = await authServices.collectProfileData(user.id);
  res.status(200).json({
    success: true,
    message: 'password changed',
    body: result,
  });
});

const authController = {
  logIn,
  logOut,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
  collectProfileData
};
export default authController;
