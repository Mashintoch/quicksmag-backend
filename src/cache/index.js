/* eslint-disable no-console */
import Cache from "../models/cache";

const invalidateUserCache = async (userId) => {
  try {
    await Cache.deleteMany({ key: { $regex: `forYouFeed:${userId}:` } });
    console.log(`Cache invalidated for user ${userId}`);
  } catch (error) {
    console.error("Error invalidating cache:", error);
  }
};

const invalidateAllCache = async () => {
  try {
    await Cache.deleteMany({});
    console.log("All cache invalidated");
  } catch (error) {
    console.error("Error invalidating cache:", error);
  }
};

export { invalidateUserCache, invalidateAllCache };
