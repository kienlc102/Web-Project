export const ORDER_PLACED_EVENT = 'OrderPlaced';
export const ORDER_PLACED_ROUTING_KEY = 'order.placed';

export interface OrderPlacedPayload {
  orderId: string;
  customerId: string;
  shippingAddress: Record<string, unknown>;
  paymentMethod: string;
  currency: string;
  totals: {
    subtotal: number;
    totalQuantity: number;
    total: number;
  };
  items: Array<{
    productId: string;
    sellerId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}
