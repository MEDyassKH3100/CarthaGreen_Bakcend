import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type PlantDocument = Plant & Document;

export enum PlantCategory {
  LEAFY_GREENS = 'leafy_greens',
  HERBS = 'herbs',
  FRUITING = 'fruiting',
  ROOT_VEGETABLES = 'root_vegetables',
  FLOWERS = 'flowers',
  OTHER = 'other',
}

export enum GrowthStage {
  SEEDLING = 'seedling',
  VEGETATIVE = 'vegetative',
  FLOWERING = 'flowering',
  FRUITING = 'fruiting',
  HARVESTING = 'harvesting',
}

@Schema({ timestamps: true })
export class Plant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  scientificName: string;

  @Prop({ required: true, enum: PlantCategory, default: PlantCategory.OTHER })
  category: PlantCategory;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  description: string | null;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  imageUrl: string | null;

  @Prop({ type: [String], default: [] })
  tags: string[];

  // Conditions de croissance optimales
  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  optimalConditions: {
    phMin?: number;
    phMax?: number;
    ecMin?: number;
    ecMax?: number;
    temperatureMin?: number;
    temperatureMax?: number;
    humidityMin?: number;
    humidityMax?: number;
    lightHoursPerDay?: number;
    lightIntensity?: number;
  };

  // Durée du cycle de croissance (en jours)
  @Prop({ type: Number, default: null })
  growthCycleDays: number | null;

  // Espacement recommandé entre les plantes (en cm)
  @Prop({ type: Number, default: null })
  spacingCm: number | null;

  // Nutriments requis
  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  nutrientRequirements: {
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    calcium?: number;
    magnesium?: number;
    sulfur?: number;
    iron?: number;
    manganese?: number;
    zinc?: number;
    boron?: number;
    copper?: number;
    molybdenum?: number;
  };

  // Informations sur la récolte
  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  harvestInfo: {
    expectedYieldPerPlant?: number;
    harvestInstructions?: string;
  };

  // Problèmes courants
  @Prop({ type: [String], default: [] })
  commonProblems: string[];

  // Conseils de culture
  @Prop({ type: [String], default: [] })
  growingTips: string[];
}

export const PlantSchema = SchemaFactory.createForClass(Plant);