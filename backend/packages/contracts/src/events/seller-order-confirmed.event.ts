export const SELLER_ORDER_CONFIRMED_EVENT = 'SellerOrderConfirmed';
export const SELLER_ORDER_CONFIRMED_ROUTING_KEY =
  'fulfillment.seller_order_confirmed';

export interface SellerOrderConfirmedPayload {
  fulfillmentId: string;
  orderId: string;
  customerId: string;
  sellerId: string;
  status: 'CONFIRMED';
  confirmedAt: string;
}
