import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { TeachersService } from '../teachers/teachers.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private readonly teachersService: TeachersService
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const review = new this.reviewModel(createReviewDto);
    const savedReview = await review.save();

    return savedReview;
  }

  async findAll(): Promise<Review[]> {
    return this.reviewModel.find().exec();
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewModel.findByIdAndUpdate(id, updateReviewDto, { new: true }).exec();
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async remove(id: string): Promise<void> {
    const result = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Review not found');
  }
}
