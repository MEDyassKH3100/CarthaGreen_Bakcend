import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type DeviceDocument = Device & Document;

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
}

export enum DeviceType {
  ESP32 = 'esp32',
  RASPBERRY_PI = 'raspberry_pi',
  ARDUINO = 'arduino',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Device {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  deviceId: string;

  @Prop({ required: true, enum: DeviceType, default: DeviceType.ESP32 })
  type: DeviceType;

  @Prop({ required: true, enum: DeviceStatus, default: DeviceStatus.OFFLINE })
  status: DeviceStatus;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  location: string | null;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  description: string | null;

  @Prop({ type: mongoose.Schema.Types.Date, default: null })
  lastConnection: Date | null;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  firmwareVersion: string | null;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  configuration: Record<string, any>;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' }], default: [] })
  sensors: mongoose.Types.ObjectId[];
}

export const DeviceSchema = SchemaFactory.createForClass(Device);