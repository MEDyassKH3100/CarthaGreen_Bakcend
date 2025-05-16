import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plant, PlantDocument } from './schemas/plant.schema';
import { Plantation, PlantationDocument, PlantationStatus } from './schemas/plantation.schema';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { CreatePlantationDto } from './dto/create-plantation.dto';
import { UpdatePlantationDto } from './dto/update-plantation.dto';
import { QueryPlantsDto } from './dto/query-plants.dto';
import { QueryPlantationsDto } from './dto/query-plantations.dto';
import * as mongoose from 'mongoose';

@Injectable()
export class PlantsService {
  constructor(
    @InjectModel(Plant.name) private plantModel: Model<PlantDocument>,
    @InjectModel(Plantation.name) private plantationModel: Model<PlantationDocument>,
  ) {}

  // Plant methods
  async createPlant(createPlantDto: CreatePlantDto): Promise<Plant> {
    const newPlant = new this.plantModel(createPlantDto);
    return newPlant.save();
  }

  async findAllPlants(queryPlantsDto: QueryPlantsDto): Promise<{ plants: Plant[]; total: number; page: number; limit: number }> {
    const { 
      search, 
      categories, 
      tags, 
      phMin, 
      phMax, 
      ecMin, 
      ecMax, 
      temperatureMin, 
      temperatureMax, 
      growthCycleDaysMax,
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'asc' 
    } = queryPlantsDto;

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { scientificName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (phMin !== undefined || phMax !== undefined) {
      query['optimalConditions.phMin'] = {};
      query['optimalConditions.phMax'] = {};

      if (phMin !== undefined) {
        query['optimalConditions.phMin'].$lte = phMax || 14;
        query['optimalConditions.phMax'].$gte = phMin;
      }

      if (phMax !== undefined) {
        query['optimalConditions.phMax'].$gte = phMin || 0;
        query['optimalConditions.phMin'].$lte = phMax;
      }
    }

    if (ecMin !== undefined || ecMax !== undefined) {
      query['optimalConditions.ecMin'] = {};
      query['optimalConditions.ecMax'] = {};

      if (ecMin !== undefined) {
        query['optimalConditions.ecMin'].$lte = ecMax || 5;
        query['optimalConditions.ecMax'].$gte = ecMin;
      }

      if (ecMax !== undefined) {
        query['optimalConditions.ecMax'].$gte = ecMin || 0;
        query['optimalConditions.ecMin'].$lte = ecMax;
      }
    }

    if (temperatureMin !== undefined || temperatureMax !== undefined) {
      query['optimalConditions.temperatureMin'] = {};
      query['optimalConditions.temperatureMax'] = {};

      if (temperatureMin !== undefined) {
        query['optimalConditions.temperatureMin'].$lte = temperatureMax || 40;
        query['optimalConditions.temperatureMax'].$gte = temperatureMin;
      }

      if (temperatureMax !== undefined) {
        query['optimalConditions.temperatureMax'].$gte = temperatureMin || 0;
        query['optimalConditions.temperatureMin'].$lte = temperatureMax;
      }
    }

    if (growthCycleDaysMax !== undefined) {
      query.growthCycleDays = { $lte: growthCycleDaysMax };
    }

    const total = await this.plantModel.countDocuments(query);
    const plants = await this.plantModel
      .find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      plants,
      total,
      page,
      limit,
    };
  }

  async findPlantById(id: string): Promise<Plant> {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new NotFoundException(`Plant with ID ${id} not found`);
    }

    const plant = await this.plantModel.findById(id).exec();
    if (!plant) {
      throw new NotFoundException(`Plant with ID ${id} not found`);
    }
    return plant;
  }

  async updatePlant(id: string, updatePlantDto: UpdatePlantDto): Promise<Plant> {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new NotFoundException(`Plant with ID ${id} not found`);
    }

    const updatedPlant = await this.plantModel
      .findByIdAndUpdate(id, updatePlantDto, { new: true })
      .exec();
    
    if (!updatedPlant) {
      throw new NotFoundException(`Plant with ID ${id} not found`);
    }
    
    return updatedPlant;
  }

  async deletePlant(id: string): Promise<void> {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new NotFoundException(`Plant with ID ${id} not found`);
    }

    const result = await this.plantModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Plant with ID ${id} not found`);
    }
  }

  // Plantation methods
  async createPlantation(createPlantationDto: CreatePlantationDto): Promise<Plantation> {
    // Verify that the plant exists
    const plantExists = await this.plantModel.exists({ _id: createPlantationDto.plantId });
    if (!plantExists) {
      throw new NotFoundException(`Plant with ID ${createPlantationDto.plantId} not found`);
    }

    const newPlantation = new this.plantationModel(createPlantationDto);
    return newPlantation.save();
  }

  async findAllPlantations(queryPlantationsDto: QueryPlantationsDto): Promise<{ plantations: Plantation[]; total: number; page: number; limit: number }> {
    const {
      plantId,
      deviceId,
      stages,
      statuses,
      plantedAfter,
      plantedBefore,
      harvestedAfter,
      harvestedBefore,
      location,
      page = 1,
      limit = 10,
      sortBy = 'plantedDate',
      sortOrder = 'desc',
    } = queryPlantationsDto;

    const query: any = {};

    if (plantId) {
      query.plantId = new mongoose.Types.ObjectId(plantId);
    }

    if (deviceId) {
      query.deviceId = new mongoose.Types.ObjectId(deviceId);
    }

    if (stages && stages.length > 0) {
      query.currentStage = { $in: stages };
    }

    if (statuses && statuses.length > 0) {
      query.status = { $in: statuses };
    }

    if (plantedAfter || plantedBefore) {
      query.plantedDate = {};
      if (plantedAfter) {
        query.plantedDate.$gte = plantedAfter;
      }
      if (plantedBefore) {
        query.plantedDate.$lte = plantedBefore;
      }
    }

    if (harvestedAfter || harvestedBefore) {
      query.harvestedDate = {};
      if (harvestedAfter) {
        query.harvestedDate.$gte = harvestedAfter;
      }
      if (harvestedBefore) {
        query.harvestedDate.$lte = harvestedBefore;
      }
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const total = await this.plantationModel.countDocuments(query);
    const plantations = await this.plantationModel
      .find(query)
      .populate('plantId', 'name scientificName category imageUrl')
      .populate('deviceId', 'name location')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      plantations,
      total,
      page,
      limit,
    };
  }

  async findPlantationById(id: string): Promise<Plantation> {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new NotFoundException(`Plantation with ID ${id} not found`);
    }

    const plantation = await this.plantationModel
      .findById(id)
      .populate('plantId')
      .populate('deviceId', 'name location')
      .exec();
    
    if (!plantation) {
      throw new NotFoundException(`Plantation with ID ${id} not found`);
    }
    
    return plantation;
  }

  async updatePlantation(id: string, updatePlantationDto: UpdatePlantationDto): Promise<Plantation> {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new NotFoundException(`Plantation with ID ${id} not found`);
    }

    const plantation = await this.plantationModel.findById(id).exec();
    if (!plantation) {
      throw new NotFoundException(`Plantation with ID ${id} not found`);
    }

    // Handle special fields that need to be added to arrays
    const { 
      addGrowthHistoryEntry, 
      addIssue, 
      addTreatment, 
      addNutrientAdjustment,
      ...updateData 
    } = updatePlantationDto;

    // If status is changed to HARVESTED and harvestedDate is not provided, set it
    if (updateData.status === PlantationStatus.HARVESTED && !updateData.harvestedDate) {
      updateData.harvestedDate = new Date();
    }

    // Apply basic updates
    Object.assign(plantation, updateData);

    // Add to arrays if provided
    if (addGrowthHistoryEntry) {
      plantation.growthHistory.push(addGrowthHistoryEntry);
    }

    if (addIssue) {
      plantation.issues.push(addIssue);
    }

    if (addTreatment) {
      plantation.treatments.push(addTreatment);
    }

    if (addNutrientAdjustment) {
      plantation.nutrientAdjustments.push(addNutrientAdjustment);
    }

    return plantation.save();
  }

  async deletePlantation(id: string): Promise<void> {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new NotFoundException(`Plantation with ID ${id} not found`);
    }

    const result = await this.plantationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Plantation with ID ${id} not found`);
    }
  }

  // Statistics methods
  async getPlantationStatistics(deviceId?: string): Promise<any> {
    const query: any = {};
    if (deviceId) {
      query.deviceId = new mongoose.Types.ObjectId(deviceId);
    }

    const totalPlantations = await this.plantationModel.countDocuments(query);
    
    // Count by status
    const statusCounts = await this.plantationModel.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Count by plant type
    const plantTypeCounts = await this.plantationModel.aggregate([
      { $match: query },
      { $lookup: { from: 'plants', localField: 'plantId', foreignField: '_id', as: 'plant' } },
      { $unwind: '$plant' },
      { $group: { _id: '$plant.category', count: { $sum: 1 } } },
    ]);

    // Count by growth stage
    const stageCounts = await this.plantationModel.aggregate([
      { $match: query },
      { $group: { _id: '$currentStage', count: { $sum: 1 } } },
    ]);

    // Plantations planted per month
    const plantedPerMonth = await this.plantationModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$plantedDate' },
            month: { $month: '$plantedDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Harvested plantations per month
    const harvestedPerMonth = await this.plantationModel.aggregate([
      { $match: { ...query, harvestedDate: { $ne: null } } },
      {
        $group: {
          _id: {
            year: { $year: '$harvestedDate' },
            month: { $month: '$harvestedDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return {
      totalPlantations,
      byStatus: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byPlantType: plantTypeCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byGrowthStage: stageCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      plantedPerMonth: plantedPerMonth.map(item => ({
        year: item._id.year,
        month: item._id.month,
        count: item.count,
      })),
      harvestedPerMonth: harvestedPerMonth.map(item => ({
        year: item._id.year,
        month: item._id.month,
        count: item.count,
      })),
    };
  }

  async getPlantStatistics(): Promise<any> {
    // Count by category
    const categoryCounts = await this.plantModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // Most used plants in plantations
    const mostUsedPlants = await this.plantationModel.aggregate([
      { $group: { _id: '$plantId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'plants', localField: '_id', foreignField: '_id', as: 'plant' } },
      { $unwind: '$plant' },
      { $project: { _id: 0, plantId: '$_id', name: '$plant.name', category: '$plant.category', count: 1 } },
    ]);

    // Plants with highest success rate (not FAILED status)
    const plantSuccessRates = await this.plantationModel.aggregate([
      { $group: { 
        _id: '$plantId', 
        total: { $sum: 1 },
        successful: { 
          $sum: { 
            $cond: [{ $ne: ['$status', PlantationStatus.FAILED] }, 1, 0] 
          } 
        }
      }},
      { $match: { total: { $gt: 5 } } }, // Only include plants with more than 5 plantations
      { $project: { 
        _id: 0, 
        plantId: '$_id', 
        total: 1, 
        successful: 1, 
        successRate: { $multiply: [{ $divide: ['$successful', '$total'] }, 100] } 
      }},
      { $sort: { successRate: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'plants', localField: 'plantId', foreignField: '_id', as: 'plant' } },
      { $unwind: '$plant' },
      { $project: { 
        plantId: 1, 
        name: '$plant.name', 
        category: '$plant.category', 
        total: 1, 
        successful: 1, 
        successRate: 1 
      }},
    ]);

    return {
      totalPlants: await this.plantModel.countDocuments(),
      byCategory: categoryCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      mostUsedPlants,
      plantSuccessRates,
    };
  }
}