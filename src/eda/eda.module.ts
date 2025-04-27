import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Eda, EdaSchema } from './schemas/eda.schema';
import { Review, ReviewSchema } from '../reviews/schemas/review.schema';
import { EdaService } from './eda.service';
import { EdaController } from './eda.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Eda.name, schema: EdaSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  providers: [EdaService],
  controllers: [EdaController],
  exports: [EdaService], // IMPORTANT: Export service so ReviewService can use it
})
export class EdaModule {}
