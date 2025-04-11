import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'L\'email est requis' })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  email: string;

  @IsNotEmpty({ message: 'Le code OTP est requis' })
  @IsString({ message: 'Le code OTP doit être une chaîne de caractères' })
  @Length(6, 6, { message: 'Le code OTP doit contenir exactement 6 caractères' })
  otp: string;
}