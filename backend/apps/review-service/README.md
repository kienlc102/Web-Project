# Review Service

Review owns customer reviews and review eligibility. It uses only logical references such as `orderId`, `customerId`, `sellerId`, `productId`, and `fulfillmentId`; it does not read another service database.

## Owned Data

- `review_eligibilities`: products that a customer may review after order completion.
- `reviews`: submitted product reviews.
- `processed_messages`: inbox/idempotency table for consumed events.
- `outbox`: transactional outbox for review-created events.

## Consumed Events

Queue: `review.order_completed.q`

Routing key: `fulfillment.order_completed`

Event: `OrderCompleted`

Behavior:

- Check `processed_messages` by `eventId`.
- Create one eligibility record per completed product item.
- Save the consumed `eventId` to avoid duplicate eligibility records.

## REST API

Base URL when running directly: `http://localhost:3003`

### Health

```http
GET /reviews/health
```

### Reviews

```http
POST /reviews
GET /reviews
GET /reviews?productId=<product-id>
GET /reviews/products/:productId
GET /reviews/:id
PATCH /reviews/:id
```

`POST /reviews` body:

```json
{
  "productId": "product-1",
  "customerId": "user-1",
  "orderId": "order-1",
  "fulfillmentId": "fulfillment-1",
  "rating": 5,
  "comment": "Good product"
}
```

`PATCH /reviews/:id` body:

```json
{
  "rating": 4,
  "comment": "Updated comment"
}
```

### Eligibility

```http
GET /reviews/eligibility?customerId=<user-id>&orderId=<order-id>&productId=<product-id>
```

The customer can submit a review only when an active eligibility record exists for the same `customerId`, `orderId`, `fulfillmentId`, and `productId`.

## Published Events

All events are written to `outbox` first, then published to `cnweb.events`.

| Action | Event | Routing key |
| --- | --- | --- |
| Submit review | `ReviewCreated` | `review.created` |

