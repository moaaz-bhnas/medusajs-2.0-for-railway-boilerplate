import {
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework";
import { PostAdminCreateSupplier } from "./admin/suppliers/validators";
import { z } from "zod";
import { PostAdminCreateBrand } from "./admin/brands/validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/suppliers",
      method: "POST",
      middlewares: [validateAndTransformBody(PostAdminCreateSupplier as any)],
    },
    {
      matcher: "/admin/brands",
      method: "POST",
      middlewares: [validateAndTransformBody(PostAdminCreateBrand as any)],
    },
    {
      matcher: "/admin/products",
      method: ["POST"],
      additionalDataValidator: {
        brand_id: z.string().optional() as any,
      },
    },
    {
      matcher: "/admin/products",
      method: ["POST"],
      additionalDataValidator: {
        supplier_id: z.string().optional() as any,
      },
    },
  ],
});
