import bcrypt from 'bcrypt';
import config from '../../config';
import authUtill from './auth.utill';
import { User } from '../user/user.model';
import idConverter from '../../util/idConvirter';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sendEmail } from '../../util/sendEmail';
import ApppError from '../../error/AppError';
import { StatusCodes } from 'http-status-codes';
import { TUser } from '../user/user.interface';
import { Types } from 'mongoose';

const logIn = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApppError(StatusCodes.NOT_FOUND, 'No user found with this email');
  }

  if (user?.isBlocked || user?.isDeleted) {
    throw new ApppError(
      StatusCodes.FORBIDDEN,
      'This user is blocked or deleted',
    );
  }
  // Password check for email login
  const isPasswordmatch = await bcrypt.compare(password, user.password);
  if (!isPasswordmatch) {
    throw new ApppError(StatusCodes.CONFLICT, 'Incorrect password!!');
  }

  const updatedUser = await User.findOneAndUpdate(
    { email },
    { lastLoggedin: new Date() },
    { new: true },
  ).select('-password');

  const tokenizeData = {
    id: user._id,
    role: user.role,
    username: updatedUser?.name,
    email: updatedUser?.email,
  };

  const accessToken = authUtill.createToken(
    tokenizeData,
    config.jwt_token_secret,
    config.token_expairsIn,
  );

  const refreshToken = authUtill.createToken(
    tokenizeData,
    config.jwt_refresh_Token_secret,
    config.rifresh_expairsIn,
  );

  return { accessToken, refreshToken, userData: updatedUser };
};

const logOut = async (userId: string) => {
  const convertedId = idConverter(userId);

  const findUserById = await User.findOneAndUpdate(
    { _id: convertedId },
    { isLoggedIn: false, loggedOutTime: new Date() },
    { new: true },
  );
  return findUserById;
};

const changePassword = async (
  id: string,
  oldPassword: string,
  newPassword: string,
) => {
  // Find the user and include the password field
  const findUser = await User.findById(id).lean(); // Convert to a plain object for performance
  console.log({ findUser, id });
  if (!findUser || !findUser.password) {
    throw new ApppError(
      StatusCodes.NOT_FOUND,
      'User not found or password missing',
    );
  }

  // Compare old password with hashed password
  const isPasswordMatch = await bcrypt.compare(oldPassword, findUser.password);

  if (!isPasswordMatch) {
    throw new ApppError(StatusCodes.CONFLICT, 'Old password is incorrect');
  }

  // Hash the new password
  const newPasswordHash = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt),
  );

  // Update the password
  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      password: newPasswordHash,
      passwordChangeTime: new Date(),
    },
    { new: true },
  ).select('-password');

  console.log({ updatedUser });

  if (!updatedUser) {
    throw new Error('Error updating password');
  }

  return updatedUser;
};

const refreshToken = async (refreshToken: string) => {
  const decoded = jwt.verify(
    refreshToken,
    config.jwt_refresh_Token_secret as string,
  );

  if (!decoded) {
    throw Error('tocan decodaing Failed');
  }

  const { id, iat, role } = decoded as JwtPayload;

  const findUser = await User.findOne({
    _id: id,
    isDelited: false,
  });

  if (!findUser) {
    throw Error('Unauthorised User or forbitten Access');
  }

  const JwtPayload = {
    id: findUser.id,
    role: role,
  };
  const approvalToken = authUtill.createToken(
    JwtPayload,
    config.jwt_token_secret as string,
    config.token_expairsIn as string,
  );

  return {
    approvalToken,
  };
};

const forgetPassword = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('User not found with this email');
  }

  if (user.isDeleted) {
    throw new Error('This user is deleted. This function is not available.');
  }

  const tokenizeData = {
    id: user._id,
    role: user.role,
  };

  const resetToken = authUtill.createToken(
    tokenizeData,
    config.jwt_token_secret as string,
    config.token_expairsIn as string,
  );

  const resetLink = `${config.FrontEndHostedPort}?id=${user._id}&token=${resetToken}`;

  const passwordResetHtml = `
    <div>
      <p>Dear User,</p>
      <p>Click the button below to reset your password. This link expires in 10 minutes.</p> 
      <p>
          <a href="${resetLink}" target="_blank">
              <button style="padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px;">
                  Reset Password
              </button>
          </a>
      </p>
    </div>
  `;

  const emailResponse = await sendEmail(
    user.email,
    'Reset Your Password',
    passwordResetHtml,
  );

  if (emailResponse.success) {
    return {
      success: true,
      message: '✅ Check your email for the reset password link.',
      emailSentTo: emailResponse.accepted,
      resetLink,
    };
  } else {
    return {
      success: false,
      message: '❌ Failed to send password reset email.',
      error: emailResponse.error,
    };
  }
};

const resetPassword = async (
  authorizationToken: string,
  userId: string,
  newPassword: string,
) => {
  // Decode the token
  const decoded = jwt.verify(
    authorizationToken,
    config.jwt_token_secret as string,
  ) as JwtPayload;

  if (!decoded || !decoded.id) {
    throw Error('Invalid or unauthorized token');
  }

  const { id } = decoded;
  if (id === userId) {
    // Find the user and include the password field
    const findUser = await User.findOne({ _id: id }).select('+password');

    if (!findUser || !findUser.password) {
      throw Error('User not found or password missing');
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(
      newPassword,
      Number(config.bcrypt_salt),
    );

    // Update the user's password and passwordChangeTime
    const updatePassword = await User.findOneAndUpdate(
      { _id: id },
      {
        password: newPasswordHash,
        passwordChangeTime: new Date(),
      },
      { new: true },
    );

    if (!updatePassword) {
      throw Error('Error updating password');
    }

    return { passwordChanged: true };
  } else {
    throw Error('Invalid User');
  }
};

const collectProfileData = async (id: string) => {
  const result = await User.findOne({ _id: id });
  return result;
};

const authServices = {
  logIn,
  logOut,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
  collectProfileData,
};
export default authServices;
