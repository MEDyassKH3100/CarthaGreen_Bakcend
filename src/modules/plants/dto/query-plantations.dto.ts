import { IsDate, IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { GrowthStage } from '../schemas/plant.schema';
import { PlantationStatus } from '../schemas/plantation.schema';

export class QueryPlantationsDto {
    @IsOptional()
    @IsMongoId()
    plantId?: string;

    @IsOptional()
    @IsMongoId()
    deviceId?: string;

    @IsOptional()
    @IsEnum(GrowthStage, { each: true })
    @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(',')))
    stages?: GrowthStage[];

    @IsOptional()
    @IsEnum(PlantationStatus, { each: true })
    @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(',')))
    statuses?: PlantationStatus[];

    @IsOptional()
    @IsDate()
    @Transform(({ value }) => value ? new Date(value) : undefined)
    plantedAfter?: Date;

    @IsOptional()
    @IsDate()
    @Transform(({ value }) => value ? new Date(value) : undefined)
    plantedBefore?: Date;

    @IsOptional()
    @IsDate()
    @Transform(({ value }) => value ? new Date(value) : undefined)
    harvestedAfter?: Date;

    @IsOptional()
    @IsDate()
    @Transform(({ value }) => value ? new Date(value) : undefined)
    harvestedBefore?: Date;

    @IsOptional()
    @IsString()
    location?: string;

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
    sortBy?: string = 'plantedDate';
    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc' = 'desc';
}