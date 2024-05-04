import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

export class RefreshTokenAuthGuard extends AuthGuard('refreshToken') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('Inside JWT Refresh Token AuthGuard canActivate');
    return super.canActivate(context);
  }
}
