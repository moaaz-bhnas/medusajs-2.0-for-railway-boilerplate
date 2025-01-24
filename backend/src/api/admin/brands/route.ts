import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { createBrandWorkflow } from "../../../workflows/create-brand";

type PostAdminCreateBrandType = {
  name: string;
};

export const POST = async (
  req: MedusaRequest<PostAdminCreateBrandType>,
  res: MedusaResponse
) => {
  const { result } = await createBrandWorkflow(req.scope).run({
    input: req.validatedBody,
  });

  res.json({ brand: result });
};
