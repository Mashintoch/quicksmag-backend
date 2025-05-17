/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */
export const getUserRole = (req) => req.user?.role?._id?.toString() ?? 'defaultRoleId';



