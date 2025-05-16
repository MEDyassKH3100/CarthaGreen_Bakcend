import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device, DeviceDocument, DeviceStatus } from './schemas/device.schema';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  async createDevice(createDeviceDto: CreateDeviceDto): Promise<Device> {
    // Vérifier si un dispositif avec le même deviceId existe déjà
    const existingDevice = await this.deviceModel.findOne({ deviceId: createDeviceDto.deviceId }).exec();
    if (existingDevice) {
      throw new ConflictException(`Un dispositif avec l'ID ${createDeviceDto.deviceId} existe déjà`);
    }

    const newDevice = new this.deviceModel(createDeviceDto);
    return newDevice.save();
  }

  async findAllDevices(status?: DeviceStatus): Promise<Device[]> {
    const query = status ? { status } : {};
    return this.deviceModel.find(query).exec();
  }

  async findDeviceById(id: string): Promise<Device> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de dispositif invalide');
    }
    
    const device = await this.deviceModel.findById(id).exec();
    if (!device) {
      throw new NotFoundException(`Dispositif avec l'ID ${id} non trouvé`);
    }
    
    return device;
  }

  async findDeviceByDeviceId(deviceId: string): Promise<Device> {
    const device = await this.deviceModel.findOne({ deviceId }).exec();
    if (!device) {
      throw new NotFoundException(`Dispositif avec l'ID ${deviceId} non trouvé`);
    }
    
    return device;
  }

  async updateDevice(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de dispositif invalide');
    }
    
    // Convertir les IDs de capteurs en ObjectId si fournis
    if (updateDeviceDto.sensors) {
      const sensorObjectIds = updateDeviceDto.sensors.map(sensorId => 
        new Types.ObjectId(sensorId)
      );
      updateDeviceDto.sensors = sensorObjectIds as any;
    }
    
    const updatedDevice = await this.deviceModel
      .findByIdAndUpdate(id, updateDeviceDto, { new: true })
      .exec();
    
    if (!updatedDevice) {
      throw new NotFoundException(`Dispositif avec l'ID ${id} non trouvé`);
    }
    
    return updatedDevice;
  }

  async deleteDevice(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de dispositif invalide');
    }
    
    const result = await this.deviceModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Dispositif avec l'ID ${id} non trouvé`);
    }
  }

  async updateDeviceStatus(deviceId: string, status: DeviceStatus): Promise<Device> {
    const device = await this.deviceModel.findOne({ deviceId }).exec();
    
    if (!device) {
      throw new NotFoundException(`Dispositif avec l'ID ${deviceId} non trouvé`);
    }
    
    device.status = status;
    
    // Si le dispositif est en ligne, mettre à jour la date de dernière connexion
    if (status === DeviceStatus.ONLINE) {
      device.lastConnection = new Date();
    }
    
    return device.save();
  }

  async addSensorToDevice(deviceId: string, sensorId: string): Promise<Device> {
    if (!Types.ObjectId.isValid(deviceId) || !Types.ObjectId.isValid(sensorId)) {
      throw new BadRequestException('ID de dispositif ou de capteur invalide');
    }
    
    const device = await this.deviceModel.findById(deviceId).exec();
    
    if (!device) {
      throw new NotFoundException(`Dispositif avec l'ID ${deviceId} non trouvé`);
    }
    
    // Vérifier si le capteur est déjà associé au dispositif
    const sensorObjectId = new Types.ObjectId(sensorId);
    if (!device.sensors.some(id => id.equals(sensorObjectId))) {
      device.sensors.push(sensorObjectId);
      return device.save();
    }
    
    return device;
  }

  async removeSensorFromDevice(deviceId: string, sensorId: string): Promise<Device> {
    if (!Types.ObjectId.isValid(deviceId) || !Types.ObjectId.isValid(sensorId)) {
      throw new BadRequestException('ID de dispositif ou de capteur invalide');
    }
    
    const device = await this.deviceModel.findById(deviceId).exec();
    
    if (!device) {
      throw new NotFoundException(`Dispositif avec l'ID ${deviceId} non trouvé`);
    }
    
    const sensorObjectId = new Types.ObjectId(sensorId);
    device.sensors = device.sensors.filter(id => !id.equals(sensorObjectId));
    
    return device.save();
  }

  async updateDeviceConfiguration(deviceId: string, configuration: Record<string, any>): Promise<Device> {
    if (!Types.ObjectId.isValid(deviceId)) {
      throw new BadRequestException('ID de dispositif invalide');
    }
    
    const device = await this.deviceModel.findById(deviceId).exec();
    
    if (!device) {
      throw new NotFoundException(`Dispositif avec l'ID ${deviceId} non trouvé`);
    }
    
    // Fusionner la configuration existante avec la nouvelle
    device.configuration = { ...device.configuration, ...configuration };
    
    return device.save();
  }
}