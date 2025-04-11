import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: './public/uploads/profile-pictures',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Seuls les fichiers image sont autorisés!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
    }),
  )
  async create(@Body() createUserDto: CreateUserDto, @UploadedFile() file?: Express.Multer.File) {
    let profilePictureUrl: string | undefined = undefined;
    
    if (file) {
      profilePictureUrl = `${process.env.APP_URL || 'http://localhost:3000'}/uploads/profile-pictures/${file.filename}`;
    }
    
    const user = await this.usersService.create(createUserDto, profilePictureUrl);
    
    return {
      success: true,
      message: 'Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.',
      user: {
        id: user['_id'],
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.userId, changePasswordDto);
  }

  @Post('send-otp')
  async sendOtp(@Body('email') email: string) {
    const otp = await this.usersService.generateOtp(email);
    return {
      success: true,
      message: 'Un code OTP a été envoyé à votre adresse email',
      otp // Uniquement pour les tests, à supprimer en production
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    const otp = await this.usersService.generateOtp(email);
    const token = await this.usersService.generatePasswordResetToken(email);
    return {
      success: true,
      message: 'Un code OTP a été envoyé à votre adresse email',
      otp // Uniquement pour les tests, à supprimer en production
    };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const result = await this.usersService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
    return {
      success: true,
      message: 'OTP vérifié avec succès',
      token: result.token
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.usersService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    return {
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    };
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string, @Res() res) {
    try {
      await this.usersService.verifyEmail(token);
      
      // Retourner une page HTML de succès
      return res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CarthaGreen - Compte vérifié</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .container {
              max-width: 500px;
              width: 100%;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              margin: 20px;
            }
            .header {
              background: linear-gradient(135deg, #00e676 0%, #00bcd4 50%, #2a3990 100%);
              padding: 20px;
              text-align: center;
            }
            .logo {
              width: 250px;
              height: auto;
              margin-bottom: 10px;
            }
            .content {
              padding: 30px;
              text-align: center;
            }
            .success-icon {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 80px;
              height: 80px;
              background-color: #00e676;
              border-radius: 50%;
              margin-bottom: 20px;
              box-shadow: 0 4px 10px rgba(0, 230, 118, 0.3);
            }
            .success-icon svg {
              width: 40px;
              height: 40px;
              fill: white;
            }
            h1 {
              color: #00bcd4;
              margin-bottom: 20px;
              font-size: 28px;
            }
            p {
              color: #666;
              margin-bottom: 25px;
              font-size: 16px;
            }
            .footer {
              text-align: center;
              padding: 15px;
              background-color: #f5f5f5;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://i.imgur.com/tzLxYIX.png" alt="CarthaGreen Logo" class="logo">
            </div>
            <div class="content">
              <div class="success-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
                </svg>
              </div>
              <h1>Compte vérifié avec succès</h1>
              <p>Votre compte CarthaGreen a été vérifié avec succès. Vous pouvez maintenant vous connecter à l'application.</p>
            </div>
            <div class="footer">
              CarthaGreen - GROW THE GREEN SOUL
            </div>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      // Retourner une page HTML d'erreur
      return res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CarthaGreen - Erreur de vérification</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .container {
              max-width: 500px;
              width: 100%;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              margin: 20px;
            }
            .header {
              background: linear-gradient(135deg, #00e676 0%, #00bcd4 50%, #2a3990 100%);
              padding: 20px;
              text-align: center;
            }
            .logo {
              width: 250px;
              height: auto;
              margin-bottom: 10px;
            }
            .content {
              padding: 30px;
              text-align: center;
            }
            .error-icon {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 80px;
              height: 80px;
              background-color: #f44336;
              border-radius: 50%;
              margin-bottom: 20px;
              box-shadow: 0 4px 10px rgba(244, 67, 54, 0.3);
            }
            .error-icon svg {
              width: 40px;
              height: 40px;
              fill: white;
            }
            h1 {
              color: #f44336;
              margin-bottom: 20px;
              font-size: 28px;
            }
            p {
              color: #666;
              margin-bottom: 25px;
              font-size: 16px;
            }
            .footer {
              text-align: center;
              padding: 15px;
              background-color: #f5f5f5;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://i.imgur.com/tzLxYIX.png" alt="CarthaGreen Logo" class="logo">
            </div>
            <div class="content">
              <div class="error-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path>
                </svg>
              </div>
              <h1>Erreur de vérification</h1>
              <p>Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau lien de vérification.</p>
            </div>
            <div class="footer">
              CarthaGreen - GROW THE GREEN SOUL
            </div>
          </div>
        </body>
        </html>
      `);
    }
  }
}