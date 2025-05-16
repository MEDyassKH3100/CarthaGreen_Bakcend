import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type SensorDocument = Sensor & Document;

export enum SensorType {
  PH = 'ph',
  EC = 'ec',
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  LIGHT = 'light',
  WATER_LEVEL = 'water_level',
}

@Schema({ timestamps: true })
export class Sensor {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: SensorType })
  type: SensorType;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  unit: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: mongoose.Schema.Types.Number, default: null })
  minThreshold: number | null;

  @Prop({ type: mongoose.Schema.Types.Number, default: null })
  maxThreshold: number | null;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  description: string | null;
}

export const SensorSchema = SchemaFactory.createForClass(Sensor);