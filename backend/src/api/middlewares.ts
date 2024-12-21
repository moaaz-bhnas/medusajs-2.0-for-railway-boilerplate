import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework";
import { PostAdminCreateSupplier } from "./admin/suppliers/validators";
import { z } from "zod";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/suppliers",
      method: "POST",
      middlewares: [validateAndTransformBody(PostAdminCreateSupplier as any)],
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
