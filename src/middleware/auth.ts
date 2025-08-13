import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import authUtill from '../modules/auth/auth.utill';
import catchAsync from '../util/catchAsync';
import { TUserRole } from '../constents';
import { UserModel } from '../modules/user/user.model';
import idConverter from '../util/idConvirter';

const auth = (...requeredUserRole: TUserRole[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const authorizationToken = req?.headers?.authorization;

        // console.log("auth fun token",authorizationToken)

        if (!authorizationToken) {
            throw new Error('Unauthorized User: Missing Authorization Token');
        }

        const decoded = authUtill.decodeAuthorizationToken(authorizationToken);

        if (!decoded) {
            throw new Error('Unauthorized User: Token decoding failed');
        }

        const { id, role, iat } = decoded as JwtPayload;

        // Check if the user's role is allowed
        if (requeredUserRole.length && !requeredUserRole.includes(role)) {
            throw new Error('Unauthorized User: Role not permitted yoo yoo');
        }

        // Find the user in the database
        const findUser = await UserModel.findOne({
            _id:idConverter(id),
            isLoggedIn:true,
            isDeleted:false
        });

        if (!findUser) {
            throw new Error('Unauthorized User: Forbidden Access');
        }

        // Check if the user has logged out after the token was issued
        const logOutTime = findUser.loggedOutTime
            ? new Date(findUser.loggedOutTime).getTime() / 1000
            : null;

        if (logOutTime && iat && iat < logOutTime) {
            throw new Error(
                'Unauthorized User: Your session has expired. Please log in again'
            );
        }

        // Attach user information to the request
        req.user = decoded as JwtPayload;

        // Proceed to the next middleware
        next();
    });
};

export default auth;
