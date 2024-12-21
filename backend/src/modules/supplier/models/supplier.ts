import { model } from "@medusajs/utils";

export const Supplier = model.define("supplier", {
  id: model.id().primaryKey(),
  name: model.text(),
});
