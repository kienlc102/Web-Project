import { Controller, Get } from '@nestjs/common';

@Controller('fulfillments')
export class FulfillmentController {
	@Get('health')
	health() {
		return { ok: true, service: 'fulfillment-service' };
	}
}
