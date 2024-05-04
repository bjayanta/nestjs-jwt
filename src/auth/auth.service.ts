import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { PasswordResetToken } from './entities/password-reset-token';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private saltOrRounds = 10;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    private readonly entityManager: EntityManager,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
  ) {}

  async validateUser({ username, password, remember_me }: AuthPayloadDto) {
    const findUser = await this.usersRepository.findOneBy({ email: username });

    if (findUser && findUser.is_active) {
      const isMatch = await bcrypt.compare(password, findUser.password);

      if (isMatch) {
        const { password, ...user } = findUser;

        const token =
          remember_me === 1
            ? this.jwtService.sign(user, {
                expiresIn: this.config.get<string>('JWT_EXPIRES'),
              })
            : this.jwtService.sign(user);

        return {
          ...user,
          accessToken: token,
          refreshToken: this.jwtService.sign(user, {
            secret: this.config.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.config.get<string>('JWT_REFRESH_TOKEN_EXPIRES'),
          }),
        };
      }
    }

    // Unauthorized error
    throw new UnauthorizedException({
      statusCode: HttpStatus.UNAUTHORIZED,
      error: 'Incorrect username or password.',
    });
  }

  async register(user: CreateUserDto) {
    const password = await bcrypt.hash(user.password, this.saltOrRounds);
    const newUser = new User({ ...user, password });

    // Create new user
    await this.entityManager.save(newUser);

    // Generate
    const verificationKey = this.generateVerificationKey(newUser);
    const verificationLink =
      'http://localhost:3000/auth/email-verification?email=' +
      newUser.email +
      '&ticket=' +
      verificationKey;

    const transporter = {
      from: {
        name: this.config.get<string>('APP_NAME'),
        address: this.config.get<string>('MAIL_FROM_ADDRESS'),
      },
      to: [{ name: 'John Doe', address: 'johndoe@example.com' }],
      subject: 'Account activation request',
      text:
        '"Company-name account. Verify Your Account. Account: ' +
        newUser.email +
        '. Verify Link: ' +
        verificationLink +
        '. Thanks, The Company account team"',
      html:
        'Company-name account <h2>Verify Your Account</h2> <p>Account: ' +
        newUser.email +
        '</p><p>Verify Link: <a href="' +
        verificationLink +
        '" style="text-transform: uppercase;">Verify your account</a></p><p>If you are having any issues with your account, please don\'t hesitate to contact us by replying to this mail.</p><br>Thanks,<br>The Company account team',
    };

    try {
      await this.mailerService.sendMail(transporter);
    } catch (error) {
      console.error(error);
    }

    return newUser;
  }

  async refresh_token(payload: any) {
    const { password, ...user } = await this.usersRepository.findOneBy({
      email: payload.email,
    });

    return { accessToken: this.jwtService.sign(user) };
  }

  async account_activation(email: string, ticket: string) {
    const user = await this.usersRepository.findOneBy({ email: email });
    const verificationKey = this.generateVerificationKey(user);

    try {
      if (user && ticket === verificationKey) {
        await this.entityManager.update(User, user.id, {
          email_verified_at: new Date(),
          is_active: true,
        });

        return {
          statusCode: HttpStatus.OK,
          message:
            'Account activation process is done. You can login your account.',
        };
      }
    } catch (error) {
      console.log(error);
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Activation link expired.',
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOneBy({
      email: forgotPasswordDto.email,
    });

    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const details = await this.createForgottenPasswordToken(user);

    if (details && details.token) {
      const transporter = {
        from: {
          name: this.config.get<string>('APP_NAME'),
          address: this.config.get<string>('MAIL_FROM_ADDRESS'),
        },
        to: [{ name: 'John Doe', address: 'johndoe@example.com' }],
        subject: 'Forgotten password request',
        text:
          '"Company-name account. Password reset code, Please use this code to reset the password — it will expire in 15 minutes: ' +
          details.token +
          ' If you did not request a password reset from Company Account, you can safely ignore this email. Thanks, The Company account team"',
        html:
          'Company-name account <h2>Password reset code</h2> <p>Please use this code to reset the password — it will expire in 15 minutes:</p><h3>' +
          details.token +
          '</h3>If you did not request a password reset from Company Account, you can safely ignore this email.<br><br>Thanks,<br>The Company account team',
      };

      try {
        await this.mailerService.sendMail(transporter);
      } catch (error) {
        console.error(error);
      }
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Reset token created. Please check your email.',
    };
  }

  /**
   * Generate new token and store
   *
   * @param {*} user
   * @return {*}
   * @memberof AuthService
   */
  async createForgottenPasswordToken(user: any): Promise<PasswordResetToken> {
    const currentDate = new Date();

    const passwordResetToken =
      await this.passwordResetTokenRepository.findOneBy({
        email: user.email,
      });

    if (
      passwordResetToken &&
      (currentDate.getTime() - passwordResetToken.created_at.getTime()) /
        60000 <
        15
    ) {
      throw new HttpException(
        'Reset password mail sended recently. Please check your email.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      if (passwordResetToken) {
        await this.passwordResetTokenRepository.remove(passwordResetToken);
      }

      // Create
      const record = new PasswordResetToken({
        email: user.email,
        token: this.generateCode(),
      });

      await this.entityManager.save(record);

      return record;
    } catch (error) {
      throw new HttpException(
        'Token was not generated.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const currentDate = new Date();

    const passwordResetDetails =
      await this.passwordResetTokenRepository.findOneBy({
        email: resetPasswordDto.email,
        token: resetPasswordDto.token,
      });

    // Check token is expired or not
    if (
      passwordResetDetails &&
      (currentDate.getTime() - passwordResetDetails.created_at.getTime()) /
        60000 >
        15
    ) {
      throw new HttpException(
        'Sorry, your token expired.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (passwordResetDetails) {
      // Hash
      const hashPassword = await bcrypt.hash(
        resetPasswordDto.password,
        this.saltOrRounds,
      );

      // Get user
      const { password, ...user } = await this.usersRepository.findOneBy({
        email: passwordResetDetails.email,
      });

      // Update
      await this.entityManager.update(User, user.id, {
        password: hashPassword,
      });

      // Delete password reset token details
      this.passwordResetTokenRepository.delete(user.email);

      // Success
      return {
        statusCode: HttpStatus.OK,
        message: 'Password has been changed successfully.',
      };

      // Login
      // return { ...user, token: this.jwtService.sign(user) };
    }

    throw new HttpException('Reset details not found.', HttpStatus.NOT_FOUND);
  }

  async show(id: number) {
    const user = this.usersRepository.findOneByOrFail({ id });
    return user;
  }

  generateCode() {
    const length = 8;
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

    let retVal = '';

    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }

    return retVal;
  }

  generateVerificationKey(user: any) {
    const keyDetails = {
      id: user.id,
      name: user.name,
      email: user.email,
      email_verified_at: user.email_verified_at,
      is_superadmin: user.is_superadmin,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return Buffer.from(JSON.stringify(keyDetails)).toString('base64');
  }
}
