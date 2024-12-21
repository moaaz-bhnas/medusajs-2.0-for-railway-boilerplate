import { Module } from "@medusajs/utils";
import SupplierModuleService from "./service";

export const SUPPLIER_MODULE = "supplier";

export default Module(SUPPLIER_MODULE, {
  service: SupplierModuleService,
});
