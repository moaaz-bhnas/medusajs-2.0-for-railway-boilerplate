import {
  PaymentProviderError,
  PaymentProviderSessionResponse,
  PaymentSessionStatus,
  CreatePaymentProviderSession,
  UpdatePaymentProviderSession,
  ProviderWebhookPayload,
  WebhookActionResult,
  Logger,
  CartDTO,
  CartLineItemDTO,
} from "@medusajs/types";
import { AbstractPaymentProvider, MedusaError } from "@medusajs/utils";
import {
  FAWRY_BASE_URL,
  FAWRY_MERCHANT_CODE,
  FAWRY_PAYMENT_EXPIRY,
  FAWRY_RETURN_PATH,
  FAWRY_SECURITY_CODE,
  STORE_URL,
} from "lib/constants";
import fp from "lodash/fp";
import crypto from "crypto";
import axios from "axios";
import { stat } from "fs";

type ChargeItem = {
  itemId: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

interface ChargeRequest {
  merchantCode: string;
  merchantRefNum: string;
  customerMobile: string;
  customerEmail: string;
  customerName: string;
  customerProfileId: string;
  language: "en-gb" | "ar-eg";
  chargeItems: ChargeItem[];
  returnUrl: string;
  authCaptureModePayment: boolean;
  signature: string;
}

type Options = {
  apiKey: string;
};

type InjectedDependencies = {
  logger: Logger;
};

export default class FawryProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "fawry";
  protected logger_: Logger;
  protected options_: Options;
  // assuming you're initializing a client
  protected client;

  constructor(container: InjectedDependencies, options: Options) {
    super(container, options);

    this.options_ = options;
    this.logger_ = container.logger;
  }

  static validateOptions(options: Record<any, any>) {
    if (!options.apiKey) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `API key is required in the Fawry provider's options.`);
    }
  }

  private generateSignature(cart: CartDTO): string {
    const merchantRefNum = cart.id;
    const customerProfileId = cart.customer_id;
    const returnUrl = `${STORE_URL}/${FAWRY_RETURN_PATH}`;
    const itemsDetails = fp.flow(
      this.getCheckoutItems,
      fp.map((item) => `${item.itemId}${item.quantity}${Number(item.price).toFixed(2)}`),
      fp.join("")
    )(cart);

    const dataToHash = `${FAWRY_MERCHANT_CODE}${merchantRefNum}${customerProfileId}${returnUrl}${itemsDetails}${FAWRY_SECURITY_CODE}`;

    const signature = crypto.createHash("sha256").update(dataToHash).digest("hex");

    return signature;
  }

  private getCheckoutItems(cart: CartDTO): ChargeItem[] {
    const addDiscountItem = fp.curry(function addDiscountItem(cart: CartDTO, lineItems: ChargeItem[]) {
      lineItems = fp.cloneDeep(lineItems);
      if (Number(cart.discount_total) > 0) {
        lineItems.push({
          itemId: "discount",
          description: "Discount",
          price: -Number(cart.discount_total),
          quantity: 1,
          imageUrl: "",
        });
      }
      return lineItems;
    });

    const addShipingItem = fp.curry(function addDiscountItem(cart: CartDTO, lineItems: ChargeItem[]) {
      lineItems = fp.cloneDeep(lineItems);
      if (Number(cart.shipping_total) > 0) {
        lineItems.push({
          itemId: "shipping",
          description: "Shipping",
          price: Number(cart.shipping_total),
          quantity: 1,
          imageUrl: "",
        });
      }
      return lineItems;
    });

    function mapCartItemToChargeItem(item: CartLineItemDTO): ChargeItem {
      return {
        itemId: item.id,
        description: item.title,
        price: Number(item.unit_price),
        quantity: Number(item.quantity),
        imageUrl: item.thumbnail,
      };
    }

    const result = fp.flow(
      fp.map(mapCartItemToChargeItem),
      addDiscountItem(cart),
      addShipingItem(cart),
      fp.sortBy<ChargeItem>("itemId")
    )(cart.items);

    return result;
  }

  private buildCheckoutRequest(cart: CartDTO): ChargeRequest {
    const request: ChargeRequest = {
      merchantCode: FAWRY_MERCHANT_CODE,
      merchantRefNum: cart.id,
      customerMobile: cart.shipping_address.phone,
      customerEmail: cart.email,
      customerName: cart.shipping_address.first_name + " " + cart.shipping_address.last_name,
      customerProfileId: cart.customer_id,
      language: "ar-eg",
      chargeItems: this.getCheckoutItems(cart),
      returnUrl: `${STORE_URL}/${FAWRY_RETURN_PATH}`,
      authCaptureModePayment: false,
      signature: this.generateSignature(cart),
    };

    return request;
  }

  async initiatePayment({
    context,
  }: CreatePaymentProviderSession): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    const checkoutRequest = this.buildCheckoutRequest(context.extra.cart as CartDTO);

    try {
      const response = await axios.post(`${FAWRY_BASE_URL}/fawrypay-api/api/payments/init`, checkoutRequest, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return { data: { checkoutUrl: response.data } };
    } catch (error) {
      return {
        error: error.message,
        code: "unknown",
        detail: error,
      };
    }
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<PaymentProviderError | { status: PaymentSessionStatus; data: PaymentProviderSessionResponse["data"] }> {
    return {
      data: paymentSessionData,
      status: "captured",
    };
  }

  async capturePayment(
    paymentData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    const externalId = paymentData.id;

    try {
      return {
        id: externalId,
      };
    } catch (e) {
      return {
        error: e,
        code: "unknown",
        detail: e,
      };
    }
  }

  cancelPayment(
    paymentData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    throw new Error("Method not implemented.");
  }

  deletePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    throw new Error("Method not implemented.");
  }
  getPaymentStatus(paymentSessionData: Record<string, unknown>): Promise<PaymentSessionStatus> {
    throw new Error("Method not implemented.");
  }
  refundPayment(
    paymentData: Record<string, unknown>,
    refundAmount: number
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    throw new Error("Method not implemented.");
  }
  retrievePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    throw new Error("Method not implemented.");
  }
  updatePayment(context: UpdatePaymentProviderSession): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    throw new Error("Method not implemented.");
  }
  getWebhookActionAndData(data: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    throw new Error("Method not implemented.");
  }
}
