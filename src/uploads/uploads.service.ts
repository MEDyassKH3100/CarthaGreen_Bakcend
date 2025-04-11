import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../modules/users/users.service';

@Injectable()
export class UploadsService {
  constructor(private readonly usersService: UsersService) {}

  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier n\'a été téléchargé');
    }

    // Construire l'URL de l'image
    const profilePictureUrl = `${process.env.APP_URL || 'http://localhost:3000'}/uploads/profile-pictures/${file.filename}`;

    // Mettre à jour l'utilisateur avec la nouvelle URL de la photo de profil
    await this.usersService.updateProfilePicture(userId, profilePictureUrl);

    return {
      success: true,
      message: 'Photo de profil mise à jour avec succès',
      profilePictureUrl,
    };
  }
}