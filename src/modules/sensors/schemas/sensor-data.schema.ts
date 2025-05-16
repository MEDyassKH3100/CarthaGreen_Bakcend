import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { SensorType } from './sensor.schema';

export type SensorDataDocument = SensorData & Document;

@Schema({ timestamps: true })
export class SensorData {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' })
  sensorId: mongoose.Types.ObjectId;

  @Prop({ required: true, enum: SensorType })
  sensorType: SensorType;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  deviceId: string;

  @Prop({ type: mongoose.Schema.Types.Boolean, default: false })
  isAlertTriggered: boolean;
}

export const SensorDataSchema = SchemaFactory.createForClass(SensorData);

// Créer un index composé sur sensorId et timestamp pour des requêtes efficaces
SensorDataSchema.index({ sensorId: 1, timestamp: -1 });

// Créer un index TTL pour supprimer automatiquement les anciennes données après une période définie (ex: 30 jours)
// Cela aide à gérer la taille de la base de données pour les données de capteurs qui peuvent s'accumuler rapidement
SensorDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });