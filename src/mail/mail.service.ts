import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      secure: false, // true pour le port 465, false pour les autres ports
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.password'),
      },
    });
  }

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('email.from'),
      to,
      subject: 'Votre code OTP CarthaGreen',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4CAF50;">CarthaGreen - Votre code OTP</h2>
          <p>Bonjour,</p>
          <p>Votre code OTP est : <strong style="font-size: 24px;">${otp}</strong></p>
          <p>Ce code expirera dans ${this.configService.get<number>('otp.expiration')} minutes.</p>
          <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
          <p>Cordialement,<br>L'équipe CarthaGreen</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    // Dans un environnement réel, vous devriez récupérer l'URL frontend depuis la configuration
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('email.from'),
      to,
      subject: 'Réinitialisation de mot de passe CarthaGreen',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4CAF50;">CarthaGreen - Réinitialisation de mot de passe</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe. Veuillez cliquer sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Réinitialiser le mot de passe</a>
          </div>
          <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet email.</p>
          <p>Ce lien expirera dans 1 heure.</p>
          <p>Cordialement,<br>L'équipe CarthaGreen</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(to: string, fullName: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('email.from'),
      to,
      subject: 'Bienvenue sur CarthaGreen',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4CAF50;">Bienvenue sur CarthaGreen !</h2>
          <p>Bonjour ${fullName},</p>
          <p>Nous sommes ravis de vous accueillir sur CarthaGreen, votre plateforme de gestion de culture hydroponique intelligente.</p>
          <p>Avec CarthaGreen, vous pouvez :</p>
          <ul>
            <li>Surveiller en temps réel les conditions de vos cultures</li>
            <li>Recevoir des alertes en cas d'anomalies</li>
            <li>Optimiser votre consommation d'eau et de nutriments</li>
            <li>Améliorer vos rendements agricoles</li>
          </ul>
          <p>N'hésitez pas à explorer l'application et à nous contacter si vous avez des questions.</p>
          <p>Cordialement,<br>L'équipe CarthaGreen</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    // URL pointant vers le backend pour la vérification
    const verifyUrl = `http://localhost:3000/users/verify-email/${token}`;

    const mailOptions = {
      from: this.configService.get<string>('email.from'),
      to,
      subject: 'Vérification de votre compte CarthaGreen',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CarthaGreen - Vérification de compte</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 20px auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
            <tr>
              <td style="padding: 0;">
                <!-- Header avec dégradé -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 30px 30px 20px 30px; background: linear-gradient(135deg, #00e676 0%, #00bcd4 50%, #2a3990 100%); border-radius: 8px 8px 0 0; text-align: center;">
                      <img src="https://i.imgur.com/tzLxYIX.png" alt="CarthaGreen Logo" style="display: block; margin: 0 auto; width: 250px; height: auto;">
                      <h1 style="color: #ffffff; font-size: 24px; margin: 15px 0 0 0;">Vérification de votre compte</h1>
                    </td>
                  </tr>
                </table>
                
                <!-- Contenu -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 30px 30px 20px 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">Bonjour,</p>
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">Merci d'avoir créé un compte sur CarthaGreen. Veuillez confirmer que vous souhaitez utiliser cette adresse email pour votre compte CarthaGreen. Une fois terminé, vous pourrez commencer à utiliser l'application!</p>
                      <p style="margin: 30px 0; text-align: center;">
                        <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #00e676 0%, #00bcd4 100%); color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 12px 30px; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,188,212,0.3);">Vérifier mon email</a>
                      </p>
                      <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.6; color: #666666;">Ou collez ce lien dans votre navigateur:</p>
                      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #00bcd4; word-break: break-all;">${verifyUrl}</p>
                      <p style="margin: 30px 0 10px 0; font-size: 14px; line-height: 1.6; color: #666666;">Si vous n'avez pas créé de compte sur CarthaGreen, veuillez ignorer cet email.</p>
                      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #666666;">Ce lien expirera dans 24 heures.</p>
                    </td>
                  </tr>
                </table>
                
                <!-- Footer -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 20px 30px; background-color: #f5f5f5; border-radius: 0 0 8px 8px; text-align: center; color: #666666; font-size: 14px;">
                      <p style="margin: 0 0 10px 0;">Cordialement,<br>L'équipe CarthaGreen</p>
                      <p style="margin: 0; font-size: 12px; color: #999999;">GROW THE GREEN SOUL</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}