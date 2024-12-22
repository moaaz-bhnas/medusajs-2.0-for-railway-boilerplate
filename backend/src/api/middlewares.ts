import { defineMiddlewares, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework";
import { PostAdminCreateSupplier } from "./admin/suppliers/validators";
import { z } from "zod";

// Define a custom Zod schema to replace createFindParams
export const GetSuppliersSchema: any = z.object({
  limit: z.preprocess((val) => Number(val), z.number().optional()),
  offset: z.preprocess((val) => Number(val), z.number().optional()),
  order: z.string().optional(),
  fields: z.string().optional(),
  expand: z.string().optional(),
});

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/suppliers",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetSuppliersSchema, {
          defaults: ["id", "name", "products.*"],
          isList: true,
        }),
      ],
    },
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
