import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class ConfigService {
    private readonly envConfig: Record<string, string>;

    constructor() {
        //console.log(`${process.env.NODE_ENV || 'development'}`);
        let filePath = '.env.';
        if (process.env.NODE_ENV == undefined) {
            filePath += 'development';
        } else {
            filePath = filePath + process.env.NODE_ENV;
        }
        //console.log(filePath);
        this.envConfig = dotenv.parse(fs.readFileSync(filePath));
    }

    get(key: string): string {
        return this.envConfig[key];
    }
}
