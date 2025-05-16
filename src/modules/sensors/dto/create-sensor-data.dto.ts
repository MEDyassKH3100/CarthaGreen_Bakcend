import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { SensorType } from '../schemas/sensor.schema';
import { Type } from 'class-transformer';

export class CreateSensorDataDto {
  @IsNotEmpty()
  @IsMongoId()
  sensorId: string;

  @IsNotEmpty()
  @IsEnum(SensorType)
  sensorType: SensorType;

  @IsNotEmpty()
  @IsNumber()
  value: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  timestamp?: Date;

  @IsOptional()
  @IsString()
  deviceId?: string;
}