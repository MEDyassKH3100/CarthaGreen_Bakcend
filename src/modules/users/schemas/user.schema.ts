import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password: string;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  profilePicture: string | null;

  // Champs pour la vérification d'email et la réinitialisation de mot de passe
  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  otp: string | null;

  @Prop({ type: mongoose.Schema.Types.Date, default: null })
  otpExpires: Date | null;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  passwordResetToken: string | null;

  @Prop({ type: mongoose.Schema.Types.Date, default: null })
  passwordResetExpires: Date | null;

  @Prop({ default: 'user' })
  role: string;
  
  // Champs pour l'authentification Google
  @Prop({ default: false })
  isGoogleAccount: boolean;
  
  @Prop({ type: mongoose.Schema.Types.String, default: null })
  googleId: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);