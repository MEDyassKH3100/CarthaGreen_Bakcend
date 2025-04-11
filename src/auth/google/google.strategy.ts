import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly usersService: UsersService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const email = emails[0].value;
    const profilePicture = photos[0].value;
    const fullName = `${name.givenName} ${name.familyName}`;
    const googleId = profile.id;

    // Rechercher l'utilisateur par email
    let user = await this.usersService.findByEmail(email).catch(() => null);

    // Si l'utilisateur n'existe pas, le créer
    if (!user) {
      user = await this.usersService.createGoogleUser({
        email,
        fullName,
        profilePicture,
        googleId,
      });
    } else {
      // Mettre à jour les informations Google si l'utilisateur existe déjà
      user = await this.usersService.updateGoogleInfo(user, {
        googleId,
        profilePicture,
        isGoogleAccount: true,
      });
    }

    done(null, user || false);
  }
}