import { MedusaService } from "@medusajs/utils";
import { Brand } from "./models/brand";

class BrandModuleService extends MedusaService({
  Brand,
}) {}

export default BrandModuleService;
