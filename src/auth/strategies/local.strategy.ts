import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  validate(username: string, password: string, remember_me: boolean) {
    const user = this.authService.validateUser({
      username,
      password,
      remember_me,
    });
    if (!user) throw new UnauthorizedException();

    return user;
  }
}
