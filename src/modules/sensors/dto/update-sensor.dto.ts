import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SensorType } from '../schemas/sensor.schema';

export class UpdateSensorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(SensorType)
  type?: SensorType;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  minThreshold?: number;

  @IsOptional()
  @IsNumber()
  maxThreshold?: number;

  @IsOptional()
  @IsString()
  description?: string;
}