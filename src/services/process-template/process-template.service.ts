import { Injectable } from '@nestjs/common';
import { readFile } from 'fs';
import { compile } from 'handlebars';

@Injectable()
export class ProcessTemplateService {
    private templatesBasePath: string = 'templates/';

    constructor() {}

    private readFile(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            readFile(filePath, { encoding: 'utf-8' }, (err: any, content: string) => {
                if(err) return reject(err);
                return resolve(content);
            });
        });
    }
    
    public proccessTemplate(filePath: string, replacements: any): Promise<string> {
        return new Promise( async (resolve, reject) => {
            try {
                const file = await this.readFile(`${this.templatesBasePath}${filePath}`);
                const template = compile(file);
                const templateProcessed = template(replacements);
                return resolve(templateProcessed);
            }
            catch(err) {
               return reject(err);
            }
        });
    }
}
