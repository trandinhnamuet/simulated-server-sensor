import { Controller, Get, Query } from '@nestjs/common';
import { TemperatureService } from './temperature.service';
import { HumidityService } from './humidity.service';
import { SensorReadingDto } from '../dto/sensor-reading.dto';

/**
 * Controller cho các API cảm biến
 * Cung cấp 2 endpoint để lấy dữ liệu nhiệt độ và độ ẩm
 */
@Controller('sensors')
export class SensorsController {
  constructor(
    private readonly temperatureService: TemperatureService,
    private readonly humidityService: HumidityService,
  ) {}

  /**
   * API lấy dữ liệu nhiệt độ hiện tại
   * GET /sensors/temperature
   */
  @Get('temperature/1')
  getTemperature(@Query('n') n?: string): SensorReadingDto {
    const factor = n ? parseFloat(n) : undefined;
    return this.temperatureService.getReading(factor);
  }

  /**
   * API lấy dữ liệu độ ẩm hiện tại
   * GET /sensors/humidity
   */
  @Get('humidity/1')
  getHumidity(@Query('n') n?: string): SensorReadingDto {
    const factor = n ? parseFloat(n) : undefined;
    return this.humidityService.getReading(factor);
  }
}
