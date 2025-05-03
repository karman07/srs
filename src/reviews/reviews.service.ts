import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { EdaService } from '../eda/eda.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private readonly edaService: EdaService, 
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const review = new this.reviewModel(createReviewDto);
    const savedReview = await review.save();

    // After review is saved, update Eda with the new review data
    await this.edaService.updateEda(
      savedReview.teacherId,
      savedReview.subject,
      savedReview.branch
    );

    return savedReview;
  }

  async findByBranchSubjectTeacher(branch: string, subject: string, teacherId: string): Promise<Review[]> {
    const query: any = {};
  
    if (branch) query.branch = branch;
    if (subject) query.subject = subject;
    if (teacherId) query.teacherId = teacherId;
  
    return this.reviewModel.find(query).exec();
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
    
    // After updating the review, update Eda with the new review data
    await this.edaService.updateEda(
      review.teacherId,
      review.subject,
      review.branch
    );

    return review;
  }

  async remove(id: string): Promise<void> {
    const result = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Review not found');
  }

  async filterReview(
    branch?: string,
    subject?: string,
    teacherId?: string,
    studentId?: string,
  ): Promise<Review[]> {
    const query: any = {};

    if (branch) query.branch = branch;
    if (subject) query.subject = subject;
    if (teacherId) query.teacherId = teacherId;
    if (studentId) query.studentId = studentId;

    return this.reviewModel.find(query).exec();
  }

}
