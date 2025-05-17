/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */

const getUserId = (req) => req.user._id.toString();

export default getUserId;
