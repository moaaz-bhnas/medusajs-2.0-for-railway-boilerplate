import Medusa from "@medusajs/js-sdk";
import { BACKEND_URL } from "../../lib/constants";

export const sdk = new Medusa({
  baseUrl: BACKEND_URL,
  auth: {
    type: "session",
  },
});
