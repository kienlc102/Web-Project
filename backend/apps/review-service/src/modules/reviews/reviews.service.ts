import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReviewEligibilityEntity } from './entities/review.entity';
import { ReviewRecordEntity } from './entities/review-record.entity';
import { OutboxEntity } from '../outbox/outbox.entity';
import { ProcessedMessageEntity } from '../inbox/processed-message.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { createEvent } from '@backend/common';
import {
  OrderCompletedPayload,
  REVIEW_CREATED_EVENT,
  ReviewCreatedPayload,
} from '@backend/contracts';
import { ROUTING_KEYS } from '../../shared/constants';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(ReviewEligibilityEntity)
    private readonly eligibilityRepo: Repository<ReviewEligibilityEntity>,

    @InjectRepository(ReviewRecordEntity)
    private readonly reviewRepo: Repository<ReviewRecordEntity>,

    @InjectRepository(OutboxEntity)
    private readonly outboxRepo: Repository<OutboxEntity>,

    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create review eligibility records when OrderCompleted is consumed.
   */
  async createEligibility(data: {
    fulfillmentId: string;
    orderId: string;
    customerId: string;
    sellerId: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<ReviewEligibilityEntity[]> {
    if (!data.items.length) return [];

    const records = data.items.map((item) =>
      this.eligibilityRepo.create({
        fulfillmentId: data.fulfillmentId,
        orderId: data.orderId,
        customerId: data.customerId,
        sellerId: data.sellerId,
        productId: item.productId,
        isEligible: true,
      }),
    );
    return this.eligibilityRepo.save(records);
  }

  async createEligibilityFromOrderCompleted(
    eventId: string,
    payload: OrderCompletedPayload,
    consumerName: string,
  ): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const processed = await manager.findOne(ProcessedMessageEntity, {
        where: { consumerName, messageId: eventId },
      });
      if (processed) {
        this.logger.warn(`Duplicate OrderCompleted event ${eventId}, skipping`);
        return 0;
      }

      const records = payload.items.map((item) =>
        manager.create(ReviewEligibilityEntity, {
          fulfillmentId: payload.fulfillmentId,
          orderId: payload.orderId,
          customerId: payload.customerId,
          sellerId: payload.sellerId,
          productId: item.productId,
          isEligible: true,
        }),
      );
      if (records.length) {
        await manager.save(ReviewEligibilityEntity, records);
      }

      await manager.save(ProcessedMessageEntity, {
        consumerName,
        messageId: eventId,
      });

      return records.length;
    });
  }

  /**
   * Submit a review — checks eligibility, writes review + outbox event transactionally.
   */
  async submitReview(dto: CreateReviewDto): Promise<ReviewRecordEntity> {
    return this.dataSource.transaction(async (manager) => {
      // Check eligibility
      const eligibility = await manager.findOne(ReviewEligibilityEntity, {
        where: {
          fulfillmentId: dto.fulfillmentId,
          customerId: dto.customerId,
          orderId: dto.orderId,
          productId: dto.productId,
          isEligible: true,
        },
      });

      if (!eligibility) {
        throw new BadRequestException(
          'Not eligible to review this order. The fulfillment must be completed first.',
        );
      }

      // Validate rating
      if (dto.rating < 1 || dto.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }

      // Check for duplicate review
      const existing = await manager.findOne(ReviewRecordEntity, {
        where: {
          fulfillmentId: dto.fulfillmentId,
          customerId: dto.customerId,
          productId: dto.productId,
        },
      });
      if (existing) {
        throw new BadRequestException(
          'You have already reviewed this product for this order',
        );
      }

      // Create review
      const review = manager.create(ReviewRecordEntity, {
        productId: dto.productId,
        customerId: dto.customerId,
        orderId: dto.orderId,
        fulfillmentId: dto.fulfillmentId,
        rating: dto.rating,
        comment: dto.comment,
      });
      const saved = await manager.save(ReviewRecordEntity, review);

      // Mark eligibility as used
      eligibility.isEligible = false;
      await manager.save(ReviewEligibilityEntity, eligibility);

      // Write outbox event
      const event = createEvent<ReviewCreatedPayload>(
        REVIEW_CREATED_EVENT,
        saved.id,
        {
          reviewId: saved.id,
          productId: saved.productId,
          customerId: saved.customerId,
          orderId: saved.orderId,
          rating: saved.rating,
          comment: saved.comment,
          createdAt: saved.createdAt.toISOString(),
        },
        { aggregateType: 'Review', producer: 'review-service' },
      );
      await manager.save(OutboxEntity, {
        eventId: event.eventId,
        eventName: ROUTING_KEYS.REVIEW_CREATED,
        aggregateId: event.aggregateId,
        payload: event,
        status: 'PENDING',
      });

      this.logger.log(
        `Review ${saved.id} created for product ${saved.productId}`,
      );
      return saved;
    });
  }

  /** Get reviews by product */
  async findByProduct(productId: string): Promise<ReviewRecordEntity[]> {
    return this.reviewRepo.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }

  /** Get all reviews */
  async findAll(): Promise<ReviewRecordEntity[]> {
    return this.reviewRepo.find({ order: { createdAt: 'DESC' } });
  }

  /** Get single review */
  async findOne(id: string): Promise<ReviewRecordEntity> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException(`Review ${id} not found`);
    return review;
  }

  /** Update a review */
  async update(id: string, dto: UpdateReviewDto): Promise<ReviewRecordEntity> {
    const review = await this.findOne(id);
    if (dto.rating !== undefined) {
      if (dto.rating < 1 || dto.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }
      review.rating = dto.rating;
    }
    if (dto.comment !== undefined) {
      review.comment = dto.comment;
    }
    return this.reviewRepo.save(review);
  }

  /** Check eligibility for a given customer + order */
  async checkEligibility(
    customerId: string,
    orderId: string,
    productId?: string,
  ): Promise<ReviewEligibilityEntity | null> {
    return this.eligibilityRepo.findOne({
      where: productId
        ? { customerId, orderId, productId }
        : { customerId, orderId },
    });
  }
}
