import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TeachersModule } from './teachers/teachers.module';
import { QuestionsModule } from './questions/questions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { EdaModule } from './eda/eda.module';
// import { ReviewsModule } from './reviews/reviews.module';
// import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    MongooseModule.forRoot(process.env.MONGO_URI), 
    AuthModule, 
    UserModule, 
    TeachersModule, 
    QuestionsModule,
    ReviewsModule,
    EdaModule
    // ReviewsModule, // ✅ Reviews & Ratings Module
    // AdminModule, // ✅ Admin Management Module
  ],
})
export class AppModule {}
