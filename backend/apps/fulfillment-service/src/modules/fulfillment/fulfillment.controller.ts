import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Headers,
} from '@nestjs/common';
import { FulfillmentService } from './fulfillment.service';
import { CreateFulfillmentDto } from './dto/create-fulfillment.dto';
import { UpdateFulfillmentStatusDto } from './dto/update-fulfillment-status.dto';

@Controller('fulfillments')
export class FulfillmentController {
  constructor(private readonly fulfillmentService: FulfillmentService) {}

  @Get('health')
  health() {
    return { ok: true, service: 'fulfillment-service' };
  }

  /** POST /fulfillments — create fulfillment (sync REST) */
  @Post()
  create(@Body() dto: CreateFulfillmentDto) {
    return this.fulfillmentService.create(dto);
  }

  /** GET /fulfillments — list all, optionally filter by orderId */
  @Get()
  findAll(@Query('orderId') orderId?: string) {
    if (orderId) return this.fulfillmentService.findByOrder(orderId);
    return this.fulfillmentService.findAll();
  }

  /** GET /fulfillments/:id — single fulfillment */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fulfillmentService.findOne(id);
  }

  /** PATCH /fulfillments/:id/status — update status (triggers outbox events) */
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateFulfillmentStatusDto,
  ) {
    return this.fulfillmentService.updateStatus(id, dto);
  }
}

@Controller('seller/orders')
export class SellerOrdersController {
  constructor(private readonly fulfillmentService: FulfillmentService) {}

  /** GET /seller/orders */
  @Get()
  findSellerOrders(
    @Query('sellerId') sellerId?: string,
    @Query('status') status?: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Headers('x-seller-id') sellerIdHeader?: string,
  ) {
    return this.fulfillmentService.findSellerOrders({
      sellerId: sellerIdHeader ?? sellerId,
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  /** PATCH /seller/orders/:id/confirm */
  @Patch(':id/confirm')
  confirm(
    @Param('id') id: string,
    @Headers('x-seller-id') sellerId?: string,
  ) {
    return this.fulfillmentService.confirmSellerOrder(id, sellerId);
  }

  /** PATCH /seller/orders/:id/ship */
  @Patch(':id/ship')
  ship(
    @Param('id') id: string,
    @Body() dto: { carrier?: string; trackingCode?: string },
    @Headers('x-seller-id') sellerId?: string,
  ) {
    return this.fulfillmentService.shipSellerOrder(id, dto, sellerId);
  }

  /** PATCH /seller/orders/:id/deliver */
  @Patch(':id/deliver')
  deliver(
    @Param('id') id: string,
    @Headers('x-seller-id') sellerId?: string,
  ) {
    return this.fulfillmentService.deliverSellerOrder(id, sellerId);
  }

  /** PATCH /seller/orders/:id/complete */
  @Patch(':id/complete')
  complete(
    @Param('id') id: string,
    @Headers('x-seller-id') sellerId?: string,
  ) {
    return this.fulfillmentService.completeSellerOrder(id, sellerId);
  }
}
