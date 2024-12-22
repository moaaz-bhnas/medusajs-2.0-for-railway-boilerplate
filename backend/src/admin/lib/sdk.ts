import Medusa from "@medusajs/js-sdk";
// import { BACKEND_URL } from "../../lib/constants";

export const sdk = new Medusa({
  baseUrl: "https://backend-staging-d273.up.railway.app/",
  auth: {
    type: "session",
  },
});
