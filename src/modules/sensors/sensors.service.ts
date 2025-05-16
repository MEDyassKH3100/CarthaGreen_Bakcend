import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sensor, SensorDocument } from './schemas/sensor.schema';
import { SensorData, SensorDataDocument } from './schemas/sensor-data.schema';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { CreateSensorDataDto } from './dto/create-sensor-data.dto';
import { QuerySensorDataDto } from './dto/query-sensor-data.dto';

@Injectable()
export class SensorsService {
  constructor(
    @InjectModel(Sensor.name) private sensorModel: Model<SensorDocument>,
    @InjectModel(SensorData.name) private sensorDataModel: Model<SensorDataDocument>,
  ) {}

  // Méthodes pour les capteurs
  async createSensor(createSensorDto: CreateSensorDto): Promise<Sensor> {
    const newSensor = new this.sensorModel(createSensorDto);
    return newSensor.save();
  }

  async findAllSensors(deviceId?: string): Promise<Sensor[]> {
    const query = deviceId ? { deviceId } : {};
    return this.sensorModel.find(query).exec();
  }

  async findSensorById(id: string): Promise<Sensor> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid sensor ID');
    }
    
    const sensor = await this.sensorModel.findById(id).exec();
    if (!sensor) {
      throw new NotFoundException(`Sensor with ID ${id} not found`);
    }
    return sensor;
  }

  async updateSensor(id: string, updateSensorDto: UpdateSensorDto): Promise<Sensor> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid sensor ID');
    }
    
    const updatedSensor = await this.sensorModel
      .findByIdAndUpdate(id, updateSensorDto, { new: true })
      .exec();
    
    if (!updatedSensor) {
      throw new NotFoundException(`Sensor with ID ${id} not found`);
    }
    
    return updatedSensor;
  }

  async deleteSensor(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid sensor ID');
    }
    
    const result = await this.sensorModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Sensor with ID ${id} not found`);
    }
    
    // Supprimer également toutes les données associées à ce capteur
    await this.sensorDataModel.deleteMany({ sensorId: new Types.ObjectId(id) }).exec();
  }

  // Méthodes pour les données des capteurs
  async createSensorData(createSensorDataDto: CreateSensorDataDto): Promise<SensorData> {
    // Vérifier si le capteur existe
    await this.findSensorById(createSensorDataDto.sensorId);
    
    // Définir la date actuelle si non fournie
    if (!createSensorDataDto.timestamp) {
      createSensorDataDto.timestamp = new Date();
    }
    
    const newSensorData = new this.sensorDataModel({
      ...createSensorDataDto,
      sensorId: new Types.ObjectId(createSensorDataDto.sensorId),
    });
    
    // Vérifier si la valeur dépasse les seuils et définir isAlertTriggered
    const sensor = await this.sensorModel.findById(createSensorDataDto.sensorId).exec();
    if (sensor) {
      const { minThreshold, maxThreshold } = sensor;
      const value = createSensorDataDto.value;
      
      if ((minThreshold !== null && value < minThreshold) || 
          (maxThreshold !== null && value > maxThreshold)) {
        newSensorData.isAlertTriggered = true;
      }
    }
    
    return newSensorData.save();
  }

  async findSensorData(queryDto: QuerySensorDataDto): Promise<SensorData[]> {
    const { 
      sensorId, sensorType, deviceId, startDate, endDate, 
      limit, skip, minValue, maxValue, sortBy, sortOrder 
    } = queryDto;
    
    const query: any = {};
    
    if (sensorId) {
      if (!Types.ObjectId.isValid(sensorId)) {
        throw new BadRequestException('Invalid sensor ID');
      }
      query.sensorId = new Types.ObjectId(sensorId);
    }
    
    if (sensorType) {
      query.sensorType = sensorType;
    }
    
    if (deviceId) {
      query.deviceId = deviceId;
    }
    
    // Filtrage par plage de dates
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = startDate;
      }
      if (endDate) {
        query.timestamp.$lte = endDate;
      }
    }
    
    // Filtrage par plage de valeurs
    if (minValue !== undefined || maxValue !== undefined) {
      query.value = {};
      if (minValue !== undefined) {
        query.value.$gte = minValue;
      }
      if (maxValue !== undefined) {
        query.value.$lte = maxValue;
      }
    }
    
    // Construire l'ordre de tri
    const sort = {};
    sort[sortBy || 'timestamp'] = sortOrder === 'asc' ? 1 : -1;
    
    return this.sensorDataModel
      .find(query)
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 100)
      .exec();
  }

  async getLatestSensorData(sensorId: string): Promise<SensorData> {
    if (!Types.ObjectId.isValid(sensorId)) {
      throw new BadRequestException('Invalid sensor ID');
    }
    
    const latestData = await this.sensorDataModel
      .findOne({ sensorId: new Types.ObjectId(sensorId) })
      .sort({ timestamp: -1 })
      .exec();
    
    if (!latestData) {
      throw new NotFoundException(`No data found for sensor with ID ${sensorId}`);
    }
    
    return latestData;
  }

  async deleteSensorData(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid sensor data ID');
    }
    
    const result = await this.sensorDataModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Sensor data with ID ${id} not found`);
    }
  }

  // Méthodes pour les statistiques et l'analyse
  async getSensorStatistics(sensorId: string, startDate: Date, endDate: Date): Promise<any> {
    if (!Types.ObjectId.isValid(sensorId)) {
      throw new BadRequestException('Invalid sensor ID');
    }
    
    const stats = await this.sensorDataModel.aggregate([
      {
        $match: {
          sensorId: new Types.ObjectId(sensorId),
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          avgValue: { $avg: '$value' },
          minValue: { $min: '$value' },
          maxValue: { $max: '$value' },
          count: { $sum: 1 },
          alertCount: {
            $sum: { $cond: ['$isAlertTriggered', 1, 0] }
          }
        }
      }
    ]).exec();
    
    if (!stats.length) {
      return {
        avgValue: 0,
        minValue: 0,
        maxValue: 0,
        count: 0,
        alertCount: 0
      };
    }
    
    return stats[0];
  }
}