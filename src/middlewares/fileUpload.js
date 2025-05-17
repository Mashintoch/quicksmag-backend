/* eslint-disable consistent-return */
import multer from "multer";

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
];

const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg", // MP3
  "audio/mp4",  // M4A
  "audio/wav",
  "audio/ogg"
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const fileUpload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
    const isAudio = ALLOWED_AUDIO_TYPES.includes(file.mimetype);

    if (!isImage && !isVideo && !isAudio) {
      return cb(
        new Error(
          "Invalid file type. Allowed types: png, jpg, jpeg, gif, webp, mp4, mpeg, quicktime, avi, webm, mp3, m4a, wav, ogg"
        ),
        false
      );
    }

    cb(null, true);
  },
  limits: {
    fileSize: MAX_FILE_SIZE, // 50MB max file size
    files: 15, // Allow multiple file uploads
  },
});

export default fileUpload;