import { Module, DynamicModule, Global } from '@nestjs/common';
import { infra } from 'src/infra/common/ioc';
import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string(),
  MONGODB_NAME: z.string(),
  RABBITMQ_URL: z.string(),
});

@Global()
@Module({})
export class EnvironmentModule {
  static forRoot(): DynamicModule {
    const { MONGODB_URI, MONGODB_NAME, RABBITMQ_URL } = envSchema.parse(
      process.env,
    );

    return {
      module: EnvironmentModule,
      providers: [
        {
          provide: infra.environment.mongoDbUri,
          useValue: MONGODB_URI,
        },
        {
          provide: infra.environment.mongoDbName,
          useValue: MONGODB_NAME,
        },
        {
          provide: infra.environment.messageBrokerUrl,
          useValue: RABBITMQ_URL,
        },
      ],
      exports: [
        infra.environment.mongoDbUri,
        infra.environment.mongoDbName,
        infra.environment.messageBrokerUrl,
      ],
    };
  }
}
