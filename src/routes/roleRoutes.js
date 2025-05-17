import express from "express";

import RoleController from "../controllers/roleController";
import { Auth, AllowPermission } from "../middlewares/auth";
import Paginate from "../middlewares/paginate";
import SchemaValidator from "../middlewares/schemaValidator";
import ResourceNames from "../configs/resourceNames";

const router = express.Router();

router.use(Auth(["admin"], { roleResource: ResourceNames.ADMIN_USERS }));  // only admins can access

router.get(
  "/all",
  AllowPermission("view"),
  Paginate(),
  RoleController.getRoles
);

router.post(
  "/new",
  AllowPermission("create"),
  SchemaValidator(true, "/role/new"),
  RoleController.createRole
);

router.get("/single/:id", AllowPermission("view"), RoleController.getRole);

router.put(
  "/update/:id",
  AllowPermission("update"),
  SchemaValidator(true, "/role/update"),
  RoleController.updateRole
);

router.delete(
  "/delete/:id",
  AllowPermission("delete"),
  RoleController.deleteRole
);

export default router;
