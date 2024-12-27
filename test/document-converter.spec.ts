// Run test using npm test
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { expect } from 'chai';
import { DocumentConverterController } from '../src/modules/document-converter/document-converter.controller';
import { DocumentConverterService } from '../src/modules/document-converter/document-converter.service';



describe('Test convertDocument' , () => {
    let documentConverterService: DocumentConverterService;
    let app: INestApplication;
    const xmlFormat = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root><ProductID><ProductID1>4</ProductID1> <ProductID2>8</ProductID2> <ProductID3>15</ProductID3><ProductID4>16</ProductID4><ProductID5>23</ProductID5></ProductID> <ProductID><ProductID1>a</ProductID1><ProductID2>b</ProductID2><ProductID3>c</ProductID3><ProductID4>d</ProductID4><ProductID5>e</ProductID5></ProductID> <AddressID><AddressID1>42</AddressID1><AddressID2>108</AddressID2><AddressID3>3</AddressID3><AddressID4>14</AddressID4></AddressID> <ContactID><ContactID1>59</ContactID1><ContactID2>26</ContactID2></ContactID></root>';
    const stringFormat = 'ProductID*4*8*15*16*23~\nProductID*a*b*c*d*e~\nAddressID*42*108*3*14~\nContactID*59*26~\n';
    const jsonFormat =  {
      "ProductID": [
        {
          "ProductID1": "4",
          "ProductID2": "8",
          "ProductID3": "15",
          "ProductID4": "16",
          "ProductID5": "23"
        },
        {
          "ProductID1": "a",
          "ProductID2": "b",
          "ProductID3": "c",
          "ProductID4": "d",
          "ProductID5": "e"
        }
      ],
      "AddressID": [
        {
          "AddressID1": "42",
          "AddressID2": "108",
          "AddressID3": "3",
          "AddressID4": "14"
        }
      ],
      "ContactID": [
        {
          "ContactID1": "59",
          "ContactID2": "26"
        }
      ]
    }

    before(async() => {
      const moduleRef = await Test.createTestingModule({
          controllers: [DocumentConverterController],
          providers: [DocumentConverterService],
        }).compile();
    
        app = moduleRef.createNestApplication();
        documentConverterService = moduleRef.get<DocumentConverterService>(DocumentConverterService);
        await app.init();
    })
    after(async () => {
      await app.close();
    });

    describe('POST /converter', () => {
      it('Should  error if document is not provided ', async() => {
        const reqBody = {
          "outputFormat": "xml",
          "lineSeparator": "~",
          "elementSeparator": "*"
        }
        
        const response =  await request(app.getHttpServer())
          .post('/converter')
          .send(reqBody)
          .expect(400)

        expect(response.body.message).to.equal('Document is required'); 
      })

      it('Should  error if output format is not provided ', async() => {
        const reqBody = {
          "document": stringFormat,
          "lineSeparator": "~",
          "elementSeparator": "*"
        }
        
        const response =  await request(app.getHttpServer())
          .post('/converter')
          .send(reqBody)
          .expect(400)

        expect(response.body.message).to.equal('Output format is required'); 
      })

      it('Should  error if input format is string and separators are not provided ', async() => {
        const reqBody = {
          "document": stringFormat,
          "outputFormat": "xml",
          "lineSeparator": "~",
        }
        
        const response =  await request(app.getHttpServer())
          .post('/converter')
          .send(reqBody)
          .expect(400)

        expect(response.body.message).to.equal('Line separator and element separator required for string format'); 
      })

      it('Should  error if output format is string and separators are not provided ', async() => {
        const reqBody = {
          "document": jsonFormat,
          "outputFormat": "string",
        }
        
        const response =  await request(app.getHttpServer())
          .post('/converter')
          .send(reqBody)
          .expect(400)

        expect(response.body.message).to.equal('Line separator and element separator required for string format'); 
      })

      // it('Should  error if format is unsupported ', async() => {
      //   const reqBody = {
      //     "document": "<html></html>",
      //     "outputFormat": "xml",
      //     "lineSeparator": "~",
      //     "elementSeparator": "*",
      //   }
        
      //   const response =  await request(app.getHttpServer())
      //     .post('/converter')
      //     .send(reqBody)
      //     .expect(400)

      //   expect(response.body.message).to.equal('Unsupported document format'); 
      // })
      it('Should convert String to XML', async () => {
        const reqBody = {
          "document": stringFormat,
          "outputFormat": "xml",
          "lineSeparator": "~",
          "elementSeparator": "*",
        }
        
        const response = await request(app.getHttpServer())
        .post('/converter')
        .send(reqBody)
        .expect(201);
        expect(response.text.replace(/\s+/g, '')).to.equal(xmlFormat.replace(/\s+/g, ''));
      })

      it('Should convert String to JSON', async () => {
        const reqBody = {
          "document": stringFormat,
          "outputFormat": "json",
          "lineSeparator": "~",
          "elementSeparator": "*"
        }
        
        const response = await request(app.getHttpServer())
        .post('/converter')
        .send(reqBody)
        .expect(201);
        expect(response.text).to.equal(JSON.stringify(jsonFormat));
      })

      it('Should convert JSON to String', async () => {
        const reqBody = {
          "document": jsonFormat,
          "outputFormat": "string",
          "lineSeparator": "~",
          "elementSeparator": "*"
        }
        
        const response = await request(app.getHttpServer())
        .post('/converter')
        .send(reqBody)
        .expect(201);
        expect(response.text).to.equal(stringFormat);
      })

      it('Should convert JSON to XML', async () => {
        const reqBody = {
          "document": jsonFormat,
          "outputFormat": "xml",
        }
        
        const response = await request(app.getHttpServer())
        .post('/converter')
        .send(reqBody)
        .expect(201);
        expect(response.text.replace(/\s+/g, '')).to.equal(xmlFormat.replace(/\s+/g, ''));
      })
  
      it('Should convert XML to String', async () => {
        const reqBody = {
          "document": xmlFormat,
          "outputFormat": "string",
          "lineSeparator": "~",
          "elementSeparator": "*"
        }
        
        const response = await request(app.getHttpServer())
        .post('/converter')
        .send(reqBody)
        .expect(201);
        expect(response.text).to.equal(stringFormat);
      })
  
      it('Should convert XML to JSON', async () => {
        const reqBody = {
          "document": xmlFormat,
          "outputFormat": "json",
        }
        
        const response = await request(app.getHttpServer())
        .post('/converter')
        .send(reqBody)
        .expect(201);
        expect(response.text).to.equal(JSON.stringify(jsonFormat));
      })
  
    })
  })
