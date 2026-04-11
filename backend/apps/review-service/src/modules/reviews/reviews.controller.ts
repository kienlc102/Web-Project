import { Controller, Get } from '@nestjs/common';

@Controller('reviews')
export class ReviewsController {
	@Get('health')
	health() {
		return { ok: true, service: 'review-service' };
	}
}
