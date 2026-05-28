export const ORDER_COMPLETED_EVENT = 'OrderCompleted';
export const ORDER_COMPLETED_ROUTING_KEY = 'fulfillment.order_completed';

export interface OrderCompletedPayload {
  fulfillmentId: string;
  orderId: string;
  customerId: string;
  sellerId: string;
  completedAt: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
