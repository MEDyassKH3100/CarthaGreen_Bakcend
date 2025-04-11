import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Le token est requis' })
  @IsString({ message: 'Le token doit être une chaîne de caractères' })
  token: string;

  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
  @IsString({ message: 'Le nouveau mot de passe doit être une chaîne de caractères' })
  @MinLength(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' })
  newPassword: string;
}