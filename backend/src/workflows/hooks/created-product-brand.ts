import { createProductsWorkflow } from "@medusajs/core-flows";
import { StepResponse } from "@medusajs/workflows-sdk";
import { Modules } from "@medusajs/utils";
import { LinkDefinition } from "@medusajs/types";
import { BRAND_MODULE } from "../../modules/brand";
import BrandModuleService from "../../modules/brand/service";

createProductsWorkflow.hooks.productsCreated(
  async ({ products, additional_data }, { container }) => {
    if (!additional_data?.brand_id) {
      return new StepResponse([], []);
    }

    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE);
    // if the brand doesn't exist, an error is thrown.
    await brandModuleService.retrieveBrand(additional_data.brand_id as string);

    // TODO link brand to product
    const remoteLink = container.resolve("remoteLink");
    const logger = container.resolve("logger");

    const links: LinkDefinition[] = [];

    for (const product of products) {
      links.push({
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [BRAND_MODULE]: {
          brand_id: additional_data.brand_id,
        },
      });
    }

    await remoteLink.create(links);

    logger.info("Linked brand to products");

    return new StepResponse(links, links);
  },

  // ...
  async (links, { container }) => {
    if (!links?.length) {
      return;
    }

    const remoteLink = container.resolve("remoteLink");

    await remoteLink.dismiss(links);
  }
);
