import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../modules/users/dto/login-user.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Cette route redirige vers Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);
    
    // Rediriger vers le frontend avec le token
    // Vous pouvez ajuster l'URL de redirection selon votre configuration
    return res.redirect(`http://localhost:3000/auth-callback?token=${result.accessToken}`);
  }
}