import { TerminusEndpoint, TerminusOptionsFactory, DNSHealthIndicator, TerminusModuleOptions } from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';

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
