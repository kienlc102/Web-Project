export class CreateFulfillmentDto {
  orderId: string;
  customerId: string;
  sellerId: string;
  items?: Array<{
    productId: string;
    name?: string;
    productName?: string;
    quantity: number;
    unitPrice?: number;
    price?: number;
    lineTotal?: number;
  }>;
}
