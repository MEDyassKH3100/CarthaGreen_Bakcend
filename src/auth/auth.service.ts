import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../modules/users/users.service';
import { LoginUserDto } from '../modules/users/dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        const userObject = user as any;
        const { password, ...result } = userObject.toObject();
        return result;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Vérifier si l'email est vérifié
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Veuillez vérifier votre email avant de vous connecter. Un email de vérification a été envoyé à votre adresse.');
    }

    const payload = { email: user.email, sub: user._id };

    return {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }

  async googleLogin(user: any) {
    if (!user) {
      throw new UnauthorizedException('Authentification Google échouée');
    }

    const payload = { email: user.email, sub: user._id };

    return {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        role: user.role,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }
}