import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PlantCategory } from '../schemas/plant.schema';

class OptimalConditionsDto {
  @IsOptional()
  @IsNumber()
  phMin?: number;

  @IsOptional()
  @IsNumber()
  phMax?: number;

  @IsOptional()
  @IsNumber()
  ecMin?: number;

  @IsOptional()
  @IsNumber()
  ecMax?: number;

  @IsOptional()
  @IsNumber()
  temperatureMin?: number;

  @IsOptional()
  @IsNumber()
  temperatureMax?: number;

  @IsOptional()
  @IsNumber()
  humidityMin?: number;

  @IsOptional()
  @IsNumber()
  humidityMax?: number;

  @IsOptional()
  @IsNumber()
  lightHoursPerDay?: number;

  @IsOptional()
  @IsNumber()
  lightIntensity?: number;
}

class NutrientRequirementsDto {
  @IsOptional()
  @IsNumber()
  nitrogen?: number;

  @IsOptional()
  @IsNumber()
  phosphorus?: number;

  @IsOptional()
  @IsNumber()
  potassium?: number;

  @IsOptional()
  @IsNumber()
  calcium?: number;

  @IsOptional()
  @IsNumber()
  magnesium?: number;

  @IsOptional()
  @IsNumber()
  sulfur?: number;

  @IsOptional()
  @IsNumber()
  iron?: number;

  @IsOptional()
  @IsNumber()
  manganese?: number;

  @IsOptional()
  @IsNumber()
  zinc?: number;

  @IsOptional()
  @IsNumber()
  boron?: number;

  @IsOptional()
  @IsNumber()
  copper?: number;

  @IsOptional()
  @IsNumber()
  molybdenum?: number;
}

class HarvestInfoDto {
  @IsOptional()
  @IsNumber()
  expectedYieldPerPlant?: number;

  @IsOptional()
  @IsString()
  harvestInstructions?: string;
}

export class CreatePlantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  scientificName: string;

  @IsNotEmpty()
  @IsEnum(PlantCategory)
  category: PlantCategory;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => OptimalConditionsDto)
  optimalConditions?: OptimalConditionsDto;

  @IsOptional()
  @IsNumber()
  growthCycleDays?: number;

  @IsOptional()
  @IsNumber()
  spacingCm?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => NutrientRequirementsDto)
  nutrientRequirements?: NutrientRequirementsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HarvestInfoDto)
  harvestInfo?: HarvestInfoDto;

  @IsOptional()
  @IsString({ each: true })
  commonProblems?: string[];

  @IsOptional()
  @IsString({ each: true })
  growingTips?: string[];
}