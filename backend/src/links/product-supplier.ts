import { defineLink } from "@medusajs/utils";
import ProductModule from "@medusajs/product";
import SupplierModule from "../modules/supplier";

export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  SupplierModule.linkable.supplier
);
