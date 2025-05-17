export const EMAIL_LINK_EXPIRATION_TIME = 600000; // 10 MINUTES IN MILLISECONDS

export const STRONG_PASSWORD =
  /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/;

export const CALENDLY_PREFIX = "https://calendly.com/";

export const POSTS_PER_PAGE = 50;

export const APP_WIDE_MAX_FILE_SIZE = 150; // In megabytes

export const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const ALLOWED_IMAGE_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

export const PROFILE_ICONS =
  "https://res.cloudinary.com/mashintoch/image/upload/v1732012020/default-avatar-profile-icon-social-260nw-2369382021_epnuew.jpg";

export const GROUP_ICON =
  "https://res.cloudinary.com/mashintoch/image/upload/v1740670911/615075_cl0kuc.png";
export const POZSE_ADMIN = "admin@pozse.com";


export const LIVE_STREAMING_DEFAULT_THUMBNAIL = "https://i.pinimg.com/736x/55/31/78/55317882127927343bbdebe08071a6f6.jpg"