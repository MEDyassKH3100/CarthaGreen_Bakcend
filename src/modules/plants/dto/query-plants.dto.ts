import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PlantCategory } from '../schemas/plant.schema';

export class QueryPlantsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PlantCategory, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(',')))
  categories?: PlantCategory[];

  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(',')))
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  phMin?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  phMax?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  ecMin?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  ecMax?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  temperatureMin?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  temperatureMax?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  growthCycleDaysMax?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'name';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}