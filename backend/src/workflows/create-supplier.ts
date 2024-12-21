import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/workflows-sdk";
import { SUPPLIER_MODULE } from "modules/supplier";
import SupplierModuleService from "modules/supplier/service";

type CreateSuplierStepInput = {
  name: string;
};

const createSupplierStep = createStep(
  "create-supplier-step",

  async function createStep(input: CreateSuplierStepInput, { container }) {
    const supplierModuleService: SupplierModuleService = container.resolve(SUPPLIER_MODULE);

    const supplier = await supplierModuleService.createSuppliers(input);

    return new StepResponse(supplier, supplier.id);
  },

  async function rollBack(id: string, { container }) {
    const supplierModuleService: SupplierModuleService = container.resolve(SUPPLIER_MODULE);

    await supplierModuleService.deleteSuppliers(id);
  }
);

type CreateSuplierWorkflowInput = {
  name: string;
};

export const createSupplierWorkflow = createWorkflow(
  "create-supplier",

  function createWorkflow(input: CreateSuplierWorkflowInput) {
    const supplier = createSupplierStep(input);

    return new WorkflowResponse(supplier);
  }
);
