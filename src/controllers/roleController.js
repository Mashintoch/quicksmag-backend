import RoleServices from "../services/roleServices";
import response from "../helpers/responseHelper";

const getRoles = async (req, res) => {
  try {
    const allRoles = await RoleServices.getRoles(req.pagination);
    return response(res, 200, "Roles retrieved", allRoles);
  } catch (err) {
    return response(res, 500, err?.message);
  }
};

const getRole = async (req, res) => {
  try {
    const role = await RoleServices.getRole(req.params.id);
    return response(res, 200, "Role retrieved", role);
  } catch (err) {
    return response(res, 500, err?.message);
  }
};

const createRole = async (req, res) => {
  try {
    const newRole = await RoleServices.createRole(req.body);
    return response(res, 201, "Role created", newRole);
  } catch (err) {
    return response(res, 500, err?.message);
  }
};

const updateRole = async (req, res) => {
  try {
    const role = await RoleServices.updateRole(req.params.id, req.body);
    return response(res, 200, "Role updated!", role);
  } catch (err) {
    return response(res, 500, err?.message);
  }
};

const deleteRole = async (req, res) => {
  try {
    const role = await RoleServices.deleteRole(req.params.id);
    return response(res, 201, "Role deleted!", role);
  } catch (err) {
    return response(res, 500, err?.message);
  }
};

export default { getRoles, getRole, createRole, updateRole, deleteRole };
