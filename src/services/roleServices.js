/* eslint-disable no-underscore-dangle */
import Role from "../models/role";
import paginationResults from "../helpers/paginationResults";
import APP_SETTINGS from "../settings";

const getRoles = async (pagination) => {
  try {
    const { page, limit } = pagination;
    const allRoles = await Role.paginate(
      {},
      {
        page,
        limit,
        populate: {
          path: "users",
          select: "firstname lastname email phoneNumber status",
        },
      }
    );
    return paginationResults(allRoles);
  } catch (err) {
    throw new Error(err);
  }
};

const getRole = async (id) => {
  try {
    const role = await Role.findById(id).populate(
      "users",
      "firstname lastname email phoneNumber status"
    );
    return role;
  } catch (err) {
    throw new Error(err);
  }
};

const createRole = async (payload) => {
  try {
    const { name } = payload;
    const existingRole = await Role.findOne({ name });
    if (existingRole) throw new Error("This role already exists");
    const newRole = new Role(payload);
    await newRole.save();
    return newRole;
  } catch (err) {
    throw new Error(err);
  }
};

const updateRole = async (id, payload) => {
  try {
    const { globalRole } = await APP_SETTINGS.LOAD_SETTINGS();
    if (globalRole && globalRole.toString() === id)
      throw new Error("Sorry, you cannot update this role!");

    const role = await Role.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, useFindAndModify: false }
    );
    return role;
  } catch (err) {
    throw new Error(err);
  }
};

const deleteRole = async (id) => {
  try {
    const role = await Role.findById(id);
    if (role.users && role.users.length >= 1) {
      throw new Error("Please, reassign users before deletion!");
    }

    const { globalRole } = await APP_SETTINGS.LOAD_SETTINGS();

    if (globalRole && globalRole.toString() === id)
      throw new Error("Sorry, you cannot delete this role!");

    await role.deleteOne();

    return role;
  } catch (err) {
    throw new Error(err);
  }
};

export default {
  getRoles,
  getRole,
  createRole,
  deleteRole,
  updateRole,
};
