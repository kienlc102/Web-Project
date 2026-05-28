export const REVIEW_CREATED_EVENT = 'ReviewCreated';
export const REVIEW_CREATED_ROUTING_KEY = 'review.created';

export interface ReviewCreatedPayload {
  reviewId: string;
  productId: string;
  customerId: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
