import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Builder, parseStringPromise } from "xml2js";
import { DocumentType } from './document-converter.types';

@Injectable()
export class DocumentConverterService {
private readonly logger = new Logger(DocumentConverterService.name);
  public async getHello(): Promise<string> {
    const message = 'Hello Manva!';
    return message
  }

  public async convertDocument(document: any, outputFormat: string, lineSeparator:string, elementSeparator: string): Promise<any> {
    console.log('---inside');
    if (!document && !document?.trim()) {
        throw new BadRequestException('Document is required');
    }
    
    if(!outputFormat) {
        throw new BadRequestException('Output format is required');
    }

    // Determine input format
    const inputFormat = this.detectFormat(document);

    if(inputFormat === outputFormat) {
        this.logger.log('Input and output format are the same');
        return document;
    }
    if([inputFormat, outputFormat].includes(DocumentType.STRING)  && !(lineSeparator && elementSeparator)) {
        throw new BadRequestException('Line separator and element separator required for string format');
    }

    try{
      // Step 1: Convert from input format to JSON (which will be our intermediate format)
      let jsonFormat = {}

      switch(inputFormat) {
        case DocumentType.STRING: 
          jsonFormat = await this.stringToJson(document, lineSeparator, elementSeparator);
          break;

        case DocumentType.JSON:
          jsonFormat = document;
          break;

        case DocumentType.XML: 
          jsonFormat = await this.xmlToJson(document);
          break; 
      } 

      // Step 2: Convert from JSON (intermediate format) to output format and return
      switch(outputFormat) {
        case DocumentType.STRING: 
          return this.jsonToString(jsonFormat, lineSeparator, elementSeparator);

        case DocumentType.JSON:
          return jsonFormat;

        case DocumentType.XML:
          return this.jsonToXml(jsonFormat);
      }
    } catch(error) {
      this.logger.error('Error converting formats', error);
      throw error
    }
   
  }

  private detectFormat(document: string | object): DocumentType {
    console.log('--detecting formats');
    try {
        if (typeof document === 'string') {
            if (document.trim().startsWith('<?xml') || document.trim().startsWith('<root>')) {
              console.log('XML');  
              return DocumentType.XML;
            } else 
            { 
              console.log
                return DocumentType.STRING ;
            }
          } else if (typeof document === 'object') {
              return DocumentType.JSON;
          } else {
            throw new BadRequestException('Unsupported document format');
          }
    } catch(error) {
        this.logger.error('Error detecting format', error);
        throw error;
    }
  }

  private async stringToJson(document: string, lineSeparator: string, elementSeparator: string): Promise<object> {
    try {
      const lines = document.replace(/\s+/g, '').split(lineSeparator);
      const result = {};
      for (const line of lines) {
          if(line.trim().length === 0 ) {
              continue;
          }
          const [segmentName, ...elements ] = line.split(elementSeparator);
          const elementJson = {}
          for(let i =0 ; i<elements.length; i++) {
              const keyName = segmentName.concat((i+1).toString());
              elementJson[keyName] = elements[i]
          }
          if (!result[segmentName]) {
              result[segmentName] = [elementJson];
          } else {
              result[segmentName].push(elementJson);
          }
      }
      return result;
    } catch(error) {
      this.logger.error('Error converting string to json', error);
      throw error;
    }
  }

  private async jsonToString(document: { [key: string]: object[] }, lineSeparator, elementSeparator): Promise<string> {
    try {
      let result = ''
      for(const segmentName in document) {
          for(const element of document[segmentName]) {
              const elements = Object.values(element);
              result = result.concat(segmentName).concat(elementSeparator).concat(elements.join(elementSeparator)).concat(`${lineSeparator}\n`);
          }
      }
      return result;
    } catch(error) {
      this.logger.error('Error converting json to string');
      throw error;
    }
  }

  public async xmlToJson(xml: string): Promise<any> {
    try {
        const jsonResult = await parseStringPromise(xml, { explicitArray: false, explicitRoot: false });
        // For segments containing only one set of child elements (e.g., addressId and productId), the parsed JSON will not automatically wrap them in an array when using xml2js with the explicitArray: false option.
        // Wrap these fields into arrays to get proper format.
        for (const key in jsonResult) {
            jsonResult[key] = Array.isArray(jsonResult[key]) ? jsonResult[key] : [jsonResult[key]];
          }
        return jsonResult;
    } catch (error) {
        this.logger.error("Error converting XML to json", error);
        throw error;
  }
}

  public async jsonToXml(json: object): Promise<string> {
    try{
      const builder = new Builder();
      const result = await builder.buildObject(json);
      return result;
    } catch(error) {
      this.logger.error("Error converting json to xml", error);
      throw error;
    }
  }
}
