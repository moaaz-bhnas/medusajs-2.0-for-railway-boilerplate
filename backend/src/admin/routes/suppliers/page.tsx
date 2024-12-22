import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Heading } from "@medusajs/ui";
import { sdk } from "../../lib/sdk";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { Table } from "../../components/table";

type SuppliersResponse = {
  suppliers: {
    id: string;
    name: string;
  }[];
  count: number;
  limit: number;
  offset: number;
};

const SuppliersPage = () => {
  // TODO retrieve suppliers
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 15;
  const offset = useMemo(() => {
    return currentPage * limit;
  }, [currentPage]);

  const { data } = useSWR<SuppliersResponse>(["suppliers", limit, offset], () =>
    sdk.client.fetch(`/admin/suppliers`, {
      query: {
        limit,
        offset,
      },
    })
  );

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Suppliers</Heading>
        </div>
      </div>

      <Table
        columns={[
          {
            key: "id",
            label: "#",
          },
          {
            key: "name",
            label: "Name",
          },
        ]}
        data={data?.suppliers || []}
        pageSize={data?.limit || limit}
        count={data?.count || 0}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Suppliers",
  nested: "/inventory",
});

export default SuppliersPage;
