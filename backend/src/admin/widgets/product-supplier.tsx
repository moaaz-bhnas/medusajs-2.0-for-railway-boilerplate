import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { clx, Container, Heading, Text } from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "../lib/sdk";
import { AdminProduct, DetailWidgetProps } from "@medusajs/types";

type AdminroductSupplier = AdminProduct & {
  supplier?: {
    id: string;
    name: string;
  };
};

const ProductSupplierWidget = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  const { data: queryResult } = useQuery({
    queryFn: () =>
      sdk.admin.product.retrieve(product.id, {
        fields: "+supplier.*",
      }),
    queryKey: [["product", product.id]],
  });
  const supplierName = (queryResult?.product as AdminroductSupplier)?.supplier?.name;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Supplier</Heading>
        </div>
      </div>
      <div className={clx(`text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4`)}>
        <Text size="small" weight="plus" leading="compact">
          Name
        </Text>

        <Text size="small" leading="compact" className="whitespace-pre-line text-pretty">
          {supplierName || "-"}
        </Text>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.before",
});

export default ProductSupplierWidget;
