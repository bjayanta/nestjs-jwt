import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenAuthGuard } from './guards/refreshToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalGuard)
  login(@Req() req: Request) {
    return req.user;
  }

  @Post('register')
  async register(@Body(ValidationPipe) user: CreateUserDto) {
    return this.authService.register(user);
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Post('refresh')
  async refreshToken(@Req() req: Request) {
    return this.authService.refresh_token(req.user);
  }

  @Get('email-verification')
  async emailVerification(
    @Query('email') email: string,
    @Query('ticket') ticket: string,
  ) {
    return this.authService.account_activation(email, ticket);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@Req() req: Request) {
    console.log('Inside AuthController status method');
    return req.user;
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body(ValidationPipe) forgotPasswordDto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('disable-account')
  @UseGuards(JwtAuthGuard)
  async disableAccount(@Req() req: Request) {
    return this.authService.disable_account(req.user);
  }
}
