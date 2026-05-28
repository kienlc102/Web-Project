export const DELIVERY_UPDATED_EVENT = 'DeliveryUpdated';
export const DELIVERY_UPDATED_ROUTING_KEY = 'fulfillment.delivery_updated';

export interface DeliveryUpdatedPayload {
  fulfillmentId: string;
  orderId: string;
  customerId: string;
  sellerId: string;
  status: 'SHIPPED' | 'DELIVERED';
  carrier?: string;
  trackingCode?: string;
  packedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}
