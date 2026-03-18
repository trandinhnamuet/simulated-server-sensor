import { Injectable } from '@nestjs/common';
import { SensorReadingDto } from '../dto/sensor-reading.dto';
import { HUMIDITY_CONFIG } from '../constants/sensor.constants';

/**
 * Cache cho lần call gần nhất
 */
interface LastReading {
  value: number;
  timestamp: number; // milliseconds
}

// reuse same normalRandom helper
function normalRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Service mô phỏng cảm biến độ ẩm
 * Sinh ra dữ liệu độ ẩm tự nhiên biến động theo thời gian
 * - Nếu 2 lần call < 2s: 50% trả kết quả cũ, 50% random
 * - Nếu 2 lần call >= 2s: random trong khoảng lệch (timeDiff/10)^2*100%
 */
@Injectable()
export class HumidityService {
  private lastReading: LastReading | null = null;

  /**
   * Lấy dữ liệu độ ẩm hiện tại
   * Giá trị biến động dựa trên thời gian kể từ lần call trước
   */
  getReading(n?: number): SensorReadingDto {
    const startTime = Date.now();
    const currentTime = Date.now();

    let newValue: number;

    // OU params for humidity
    const theta = 0.01; // mean reversion rate
    let sigma = 0.3; // volatility (% per sqrt(s))
    if (n !== undefined && !Number.isNaN(n) && n >= 1) {
      sigma = sigma / n;
    }

    if (this.lastReading === null) {
      newValue = HUMIDITY_CONFIG.BASE;
    } else {
      const timeDiffMs = currentTime - this.lastReading.timestamp;
      const dt = Math.max(timeDiffMs / 1000, 0);

      if (dt < 2) {
        if (Math.random() < 0.5) {
          newValue = this.lastReading.value;
        } else {
          const z = normalRandom();
          const meanRevert = theta * (HUMIDITY_CONFIG.BASE - this.lastReading.value) * dt;
          const stochastic = sigma * Math.sqrt(dt) * z;
          newValue = this.lastReading.value + meanRevert + stochastic;
        }
      } else {
        const z = normalRandom();
        const meanRevert = theta * (HUMIDITY_CONFIG.BASE - this.lastReading.value) * dt;
        const stochastic = sigma * Math.sqrt(dt) * z;
        newValue = this.lastReading.value + meanRevert + stochastic;
      }
    }

    // Giữ giá trị trong phạm vi cho phép
    newValue = Math.max(HUMIDITY_CONFIG.MIN, newValue);
    newValue = Math.min(HUMIDITY_CONFIG.MAX, newValue);

    // Làm tròn đến 2 chữ số thập phân
    newValue = Math.round(newValue * 100) / 100;

    // Lưu cache
    this.lastReading = {
      value: newValue,
      timestamp: currentTime,
    };

    // Xác định trạng thái
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    let statusMessage = 'Độ ẩm bình thường';

    if (newValue < 35) {
      status = 'warning';
      statusMessage = 'Cảnh báo: Độ ẩm quá thấp';
    } else if (newValue > 65) {
      status = 'warning';
      statusMessage = 'Cảnh báo: Độ ẩm quá cao';
    } else if (newValue < 30 || newValue > 70) {
      status = 'critical';
      statusMessage = 'Lỗi: Độ ẩm ngoài phạm vi cho phép';
    }

    const responseTime = Date.now() - startTime;

    return {
      sensorName: HUMIDITY_CONFIG.SENSOR_NAME,
      value: newValue,
      unit: HUMIDITY_CONFIG.UNIT,
      timestamp: new Date().toISOString(),
      status,
      statusMessage,
      responseTime,
    };
  }
}
