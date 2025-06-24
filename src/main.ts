import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SentryService } from './lib/agent/sentry/sentry.service';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  if (process.env.NODE_ENV == 'production') {
    const sentryService = new SentryService();
    const { httpAdapter } = app.get(HttpAdapterHost);
    const sentryFilter = sentryService.initializeSentry(httpAdapter);
    app.useGlobalFilters(sentryFilter);
  }
  await app.listen(parseInt(process.env.BACKEND_PORT || '8080'));
  
}
bootstrap();
