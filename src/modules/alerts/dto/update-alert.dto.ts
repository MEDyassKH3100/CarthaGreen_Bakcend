import { IsDate, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AlertStatus } from '../schemas/alert.schema';

export class UpdateAlertDto {
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @IsOptional()
  @IsMongoId()
  acknowledgedBy?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  acknowledgedAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  resolvedAt?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}