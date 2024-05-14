"use strict";
exports.__esModule = true;
var dotenv = require("dotenv");
var fs = require("fs");
var ConfigService = /** @class */ (function () {
    function ConfigService() {
        //console.log(`${process.env.NODE_ENV || 'development'}`);
        var filePath = '.env.';
        if (process.env.NODE_ENV == undefined) {
            filePath += 'development';
        }
        else {
            filePath = filePath + process.env.NODE_ENV;
        }
        //console.log(filePath);
        this.envConfig = dotenv.parse(fs.readFileSync(filePath));
    }
    ConfigService.prototype.get = function (key) {
        return this.envConfig[key];
    };
    return ConfigService;
}());
exports.ConfigService = ConfigService;
