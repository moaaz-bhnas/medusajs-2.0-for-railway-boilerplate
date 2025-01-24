import {
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework";
import Medusa from "@medusajs/js-sdk";
import { PostAdminCreateBrand } from "api/admin/brands/validators";
import { PostAdminCreateSupplier } from "api/admin/suppliers/validators";
import { z } from "zod/lib/external";
// import { BACKEND_URL } from "../../lib/constants";

export const sdk = new Medusa({
  baseUrl: "https://backend-staging-d273.up.railway.app/",
  auth: {
    type: "session",
  },
});
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
