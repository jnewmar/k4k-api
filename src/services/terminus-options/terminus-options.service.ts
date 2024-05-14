import { Injectable } from '@nestjs/common';
import { TerminusOptionsFactory, DNSHealthIndicator, TerminusModuleOptions, TerminusEndpoint } from '@nestjs/terminus';

@Injectable()
export class TerminusOptionsService implements TerminusOptionsFactory {
    constructor(private readonly dns: DNSHealthIndicator) {}

    createTerminusOptions(): TerminusModuleOptions {
        const healthEndpoint: TerminusEndpoint = {
            url: '/health',
            healthIndicators: [],
        };
        return {
            endpoints: [healthEndpoint],
        };
    }
}
