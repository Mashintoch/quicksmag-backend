/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
import cloudinary from "../middlewares/cloudinary";

const { upload } = cloudinary.uploader;

const getMB = (size) => Math.round(size / (1024 * 1024));

export const cloudinaryUploader = async (document, rules) => {
  if (
    rules.allowedMimetypes &&
    !rules.allowedMimetypes.includes(document.mimetype)
  )
    throw new Error(`Invalid mimetype: ${document.mimetype}`);

  if (document.size > rules.maxSize)
    throw new Error(`File must not exceed ${getMB(rules.maxSize)} MB`);

  const resourceType = rules.resourceType || "auto";

  const uploadedFile = await upload(document.path, {
    folder: rules.folder,
    public_id: rules.publicId,
    overwrite: rules.overwrite,
    resource_type: resourceType,
  });

  return uploadedFile;
};

export const cloudinaryRemover = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary file removal error:", error);
    throw new Error(`Failed to remove file: ${error.message}`);
  }
};
