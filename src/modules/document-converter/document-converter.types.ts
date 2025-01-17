import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export enum DocumentType {
    STRING = 'string',
    JSON = 'json',
    XML = 'xml',
  }


  export class DocumentConverterRequest {
    @IsNotEmpty()
    document: string | object;
  
  
    @IsEnum(DocumentType)
    @IsNotEmpty()
    outputFormat: DocumentType;  
  
    @IsString()
    @IsOptional()
    lineSeparator?: string; 

    @IsString()
    @IsOptional()
    elementSeparator?: string; 
  }