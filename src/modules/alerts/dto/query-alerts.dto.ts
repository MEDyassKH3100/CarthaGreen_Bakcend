import { IsDate, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AlertSeverity, AlertStatus } from '../schemas/alert.schema';
import { SensorType } from '../../sensors/schemas/sensor.schema';

export class QueryAlertsDto {
  @IsOptional()
  @IsMongoId()
  sensorId?: string;

  @IsOptional()
  @IsEnum(SensorType)
  sensorType?: SensorType;

  @IsOptional()
  @IsMongoId()
  deviceId?: string;

  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

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
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  skip?: number = 0;

  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}