import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '../../services/config/config.service';

@Injectable()
export class EskolareAuthGuard implements CanActivate {

  constructor(private readonly configService: ConfigService){}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requestToken = context.switchToHttp().getRequest().headers['x-eskolare-token'];
    const accessToken = this.configService.environment.Eskolare.webhook_access_token;
    return (accessToken === requestToken);
  }
}
