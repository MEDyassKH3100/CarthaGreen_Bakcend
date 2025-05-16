import { IsDate, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SensorType } from '../schemas/sensor.schema';

export class QuerySensorDataDto {
  @IsOptional()
  @IsMongoId()
  sensorId?: string;

  @IsOptional()
  @IsEnum(SensorType)
  sensorType?: SensorType;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 100;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  skip?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minValue?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxValue?: number;

  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}