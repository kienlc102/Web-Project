# Fulfillment Service

Fulfillment owns seller-side order processing. In the integration contract, the logical `seller_orders` model is implemented by the `fulfillments` table.

## Owned Data

- `fulfillments`: seller order records, delivery status, tracking code, carrier, item snapshot.
- `processed_messages`: inbox/idempotency table for consumed events.
- `outbox`: transactional outbox for events emitted after seller status changes.

## Consumed Events

Queue: `fulfillment.order_placed.q`

Routing key: `order.placed`

Event: `OrderPlaced`

Behavior:

- Check `processed_messages` by `eventId`.
- Group order items by `sellerId`.
- Create one `fulfillments` record per seller with status `PENDING`.
- Save the consumed `eventId` to prevent duplicate fulfillment creation.

## REST API

Base URL when running directly: `http://localhost:3002`

### Health

```http
GET /fulfillments/health
```

### Debug / Admin Fulfillment APIs

```http
POST /fulfillments
GET /fulfillments
GET /fulfillments?orderId=<order-id>
GET /fulfillments/:id
PATCH /fulfillments/:id/status
```

`PATCH /fulfillments/:id/status` body:

```json
{
  "status": "SHIPPED",
  "carrier": "GHN",
  "trackingCode": "GHN123"
}
```

### Seller Order APIs

```http
GET /seller/orders?status=PENDING&page=1&limit=20
PATCH /seller/orders/:id/confirm
PATCH /seller/orders/:id/ship
PATCH /seller/orders/:id/deliver
PATCH /seller/orders/:id/complete
```

Optional seller context header for local testing:

```http
x-seller-id: seller-uuid
```

`PATCH /seller/orders/:id/ship` body:

```json
{
  "carrier": "GHN",
  "trackingCode": "GHN123"
}
```

## Status Transitions

```text
PENDING -> CONFIRMED -> SHIPPED -> DELIVERED -> COMPLETED
```

`PACKED` and `CANCELLED` are still supported internally:

```text
CONFIRMED -> PACKED -> SHIPPED
PENDING/CONFIRMED/PACKED -> CANCELLED
```

## Published Events

All events are written to `outbox` first, then published to `cnweb.events`.

| Action | Event | Routing key |
| --- | --- | --- |
| Confirm seller order | `SellerOrderConfirmed` | `fulfillment.seller_order_confirmed` |
| Ship or deliver | `DeliveryUpdated` | `fulfillment.delivery_updated` |
| Complete | `OrderCompleted` | `fulfillment.order_completed` |

