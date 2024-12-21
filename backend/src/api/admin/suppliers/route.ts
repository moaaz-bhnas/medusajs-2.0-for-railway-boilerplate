import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { z } from "zod";
import { createSupplierWorkflow } from "workflows/create-supplier";
import { PostAdminCreateSupplier } from "./validators";

type PostAdminCreateSupplierType = Required<z.infer<typeof PostAdminCreateSupplier>>;

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const { data: suppliers } = await query.graph({
    entity: "supplier",
    fields: ["*", "products.*"],
  });

  res.json({ suppliers });
};

export async function POST(req: MedusaRequest<PostAdminCreateSupplierType>, res: MedusaResponse) {
  const { result } = await createSupplierWorkflow(req.scope).run({ input: req.validatedBody });

  res.json({ supplier: result });
}
