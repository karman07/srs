import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',  // Allow all origins
    methods: '*',  // Allow all methods
    allowedHeaders: '*',  // Allow all headers
    credentials: true, // Allow cookies/auth headers if needed
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
