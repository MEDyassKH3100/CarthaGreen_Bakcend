import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { User, UserDocument } from './schemas/user.schema';
import { MailService } from 'src/mail/mail.service';


@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private mailService: MailService,
    ) { }

    async create(createUserDto: CreateUserDto, profilePictureUrl?: string): Promise<User> {
        const { email, password } = createUserDto;

        // Check if user already exists
        const existingUser = await this.userModel.findOne({ email }).exec();
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
            isEmailVerified: false,
            profilePicture: profilePictureUrl,
        });

        // Save the user
        const savedUser = await newUser.save();
        
        // Generate verification token
        const token = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24); // Token expires in 24 hours
        
        // Save token to user
        savedUser.passwordResetToken = token;
        savedUser.passwordResetExpires = tokenExpires;
        await savedUser.save();
        
        // Send verification email with link
        await this.mailService.sendVerificationEmail(savedUser.email, token);
        
        return savedUser;
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }
        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        // Check if email is being updated and if it already exists
        if (updateUserDto.email) {
            const existingUser = await this.userModel.findOne({
                email: updateUserDto.email,
                _id: { $ne: id }
            }).exec();

            if (existingUser) {
                throw new ConflictException('Email already exists');
            }
        }

        const updatedUser = await this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true })
            .exec();

        if (!updatedUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return updatedUser;
    }

    async remove(id: string): Promise<void> {
        const result = await this.userModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

    async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const { currentPassword, newPassword } = changePasswordDto;

        // Find user
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashedPassword;
        await user.save();
    }

    async generateOtp(email: string): Promise<string> {
        return this.generatePasswordResetToken(email);
    }

    async generatePasswordResetToken(email: string): Promise<string> {
        // Find user
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        // Generate OTP for password reset
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const otpExpires = new Date();
        otpExpires.setMinutes(otpExpires.getMinutes() + 10); // OTP expires in 10 minutes
        
        // Save OTP to user
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
        
        // Send OTP email
        await this.mailService.sendOtpEmail(user.email, otp);
        
        return otp;
    }

    async sendVerificationEmail(email: string): Promise<string> {
        // Find user
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        // Generate verification token
        const token = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24); // Token expires in 24 hours
        
        // Save token to user
        user.passwordResetToken = token; // Réutilisation du champ existant
        user.passwordResetExpires = tokenExpires;
        await user.save();
        
        // Send verification email with link
        await this.mailService.sendVerificationEmail(user.email, token);
        
        return token;
    }

    async verifyEmail(token: string): Promise<boolean> {
        // Find user with valid token
        const user = await this.userModel.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() }
        }).exec();

        if (!user) {
            throw new BadRequestException('Lien de vérification invalide ou expiré');
        }

        // Mark email as verified and clear token
        user.isEmailVerified = true;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        return true;
    }

    async verifyOtp(email: string, otp: string): Promise<{ token: string }> {
        // Find user
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        // Verify OTP
        if (user.otp !== otp) {
            throw new BadRequestException('Invalid OTP');
        }

        // Check if OTP is expired
        if (!user.otpExpires || user.otpExpires < new Date()) {
            throw new BadRequestException('OTP has expired');
        }

        // Generate password reset token
        const token = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 1); // Token expires in 1 hour

        // Save token to user and clear OTP
        user.passwordResetToken = token;
        user.passwordResetExpires = tokenExpires;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        return { token };
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        // Find user with valid token
        const user = await this.userModel.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() }
        }).exec();

        if (!user) {
            throw new BadRequestException('Invalid or expired password reset token');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear token
        user.password = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();
    }

    // Méthode pour mettre à jour la photo de profil d'un utilisateur
    async updateProfilePicture(userId: string, profilePictureUrl: string): Promise<User> {
        const user = await this.userModel.findById(userId).exec();
        
        if (!user) {
            throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
        }
        
        user.profilePicture = profilePictureUrl;
        return (user as unknown as UserDocument).save();
    }

    // ** GOOGLE AUTH ** //
    async createGoogleUser(userData: {
        email: string;
        fullName: string;
        profilePicture: string;
        googleId: string;
    }): Promise<User> {
        const newUser = new this.userModel({
            email: userData.email,
            fullName: userData.fullName,
            profilePicture: userData.profilePicture,
            googleId: userData.googleId,
            isGoogleAccount: true,
            isEmailVerified: true, // Les comptes Google ont déjà l'email vérifié
        });
    
        return newUser.save();
    }
    
    async updateGoogleInfo(
        user: User,
        googleData: {
            googleId: string;
            profilePicture: string;
            isGoogleAccount: boolean;
        },
    ): Promise<User> {
        user.googleId = googleData.googleId;
        user.profilePicture = googleData.profilePicture;
        user.isGoogleAccount = googleData.isGoogleAccount;
        user.isEmailVerified = true; // Assurez-vous que l'email est vérifié
        
        // Cast user to UserDocument to access save method
        return (user as unknown as UserDocument).save();
    }
}