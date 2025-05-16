import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AlertSeverity, AlertStatus } from '../schemas/alert.schema';
import { SensorType } from '../../sensors/schemas/sensor.schema';

export class CreateAlertDto {
  @IsNotEmpty()
  @IsMongoId()
  sensorId: string;

  @IsNotEmpty()
  @IsEnum(SensorType)
  sensorType: SensorType;

  @IsNotEmpty()
  @IsMongoId()
  deviceId: string;

  @IsNotEmpty()
  @IsNumber()
  value: number;

  @IsNotEmpty()
  @IsNumber()
  threshold: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  timestamp?: Date = new Date();

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity = AlertSeverity.MEDIUM;

  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus = AlertStatus.NEW;

  @IsOptional()
  @IsString()
  notes?: string;
}