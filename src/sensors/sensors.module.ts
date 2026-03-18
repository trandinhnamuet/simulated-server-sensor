import { Module } from '@nestjs/common';
import { TemperatureService } from './temperature.service';
import { HumidityService } from './humidity.service';
import { SensorsController } from './sensors.controller';

/**
 * Module cho các cảm biến
 * Quản lý các services và controllers liên quan đến cảm biến
 */
@Module({
  providers: [TemperatureService, HumidityService],
  controllers: [SensorsController],
})
export class SensorsModule {}
