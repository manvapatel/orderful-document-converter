import { Module } from '@nestjs/common';
import { DocumentConverterController } from './document-converter.controller';
import { DocumentConverterService } from './document-converter.service';

@Module({
  imports: [],
  controllers: [DocumentConverterController],
  providers: [DocumentConverterService],
  exports: [DocumentConverterService],
})
export class DocumentConverterModule {}
