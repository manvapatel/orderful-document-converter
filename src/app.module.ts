import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import Modules from './modules';
import { DocumentConverterModule } from './modules/document-converter/document-converter.module';

@Module({
  imports: [DocumentConverterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
