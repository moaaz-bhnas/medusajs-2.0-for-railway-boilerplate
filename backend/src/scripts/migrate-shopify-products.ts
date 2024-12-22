import { createProductsWorkflow } from "@medusajs/core-flows";
import { ExecArgs } from "@medusajs/types";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { v4 } from "uuid";

const shopifyAPI = async () => {
  const endpoint = `https://0b3b7d-80.myshopify.com/admin/api/2024-01/graphql.json`;

  const query = `
      {
        products(first: 5, sortKey: ID, reverse: true) {
          edges {
            node {
              id
              title
              descriptionHtml
              images(first: 5) {
                edges {
                  node {
                    src
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    inventoryQuantity
                    sku
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
              options {
                name
                values
              }
            }
          }
        }
      }
    `;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": "X-Shopify-Access-Token",
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  console.log("🙀", data);

  return data.data.products.edges.map((edge) => edge.node);
};

function mapShopifyProductToMedusaProduct(shopifyProduct) {
  return {
    title: shopifyProduct.title,
    handle: v4(),
    description: shopifyProduct.descriptionHtml,
    images: shopifyProduct.images.edges.map((img) => ({
      url: img.node.src,
    })),
    variants: shopifyProduct.variants.edges.map((variant) => ({
      title: variant.node.title,
      prices: [
        {
          amount: variant.node.price,
          currency_code: "egp", // Adjust currency if needed
        },
      ],
      inventory_quantity: variant.node.inventoryQuantity,
      sku: variant.node.sku,
      //   options: variant.node.selectedOptions.map((opt) => ({
      //     title: opt.name,
      //     value: opt.value,
      //   })),
    })),
    options: shopifyProduct.options.map((option) => ({
      title: option.name,
      values: option.values,
    })),
  };
}

export default async function migrateShopifyProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  logger.info("Starting Shopify product migration");

  // 1. Fetch products from Shopify
  const products = await shopifyAPI();
  logger.info(`Fetched ${products.length} products from Shopify`);

  // 2. Map Shopify products to Medusa products + push to DB
  await createProductsWorkflow(container).run({
    input: {
      products: products.map(mapShopifyProductToMedusaProduct),
    },
  });
  logger.info("Shopify product migration complete");
}
