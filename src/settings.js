import Settings from "./models/settings";

const APP_SETTINGS = {
  async SET_SETTINGS(role) {
    try {
      await Settings.create({ globalRole: role });
    } catch (err) {
      throw new Error(err);
    }
  },
  async LOAD_SETTINGS(onlyGlobalRole = false) {
    try {
      const settings = await Settings.findOne();
      if (onlyGlobalRole) return settings.globalRole.toString();
      return settings;
    } catch (err) {
      throw new Error(err);
    }
  },
};

export default APP_SETTINGS;
