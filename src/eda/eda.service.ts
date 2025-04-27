import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Eda, EdaDocument } from './schemas/eda.schema';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';

@Injectable()
export class EdaService {
  constructor(
    @InjectModel(Eda.name) private edaModel: Model<EdaDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async updateEda(teacherId: string, subject: string, branch: string): Promise<Eda> {
    const reviews = await this.reviewModel.find({ teacherId, subject, branch });

    if (reviews.length === 0) {
      throw new Error('No reviews found for this teacher with this subject and branch');
    }

    // Flatten all ratings from reviews (ratings are assumed to be an array of individual ratings)
    const allRatings = reviews.flatMap(review => review.ratings.map(r => r.rating));
    const totalReviews = reviews.length;

    // Calculate the average rating across all reviews
    const averageRating = allRatings.reduce((acc, curr) => acc + curr, 0) / allRatings.length;

    // Categorize reviews based on their average rating
    let positiveReviews = 0;
    let moderateReviews = 0;
    let negativeReviews = 0;

    reviews.forEach((review) => {
      const reviewAverage = review.ratings.reduce((acc, r) => acc + r.rating, 0) / review.ratings.length;
      if (reviewAverage > 4) {
        positiveReviews++;
      } else if (reviewAverage >= 2.5) {
        moderateReviews++;
      } else {
        negativeReviews++;
      }
    });

    let edaResult: 'positive' | 'moderate' | 'negative';
    if (averageRating > 4) edaResult = 'positive';
    else if (averageRating >= 2.5) edaResult = 'moderate';
    else edaResult = 'negative';

    const theoryRatings = allRatings.slice(0, 9); 
    const practicalRatings = allRatings.slice(9, 12); 
    const examRatings = allRatings.slice(12, 15); 

    const avg = (arr: number[]) => arr.reduce((acc, val) => acc + val, 0) / (arr.length || 1);

  
    const theoryAverage = avg(theoryRatings);
    const practicalAverage = avg(practicalRatings);
    const examAverage = avg(examRatings);

    const calculateScore = (average: number): number => {
      return Math.round((average / 5) * 100);
    };

    const theoryScore = calculateScore(theoryAverage);
    const practicalScore = calculateScore(practicalAverage);
    const examScore = calculateScore(examAverage);

    // Update or create the Eda record with the calculated values
    const updatedEda = await this.edaModel.findOneAndUpdate(
      { teacherId, subject, branch },
      {
        teacherId,
        subject,
        branch,
        totalReviews,
        averageRating,
        positiveReviews,
        moderateReviews,
        negativeReviews,
        edaResult,
        theoryScore:theoryAverage,
        practicalScore:practicalAverage,
        examScore:examAverage,
      },
      { upsert: true, new: true }
    );

    return updatedEda;
  }

  async getEda(teacherId: string, subject: string, branch: string): Promise<Eda> {
    return this.edaModel.findOne({ teacherId, subject, branch });
  }
}
