import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { SensorType } from '../../sensors/schemas/sensor.schema';

export type AlertDocument = Alert & Document;

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

@Schema({ timestamps: true })
export class Alert {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' })
  sensorId: mongoose.Types.ObjectId;

  @Prop({ required: true, enum: SensorType })
  sensorType: SensorType;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Device' })
  deviceId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  threshold: number;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: AlertSeverity, default: AlertSeverity.MEDIUM })
  severity: AlertSeverity;

  @Prop({ required: true, enum: AlertStatus, default: AlertStatus.NEW })
  status: AlertStatus;

  @Prop({ type: mongoose.Schema.Types.Date, default: null })
  acknowledgedAt: Date | null;

  @Prop({ type: mongoose.Schema.Types.Date, default: null })
  resolvedAt: Date | null;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  acknowledgedBy: mongoose.Types.ObjectId | null;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  notes: string | null;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);