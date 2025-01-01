export interface FawryChargeResponse {
  type: string // Type of response e.g. ChargeResponse
  referenceNumber: string // FawryPay issued transaction reference number
  merchantRefNumber: string // Merchant issued transaction reference number
  orderAmount: string // Order amount in two decimal places format
  paymentAmount: string // The paid amount in two decimal places format
  fawryFees: string // The payment processing fees
  paymentMethod: "CashOnDelivery" | "PayAtFawry" | "MWALLET" | "CARD" | "VALU" // Payment Method Selected by your client
  orderStatus: string // Order Status
  paymentTime: string // Timestamp to record when the payment has been processed
  customerMobile: string // Customer Mobile Number
  customerMail: string // Customer E-mail address
  customerProfileId: string // Customer Profile ID in the merchant's system
  signature: string // Response Signature generated as SHA-256 hash
  statusCode: string // Response status code
  statusDescription: string // Response status description
}
