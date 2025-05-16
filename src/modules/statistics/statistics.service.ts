import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Sensor } from '../sensors/schemas/sensor.schema';
import { SensorData } from '../sensors/schemas/sensor-data.schema';
import { Device } from '../devices/schemas/device.schema';
import { Alert } from '../alerts/schemas/alert.schema';
import { Plant } from '../plants/schemas/plant.schema';
import { Plantation, PlantationStatus } from '../plants/schemas/plantation.schema';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Sensor.name) private sensorModel: Model<Sensor>,
    @InjectModel(SensorData.name) private sensorDataModel: Model<SensorData>,
    @InjectModel(Device.name) private deviceModel: Model<Device>,
    @InjectModel(Alert.name) private alertModel: Model<Alert>,
    @InjectModel(Plant.name) private plantModel: Model<Plant>,
    @InjectModel(Plantation.name) private plantationModel: Model<Plantation>,
  ) {}

  async getSystemOverview(): Promise<any> {
    const [
      totalDevices,
      totalSensors,
      totalAlerts,
      totalPlants,
      totalPlantations,
      activeDevices,
      activePlantations,
      unresolvedAlerts,
    ] = await Promise.all([
      this.deviceModel.countDocuments(),
      this.sensorModel.countDocuments(),
      this.alertModel.countDocuments(),
      this.plantModel.countDocuments(),
      this.plantationModel.countDocuments(),
      this.deviceModel.countDocuments({ isActive: true }),
      this.plantationModel.countDocuments({ status: PlantationStatus.ACTIVE }),
      this.alertModel.countDocuments({ resolved: false }),
    ]);

    return {
      totalDevices,
      totalSensors,
      totalAlerts,
      totalPlants,
      totalPlantations,
      activeDevices,
      activePlantations,
      unresolvedAlerts,
    };
  }

  async getSensorStatistics(period: string = 'week'): Promise<any> {
    let dateFilter: Date;
    const now = new Date();

    switch (period) {
      case 'day':
        dateFilter = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        dateFilter = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        dateFilter = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        dateFilter = new Date(now.setDate(now.getDate() - 7));
    }

    // Get sensor data counts by type
    const sensorTypeCounts = await this.sensorModel.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // Get sensor data readings over time
    const sensorDataByType = await this.sensorDataModel.aggregate([
      { $match: { timestamp: { $gte: dateFilter } } },
      {
        $lookup: {
          from: 'sensors',
          localField: 'sensorId',
          foreignField: '_id',
          as: 'sensor',
        },
      },
      { $unwind: '$sensor' },
      {
        $group: {
          _id: {
            type: '$sensor.type',
            day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          },
          avgValue: { $avg: '$value' },
          minValue: { $min: '$value' },
          maxValue: { $max: '$value' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.day': 1 } },
    ]);

    // Format the results
    const formattedSensorData = {};
    sensorDataByType.forEach((item) => {
      const type = item._id.type;
      const day = item._id.day;
      
      if (!formattedSensorData[type]) {
        formattedSensorData[type] = [];
      }
      
      formattedSensorData[type].push({
        date: day,
        avgValue: item.avgValue,
        minValue: item.minValue,
        maxValue: item.maxValue,
        count: item.count,
      });
    });

    return {
      sensorCounts: sensorTypeCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      sensorDataByType: formattedSensorData,
    };
  }

  async getAlertStatistics(period: string = 'month'): Promise<any> {
    let dateFilter: Date;
    const now = new Date();

    switch (period) {
      case 'week':
        dateFilter = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        dateFilter = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        dateFilter = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Get alerts by type
    const alertsByType = await this.alertModel.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // Get alerts by severity
    const alertsBySeverity = await this.alertModel.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    // Get alerts by resolution status
    const alertsByResolution = await this.alertModel.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      { $group: { _id: '$resolved', count: { $sum: 1 } } },
    ]);

    // Get alerts over time
    const alertsOverTime = await this.alertModel.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.day': 1 } },
    ]);

    // Get resolution time statistics
    const resolutionTimeStats = await this.alertModel.aggregate([
      { 
        $match: { 
          createdAt: { $gte: dateFilter },
          resolved: true,
          resolvedAt: { $ne: null }
        } 
      },
      {
        $project: {
          resolutionTimeMs: { $subtract: ['$resolvedAt', '$createdAt'] },
          type: 1,
          severity: 1,
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionTimeMs: { $avg: '$resolutionTimeMs' },
          minResolutionTimeMs: { $min: '$resolutionTimeMs' },
          maxResolutionTimeMs: { $max: '$resolutionTimeMs' },
        },
      },
    ]);

    return {
      alertsByType: alertsByType.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      alertsBySeverity: alertsBySeverity.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      alertsByResolution: alertsByResolution.reduce((acc, curr) => {
        acc[curr._id ? 'resolved' : 'unresolved'] = curr.count;
        return acc;
      }, {}),
      alertsOverTime: alertsOverTime.map(item => ({
        date: item._id.day,
        count: item.count,
      })),
      resolutionTimeStats: resolutionTimeStats.length > 0 ? {
        avgResolutionTimeHours: resolutionTimeStats[0].avgResolutionTimeMs / (1000 * 60 * 60),
        minResolutionTimeHours: resolutionTimeStats[0].minResolutionTimeMs / (1000 * 60 * 60),
        maxResolutionTimeHours: resolutionTimeStats[0].maxResolutionTimeMs / (1000 * 60 * 60),
      } : null,
    };
  }

  async getDeviceStatistics(): Promise<any> {
    // Get devices by status
    const devicesByStatus = await this.deviceModel.aggregate([
      { $group: { _id: '$isActive', count: { $sum: 1 } } },
    ]);

    // Get devices with most sensors
    const devicesWithMostSensors = await this.deviceModel.aggregate([
      { $project: { name: 1, location: 1, sensorCount: { $size: '$sensors' } } },
      { $sort: { sensorCount: -1 } },
      { $limit: 5 },
    ]);

    // Get devices with most alerts
    const devicesWithMostAlerts = await this.alertModel.aggregate([
      { $group: { _id: '$deviceId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'devices',
          localField: '_id',
          foreignField: '_id',
          as: 'device',
        },
      },
      { $unwind: '$device' },
      {
        $project: {
          _id: 0,
          deviceId: '$_id',
          name: '$device.name',
          location: '$device.location',
          alertCount: '$count',
        },
      },
    ]);

    // Get devices with most plantations
    const devicesWithMostPlantations = await this.plantationModel.aggregate([
      { $group: { _id: '$deviceId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'devices',
          localField: '_id',
          foreignField: '_id',
          as: 'device',
        },
      },
      { $unwind: '$device' },
      {
        $project: {
          _id: 0,
          deviceId: '$_id',
          name: '$device.name',
          location: '$device.location',
          plantationCount: '$count',
        },
      },
    ]);

    return {
      devicesByStatus: devicesByStatus.reduce((acc, curr) => {
        acc[curr._id ? 'active' : 'inactive'] = curr.count;
        return acc;
      }, {}),
      devicesWithMostSensors,
      devicesWithMostAlerts,
      devicesWithMostPlantations,
    };
  }

  async getGrowthPerformance(period: string = 'year'): Promise<any> {
    let dateFilter: Date;
    const now = new Date();

    switch (period) {
      case 'month':
        dateFilter = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'all':
        dateFilter = new Date(0); // Beginning of time
        break;
      default:
        dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
    }

    // Get harvest success rate by plant category
    const harvestSuccessByCategory = await this.plantationModel.aggregate([
      { $match: { plantedDate: { $gte: dateFilter } } },
      {
        $lookup: {
          from: 'plants',
          localField: 'plantId',
          foreignField: '_id',
          as: 'plant',
        },
      },
      { $unwind: '$plant' },
      {
        $group: {
          _id: '$plant.category',
          total: { $sum: 1 },
          harvested: {
            $sum: {
              $cond: [{ $eq: ['$status', PlantationStatus.HARVESTED] }, 1, 0],
            },
          },
          failed: {
            $sum: {
              $cond: [{ $eq: ['$status', PlantationStatus.FAILED] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          harvested: 1,
          failed: 1,
          successRate: {
            $multiply: [
              { $divide: ['$harvested', { $max: ['$total', 1] }] },
              100,
            ],
          },
        },
      },
    ]);

    // Get average growth cycle duration by plant category
    const growthCycleDuration = await this.plantationModel.aggregate([
      {
        $match: {
          plantedDate: { $gte: dateFilter },
          status: PlantationStatus.HARVESTED,
          harvestedDate: { $ne: null },
        },
      },
      {
        $lookup: {
          from: 'plants',
          localField: 'plantId',
          foreignField: '_id',
          as: 'plant',
        },
      },
      { $unwind: '$plant' },
      {
        $project: {
          category: '$plant.category',
          plantName: '$plant.name',
          cycleDurationDays: {
            $divide: [
              { $subtract: ['$harvestedDate', '$plantedDate'] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$category',
          avgCycleDurationDays: { $avg: '$cycleDurationDays' },
          minCycleDurationDays: { $min: '$cycleDurationDays' },
          maxCycleDurationDays: { $max: '$cycleDurationDays' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get plantations over time
    const plantationsOverTime = await this.plantationModel.aggregate([
      { $match: { plantedDate: { $gte: dateFilter } } },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$plantedDate' } },
          },
          count: { $sum: 1 },
          harvested: {
            $sum: {
              $cond: [{ $eq: ['$status', PlantationStatus.HARVESTED] }, 1, 0],
            },
          },
          failed: {
            $sum: {
              $cond: [{ $eq: ['$status', PlantationStatus.FAILED] }, 1, 0],
            },
          },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    return {
      harvestSuccessByCategory,
      growthCycleDuration,
      plantationsOverTime: plantationsOverTime.map(item => ({
        month: item._id.month,
        count: item.count,
        harvested: item.harvested,
        failed: item.failed,
      })),
    };
  }

  async getCorrelationAnalysis(): Promise<any> {
    // Analyze correlation between sensor readings and plant growth success
    // This is a simplified version that looks at average sensor values for successful vs failed plantations
    
    const sensorCorrelations = await this.plantationModel.aggregate([
      {
        $match: {
          status: { $in: [PlantationStatus.HARVESTED, PlantationStatus.FAILED] },
        },
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'deviceId',
          foreignField: '_id',
          as: 'device',
        },
      },
      { $unwind: '$device' },
      {
        $lookup: {
          from: 'sensors',
          localField: 'device.sensors',
          foreignField: '_id',
          as: 'sensors',
        },
      },
      { $unwind: '$sensors' },
      {
        $lookup: {
          from: 'sensordatas',
          let: { sensorId: '$sensors._id', plantedDate: '$plantedDate', harvestedDate: { $ifNull: ['$harvestedDate', new Date()] } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$sensorId', '$$sensorId'] },
                    { $gte: ['$timestamp', '$$plantedDate'] },
                    { $lte: ['$timestamp', '$$harvestedDate'] },
                  ],
                },
              },
            },
          ],
          as: 'sensorData',
        },
      },
      {
        $group: {
          _id: {
            sensorType: '$sensors.type',
            plantationStatus: '$status',
          },
          avgValue: { $avg: { $avg: '$sensorData.value' } },
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the results for easier consumption
    const formattedCorrelations = {};
    sensorCorrelations.forEach((item) => {
      const sensorType = item._id.sensorType;
      const status = item._id.plantationStatus;
      
      if (!formattedCorrelations[sensorType]) {
        formattedCorrelations[sensorType] = {};
      }
      
      formattedCorrelations[sensorType][status] = {
        avgValue: item.avgValue,
        count: item.count,
      };
    });

    // Analyze correlation between alert frequency and plant growth success
    const alertCorrelations = await this.plantationModel.aggregate([
      {
        $match: {
          status: { $in: [PlantationStatus.HARVESTED, PlantationStatus.FAILED] },
        },
      },
      {
        $lookup: {
          from: 'alerts',
          let: { deviceId: '$deviceId', plantedDate: '$plantedDate', harvestedDate: { $ifNull: ['$harvestedDate', new Date()] } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$deviceId', '$$deviceId'] },
                    { $gte: ['$createdAt', '$$plantedDate'] },
                    { $lte: ['$createdAt', '$$harvestedDate'] },
                  ],
                },
              },
            },
          ],
          as: 'alerts',
        },
      },
      {
        $group: {
          _id: '$status',
          avgAlertCount: { $avg: { $size: '$alerts' } },
          plantationCount: { $sum: 1 },
        },
      },
    ]);

    return {
      sensorCorrelations: formattedCorrelations,
      alertCorrelations: alertCorrelations.reduce((acc, curr) => {
        acc[curr._id] = {
          avgAlertCount: curr.avgAlertCount,
          plantationCount: curr.plantationCount,
        };
        return acc;
      }, {}),
    };
  }
}