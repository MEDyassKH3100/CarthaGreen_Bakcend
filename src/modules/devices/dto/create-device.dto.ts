import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DeviceStatus, DeviceType } from '../schemas/device.schema';

export class CreateDeviceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsOptional()
  @IsEnum(DeviceType)
  type?: DeviceType = DeviceType.ESP32;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus = DeviceStatus.OFFLINE;

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
}