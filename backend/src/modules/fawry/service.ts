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
import { FAWRY_BASE_URL, FAWRY_MERCHANT_CODE, FAWRY_PAYMENT_EXPIRY, FAWRY_SECURITY_CODE } from "lib/constants";
import fp from "lodash/fp";
import crypto from "crypto";
import axios from "axios";

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
    console.log("🤯", Object.keys(container));
    console.log("🚀", Object.keys(options));

    this.options_ = options;
    this.logger_ = container.logger;
  }

  static validateOptions(options: Record<any, any>) {
    if (!options.apiKey) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `API key is required in the Fawry provider's options.`);
    }
  }

  private generateSignature(cart: CartDTO) {
    const merchantRefNum = cart.id;
    const customerProfileId = cart.customer_id;
    const returnUrl = "";
    const itemsDetails = fp.flow(
      fp.sortBy("id"),
      fp.map((item: CartLineItemDTO) => `${item.id}${item.quantity}${Number(item.unit_price).toFixed(2)}`),
      fp.join("")
    )(cart.items);

    const dataToHash = `${FAWRY_MERCHANT_CODE}${merchantRefNum}${customerProfileId}${returnUrl}${itemsDetails}${FAWRY_SECURITY_CODE}`;

    const signature = crypto.createHash("sha256").update(dataToHash).digest("hex");

    return signature;
  }

  private buildCheckoutRequest(cart: CartDTO) {
    const request = {
      merchantCode: FAWRY_MERCHANT_CODE,
      merchantRefNum: cart.id,
      customerMobile: cart.shipping_address.phone,
      customerEmail: cart.email,
      customerName: cart.shipping_address.first_name + " " + cart.shipping_address.last_name,
      customerProfileId: cart.customer_id,
      // paymentExpiry: FAWRY_PAYMENT_EXPIRY,
      language: "ar-eg",
      chargeItems: fp.flow(
        fp.sortBy("id"),
        fp.map((item: CartLineItemDTO) => ({
          itemId: item.id,
          description: item.title,
          price: item.unit_price,
          quantity: item.quantity,
          imageUrl: item.thumbnail,
        }))
      )(cart.items),
      returnUrl: "",
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
  capturePayment(
    paymentData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    throw new Error("Method not implemented.");
  }
  authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<PaymentProviderError | { status: PaymentSessionStatus; data: PaymentProviderSessionResponse["data"] }> {
    throw new Error("Method not implemented.");
  }
  cancelPayment(
    paymentData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    throw new Error("Method not implemented.");
  }
  //   async initiatePayment(
  //     context: CreatePaymentProviderSession
  //   ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
  //     const { amount, currency_code, context: customerDetails } = context;

  //     try {
  //       const response = await axios.post(`${FAWRY_BASE_URL}/fawrypay-api/api/payments/init`);
  //     } catch (error) {
  //       return {
  //         error: error.message,
  //         code: "unknown",
  //         detail: error,
  //       };
  //     }
  //   }
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
