import { z } from "zod";

export const PostAdminCreateSupplier = z.object({
  name: z.string(),
});
