import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { GrowthStage } from './plant.schema';

export type PlantationDocument = Plantation & Document;

export enum PlantationStatus {
  ACTIVE = 'active',
  HARVESTED = 'harvested',
  FAILED = 'failed',
  REMOVED = 'removed',
}

@Schema({ timestamps: true })
export class Plantation {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Plant' })
  plantId: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Device' })
  deviceId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  plantedDate: Date;

  @Prop({ type: mongoose.Schema.Types.Date, default: null })
  harvestedDate: Date | null;

  @Prop({ required: true, enum: GrowthStage, default: GrowthStage.SEEDLING })
  currentStage: GrowthStage;

  @Prop({ required: true, enum: PlantationStatus, default: PlantationStatus.ACTIVE })
  status: PlantationStatus;

  @Prop({ type: Number, default: null })
  quantity: number | null;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  location: string | null;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  notes: string | null;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  growthData: {
    heightCm?: number;
    widthCm?: number;
    numberOfLeaves?: number;
    stemDiameterMm?: number;
    rootLengthCm?: number;
  };

  @Prop({ type: [{ type: mongoose.Schema.Types.Mixed }], default: [] })
  growthHistory: {
    date: Date;
    stage: GrowthStage;
    heightCm?: number;
    widthCm?: number;
    numberOfLeaves?: number;
    imageUrl?: string;
    notes?: string;
  }[];

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  harvestData: {
    weightGrams?: number;
    qualityRating?: number;
    notes?: string;
    imageUrl?: string;
  };

  @Prop({ type: [{ type: mongoose.Schema.Types.Mixed }], default: [] })
  issues: {
    date: Date;
    type: string;
    description: string;
    resolved: boolean;
    resolvedDate?: Date;
    resolutionNotes?: string;
    imageUrl?: string;
  }[];

  @Prop({ type: [{ type: mongoose.Schema.Types.Mixed }], default: [] })
  treatments: {
    date: Date;
    type: string;
    description: string;
    dosage?: string;
    notes?: string;
  }[];

  @Prop({ type: [{ type: mongoose.Schema.Types.Mixed }], default: [] })
  nutrientAdjustments: {
    date: Date;
    adjustments: Record<string, number>;
    reason?: string;
    notes?: string;
  }[];
}

export const PlantationSchema = SchemaFactory.createForClass(Plantation);