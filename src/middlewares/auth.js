/* eslint-disable no-underscore-dangle */
/* eslint-disable no-self-compare */
/* eslint-disable import/prefer-default-export */
/* eslint-disable spaced-comment */
/* eslint-disable consistent-return */
import jwt from "jsonwebtoken";

import User from "../models/user";
import { errorResponse } from "../helpers/errorResponse";
import { HttpError } from "../classes";
import getErrorMessage from "../helpers/getErrorMessage";
import response from "../helpers/responseHelper";

const Auth =
  (
    allowedAccountTypes = ["admin", "subscriber"],
    authOptions = {
      roleResource: undefined,
      action: undefined,
      condition: "AND",
    }
  ) =>
  async (req, res, next) => {
    if (req.method === "OPTIONS") return next(); // Ignore
    try {
      const accessToken = req.header("Authorization")?.split(" ")[1];
      if (!accessToken) throw new HttpError("Access token not found!", 401);

      const decodedUser = jwt.verify(accessToken, process.env.JWT_SECRET);

      if (!decodedUser) throw new HttpError("Authentication failed!", 401);

      const { id } = decodedUser;

      const user = await User.findById(id).populate("role");
      if (!user) throw new HttpError("Authentication failed!", 401);

      const userAccountType = user.accountType;
      const userRole = user?.role;

      if (!allowedAccountTypes.includes(userAccountType)) {
        throw new HttpError(
          "Authorization failed: Can't access this route!",
          403
        );
      }
      
      if (
        allowedAccountTypes.includes("admin") &&
        userAccountType === "admin" &&
        !userRole
      ) {
        throw new HttpError("Authorization failed!", 403);
      }

      if (authOptions && authOptions?.roleResource && userRole) {
        const { roleResource, actions, condition } = authOptions;

        const _resource = userRole.permissions?.resources?.find(
          ({ name }) => name === roleResource
        );

        if (!_resource)
          throw new HttpError(
            `Access denied: No permissions for managing ${roleResource}!`,
            401
          );

        const resourceActions = _resource.operations;

        req.resource = {
          actions: resourceActions,
        };

        if (actions) {
          const __actions = Array.isArray(actions) ? [...actions] : [actions];

          const actionCallback = (action) => resourceActions?.includes(action);

          const accessGranted =
            condition === "AND"
              ? __actions.every(actionCallback)
              : __actions.some(actionCallback);

          if (!accessGranted)
            throw new HttpError(
              "Access denied: Not allowed to perform this action!",
              401
            );
        }
      }

      req.user = user;

      next();
    } catch (err) {
      return errorResponse(res, err, 401);
    }
  };

const AllowPermission =
  (permission, condition = "AND") =>
  (req, res, next) => {
    try {
      const resourceActions = req?.resource?.actions;

      if (!resourceActions) {
        throw new HttpError("Access denied!", 401);
      }

      const __permissions = Array.isArray(permission)
        ? [...permission]
        : [permission];

      const actionCallback = (action) => resourceActions?.includes(action);

      const accessGranted =
        condition === "AND"
          ? __permissions.every(actionCallback)
          : __permissions.some(actionCallback);

      if (!accessGranted) {
        throw new HttpError(
          "Access denied: Not allowed to perform this action!",
          401
        );
      }

      next();
    } catch (err) {
      return errorResponse(res, err);
    }
  };


 const CheckPermissions = (resource) => (req, res, next) => {
    try {
      const {role} = req.userData.role;
      if (role) {
        const { resources } = role.permissions;
        const _resource = resources.filter(({ name }) => name === resource);

        if (_resource.length < 1) return response(res, 401, "ACCESS DENIED!");

        req.userData.resource = {
          name: _resource[0].name,
          actions: _resource[0].actions,
        };

        next();
      }
    } catch (err) {
      return response(res, 401, getErrorMessage(err));
    }
  };

export { Auth, AllowPermission, CheckPermissions };
