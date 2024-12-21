import { createProductsWorkflow } from "@medusajs/core-flows";
import { LinkDefinition } from "@medusajs/types";
import { Modules } from "@medusajs/utils";
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/workflows-sdk";
import { SUPPLIER_MODULE } from "modules/supplier";
import SupplierModuleService from "modules/supplier/service";

createProductsWorkflow.hooks.productsCreated(
  async function ({ products, additional_data }, { container }) {
    const logger = container.resolve("logger");

    if (!additional_data?.supplier_id) {
      return new StepResponse([], []);
    }

    const supplierModuleService: SupplierModuleService = container.resolve(SUPPLIER_MODULE);

    // if the supplier doesn't exist, an error is thrown.
    await supplierModuleService.retrieveSupplier(additional_data.supplier_id);

    const remoteLink = container.resolve("remoteLink");

    const links: LinkDefinition[] = [];

    for (const product of products) {
      links.push({
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [SUPPLIER_MODULE]: {
          supplier_id: additional_data.supplier_id,
        },
      });
    }

    await remoteLink.create(links);

    logger.info("Linked supplier to products");

    return new StepResponse(links, links);
  },

  async function rollBack({ links }, { container }) {
    if (!links?.length) {
      return;
    }

    const remoteLink = container.resolve("remoteLink");

    await remoteLink.dismiss(links);
  }
);
