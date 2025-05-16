import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GrowthStage } from '../schemas/plant.schema';
import { PlantationStatus } from '../schemas/plantation.schema';
import { Transform } from 'class-transformer';

class GrowthDataDto {
  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  widthCm?: number;

  @IsOptional()
  @IsNumber()
  numberOfLeaves?: number;

  @IsOptional()
  @IsNumber()
  stemDiameterMm?: number;

  @IsOptional()
  @IsNumber()
  rootLengthCm?: number;
}

export class CreatePlantationDto {
  @IsNotEmpty()
  @IsMongoId()
  plantId: string;

  @IsNotEmpty()
  @IsMongoId()
  deviceId: string;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  plantedDate: Date;

  @IsOptional()
  @IsEnum(GrowthStage)
  currentStage?: GrowthStage;

  @IsOptional()
  @IsEnum(PlantationStatus)
  status?: PlantationStatus;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GrowthDataDto)
  growthData?: GrowthDataDto;
}