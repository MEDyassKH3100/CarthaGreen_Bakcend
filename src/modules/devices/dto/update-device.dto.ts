import { IsArray, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { DeviceStatus, DeviceType } from '../schemas/device.schema';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(DeviceType)
  type?: DeviceType;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @IsOptional()
  configuration?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  sensors?: string[];
}