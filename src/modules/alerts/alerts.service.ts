import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Alert, AlertDocument, AlertStatus } from './schemas/alert.schema';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { QueryAlertsDto } from './dto/query-alerts.dto';

@Injectable()
export class AlertsService {
  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
  ) {}

  async createAlert(createAlertDto: CreateAlertDto): Promise<Alert> {
    // Convertir les IDs en ObjectId
    const newAlert = new this.alertModel({
      ...createAlertDto,
      sensorId: new Types.ObjectId(createAlertDto.sensorId),
      deviceId: new Types.ObjectId(createAlertDto.deviceId),
      timestamp: createAlertDto.timestamp || new Date(),
    });
    
    return newAlert.save();
  }

  async findAllAlerts(queryDto: QueryAlertsDto): Promise<Alert[]> {
    const { 
      sensorId, sensorType, deviceId, severity, status, 
      startDate, endDate, limit, skip, sortBy, sortOrder 
    } = queryDto;
    
    const query: any = {};
    
    if (sensorId) {
      if (!Types.ObjectId.isValid(sensorId)) {
        throw new BadRequestException('ID de capteur invalide');
      }
      query.sensorId = new Types.ObjectId(sensorId);
    }
    
    if (sensorType) {
      query.sensorType = sensorType;
    }
    
    if (deviceId) {
      if (!Types.ObjectId.isValid(deviceId)) {
        throw new BadRequestException('ID de dispositif invalide');
      }
      query.deviceId = new Types.ObjectId(deviceId);
    }
    
    if (severity) {
      query.severity = severity;
    }
    
    if (status) {
      query.status = status;
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
    
    // Construire l'ordre de tri
    const sort = {};
    sort[sortBy || 'timestamp'] = sortOrder === 'asc' ? 1 : -1;
    
    return this.alertModel
      .find(query)
      .sort(sort)
      .skip(skip || 0)
      .limit(limit || 20)
      .exec();
  }

  async findAlertById(id: string): Promise<Alert> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID d\'alerte invalide');
    }
    
    const alert = await this.alertModel.findById(id).exec();
    
    if (!alert) {
      throw new NotFoundException(`Alerte avec l'ID ${id} non trouvée`);
    }
    
    return alert;
  }

  async updateAlert(id: string, updateAlertDto: UpdateAlertDto): Promise<Alert> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID d\'alerte invalide');
    }
    
    const updateData: any = { ...updateAlertDto };
    
    // Convertir l'ID de l'utilisateur en ObjectId si fourni
    if (updateAlertDto.acknowledgedBy && Types.ObjectId.isValid(updateAlertDto.acknowledgedBy)) {
      updateData.acknowledgedBy = new Types.ObjectId(updateAlertDto.acknowledgedBy);
    }
    
    // Mettre à jour automatiquement les dates en fonction du statut
    if (updateAlertDto.status === AlertStatus.ACKNOWLEDGED && !updateAlertDto.acknowledgedAt) {
      updateData.acknowledgedAt = new Date();
    }
    
    if (updateAlertDto.status === AlertStatus.RESOLVED && !updateAlertDto.resolvedAt) {
      updateData.resolvedAt = new Date();
    }
    
    const updatedAlert = await this.alertModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    if (!updatedAlert) {
      throw new NotFoundException(`Alerte avec l'ID ${id} non trouvée`);
    }
    
    return updatedAlert;
  }

  async deleteAlert(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID d\'alerte invalide');
    }
    
    const result = await this.alertModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Alerte avec l'ID ${id} non trouvée`);
    }
  }

  async getAlertStatistics(deviceId?: string, startDate?: Date, endDate?: Date): Promise<any> {
    const query: any = {};
    
    if (deviceId) {
      if (!Types.ObjectId.isValid(deviceId)) {
        throw new BadRequestException('ID de dispositif invalide');
      }
      query.deviceId = new Types.ObjectId(deviceId);
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = startDate;
      }
      if (endDate) {
        query.timestamp.$lte = endDate;
      }
    }
    
    const stats = await this.alertModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            severity: '$severity',
            status: '$status',
            sensorType: '$sensorType'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.severity',
          statusCounts: {
            $push: {
              status: '$_id.status',
              sensorType: '$_id.sensorType',
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      }
    ]).exec();
    
    return stats;
  }

  async acknowledgeAlert(id: string, userId: string): Promise<Alert> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID d\'alerte ou d\'utilisateur invalide');
    }
    
    const alert = await this.alertModel.findById(id).exec();
    
    if (!alert) {
      throw new NotFoundException(`Alerte avec l'ID ${id} non trouvée`);
    }
    
    if (alert.status !== AlertStatus.NEW) {
      throw new BadRequestException(`L'alerte a déjà été ${alert.status}`);
    }
    
    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedBy = new Types.ObjectId(userId);
    alert.acknowledgedAt = new Date();
    
    return alert.save();
  }

  async resolveAlert(id: string): Promise<Alert> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID d\'alerte invalide');
    }
    
    const alert = await this.alertModel.findById(id).exec();
    
    if (!alert) {
      throw new NotFoundException(`Alerte avec l'ID ${id} non trouvée`);
    }
    
    if (alert.status === AlertStatus.RESOLVED) {
      throw new BadRequestException('L\'alerte est déjà résolue');
    }
    
    alert.status = AlertStatus.RESOLVED;
    alert.resolvedAt = new Date();
    
    return alert.save();
  }

  async dismissAlert(id: string): Promise<Alert> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID d\'alerte invalide');
    }
    
    const alert = await this.alertModel.findById(id).exec();
    
    if (!alert) {
      throw new NotFoundException(`Alerte avec l'ID ${id} non trouvée`);
    }
    
    alert.status = AlertStatus.DISMISSED;
    
    return alert.save();
  }
}