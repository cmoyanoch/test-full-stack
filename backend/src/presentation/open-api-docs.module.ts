import { Module } from '@nestjs/common';
import { OpenApiDocsController } from './open-api-docs.controller';

@Module({
  controllers: [OpenApiDocsController],
})
export class OpenApiDocsModule {}
