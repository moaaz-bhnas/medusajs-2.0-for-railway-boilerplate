import { ModuleProvider, Modules } from "@medusajs/utils";
import FawryProviderService from "./service";

export default ModuleProvider(Modules.PAYMENT, {
  services: [FawryProviderService],
});
