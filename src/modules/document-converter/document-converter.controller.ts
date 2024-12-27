import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DocumentConverterService } from './document-converter.service';
import { DocumentConverterRequest } from './document-converter.types';

@Controller('converter')
export class DocumentConverterController {
  constructor(private readonly documentConverterService: DocumentConverterService) {}

  @Post()
  public async convertDocument(@Body() {document, outputFormat, lineSeparator, elementSeparator}: DocumentConverterRequest): Promise<any> {
    return this.documentConverterService.convertDocument(document, outputFormat, lineSeparator, elementSeparator);
  }
 
}
