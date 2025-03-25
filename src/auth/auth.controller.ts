import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  BadRequestException,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Request, Response } from 'express';
import { AuthRequest } from '../types/request.type';
import { Tokens } from '../token/interface/token.interfaces';
import { UserNoPassword } from '../user/types/user.types';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  async registration(@Body() dto: CreateUserDto): Promise<UserNoPassword> {
    return await this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginUserDto, @Res() res: Response): Promise<void> {
    const { accessToken, refreshToken }: Tokens =
      await this.authService.login(dto);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.send('Loggined succesfully');
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
    await this.authService.logout(req.cookies['refreshToken']);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.send({ message: 'Logouted succesfully' });
  }

  @Post('logout-all')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async logoutAll(@Req() req: AuthRequest, @Res() res: Response) {
    await this.authService.logoutAll(req.user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.send({ message: 'Logouted in all devices' });
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken: string = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found');
    }

    const newTokens: Tokens = await this.authService.refreshToken(refreshToken);

    res.cookie('accessToken', newTokens.accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.send({ message: 'Token refreshed' });
  }
}
