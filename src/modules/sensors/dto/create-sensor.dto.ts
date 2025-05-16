import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { SensorType } from '../schemas/sensor.schema';

export class CreateSensorDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(SensorType)
  type: SensorType;

  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsNotEmpty()
  @IsString()
  unit: string;

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