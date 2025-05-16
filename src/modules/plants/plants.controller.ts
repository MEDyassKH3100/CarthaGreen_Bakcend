import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { CreatePlantationDto } from './dto/create-plantation.dto';
import { UpdatePlantationDto } from './dto/update-plantation.dto';
import { QueryPlantsDto } from './dto/query-plants.dto';
import { QueryPlantationsDto } from './dto/query-plantations.dto';

@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) { }

  // Plant endpoints
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('plantImage', {
      storage: diskStorage({
        destination: './public/uploads/plant-images',
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
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async createPlant(
    @Body() body: any, // Accepter le body JSON brut
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const createPlantDto: CreatePlantDto = body; // Valider manuellement si nécessaire
    let imageUrl: string | undefined = undefined;

    if (file) {
      imageUrl = `${process.env.APP_URL || 'http://localhost:3000'}/uploads/plant-images/${file.filename}`;
    }

    const plant = await this.plantsService.createPlant({
      ...createPlantDto,
      imageUrl,
    });

    return {
      success: true,
      message: 'Plante créée avec succès',
      plant,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllPlants(@Query() queryPlantsDto: QueryPlantsDto) {
    const result = await this.plantsService.findAllPlants(queryPlantsDto);
    return {
      success: true,
      message: 'Plantes récupérées avec succès',
      ...result
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findPlantById(@Param('id') id: string) {
    const plant = await this.plantsService.findPlantById(id);
    return {
      success: true,
      message: 'Plante récupérée avec succès',
      plant
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('plantImage', {
      storage: diskStorage({
        destination: './public/uploads/plant-images',
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
  async updatePlant(
    @Param('id') id: string,
    @Body() updatePlantDto: UpdatePlantDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    let imageUrl: string | undefined = undefined;

    if (file) {
      imageUrl = `${process.env.APP_URL || 'http://localhost:3000'}/uploads/plant-images/${file.filename}`;
      updatePlantDto.imageUrl = imageUrl;
    }

    const plant = await this.plantsService.updatePlant(id, updatePlantDto);
    return {
      success: true,
      message: 'Plante mise à jour avec succès',
      plant
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePlant(@Param('id') id: string) {
    await this.plantsService.deletePlant(id);
    return {
      success: true,
      message: 'Plante supprimée avec succès'
    };
  }

  // Plantation endpoints
  @Post('plantations')
  @UseGuards(JwtAuthGuard)
  async createPlantation(@Body() createPlantationDto: CreatePlantationDto) {
    const plantation = await this.plantsService.createPlantation(createPlantationDto);
    return {
      success: true,
      message: 'Plantation créée avec succès',
      plantation
    };
  }

  @Get('plantations')
  @UseGuards(JwtAuthGuard)
  async findAllPlantations(@Query() queryPlantationsDto: QueryPlantationsDto) {
    const result = await this.plantsService.findAllPlantations(queryPlantationsDto);
    return {
      success: true,
      message: 'Plantations récupérées avec succès',
      ...result
    };
  }

  @Get('plantations/:id')
  @UseGuards(JwtAuthGuard)
  async findPlantationById(@Param('id') id: string) {
    const plantation = await this.plantsService.findPlantationById(id);
    return {
      success: true,
      message: 'Plantation récupérée avec succès',
      plantation
    };
  }

  @Patch('plantations/:id')
  @UseGuards(JwtAuthGuard)
  async updatePlantation(@Param('id') id: string, @Body() updatePlantationDto: UpdatePlantationDto) {
    const plantation = await this.plantsService.updatePlantation(id, updatePlantationDto);
    return {
      success: true,
      message: 'Plantation mise à jour avec succès',
      plantation
    };
  }

  @Delete('plantations/:id')
  @UseGuards(JwtAuthGuard)
  async deletePlantation(@Param('id') id: string) {
    await this.plantsService.deletePlantation(id);
    return {
      success: true,
      message: 'Plantation supprimée avec succès'
    };
  }

  // Statistics endpoints
  @Get('statistics/plantations')
  @UseGuards(JwtAuthGuard)
  async getPlantationStatistics(@Query('deviceId') deviceId?: string) {
    const statistics = await this.plantsService.getPlantationStatistics(deviceId);
    return {
      success: true,
      message: 'Statistiques des plantations récupérées avec succès',
      statistics
    };
  }

  @Get('statistics/plants')
  @UseGuards(JwtAuthGuard)
  async getPlantStatistics() {
    const statistics = await this.plantsService.getPlantStatistics();
    return {
      success: true,
      message: 'Statistiques des plantes récupérées avec succès',
      statistics
    };
  }
}