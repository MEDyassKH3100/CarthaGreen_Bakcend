import { PartialType } from '@nestjs/mapped-types';
import { CreatePlantationDto } from './create-plantation.dto';
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { GrowthStage } from '../schemas/plant.schema';
import { PlantationStatus } from '../schemas/plantation.schema';

class GrowthHistoryEntryDto {
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  date: Date;

  @IsNotEmpty()
  @IsEnum(GrowthStage)
  stage: GrowthStage;

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
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class HarvestDataDto {
  @IsOptional()
  @IsNumber()
  weightGrams?: number;

  @IsOptional()
  @IsNumber()
  qualityRating?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

class IssueDto {
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  date: Date;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  resolved: boolean;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  resolvedDate?: Date;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

class TreatmentDto {
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  date: Date;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class NutrientAdjustmentDto {
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  date: Date;

  @IsNotEmpty()
  adjustments: Record<string, number>;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePlantationDto extends PartialType(CreatePlantationDto) {
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  harvestedDate?: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => GrowthHistoryEntryDto)
  addGrowthHistoryEntry?: GrowthHistoryEntryDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HarvestDataDto)
  harvestData?: HarvestDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => IssueDto)
  addIssue?: IssueDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TreatmentDto)
  addTreatment?: TreatmentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NutrientAdjustmentDto)
  addNutrientAdjustment?: NutrientAdjustmentDto;
}