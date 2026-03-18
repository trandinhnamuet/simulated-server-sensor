import { Injectable } from '@nestjs/common';
import { SensorReadingDto } from '../dto/sensor-reading.dto';
import { TEMPERATURE_CONFIG } from '../constants/sensor.constants';

/**
 * Cache cho lần call gần nhất
 */
interface LastReading {
  value: number;
  timestamp: number; // milliseconds
}

/**
 * Service mô phỏng cảm biến nhiệt độ
 * Sinh ra dữ liệu nhiệt độ tự nhiên biến động theo thời gian
 * - Nếu 2 lần call < 2s: 50% trả kết quả cũ, 50% random
 * - Nếu 2 lần call >= 2s: random trong khoảng lệch (timeDiff/10)^2*100%
 */
@Injectable()
export class TemperatureService {
  private lastReading: LastReading | null = null;

  /**
   * Lấy dữ liệu nhiệt độ hiện tại
   * Giá trị biến động dựa trên thời gian kể từ lần call trước
   */
  getReading(n?: number): SensorReadingDto {
    const startTime = Date.now();
    const currentTime = Date.now();

    let newValue: number;

    if (this.lastReading === null) {
      // Lần call đầu tiên
      newValue = TEMPERATURE_CONFIG.BASE;
    } else {
      // Tính thời gian chênh lệch (giây)
      const timeDiffMs = currentTime - this.lastReading.timestamp;
      const timeDiffSec = timeDiffMs / 1000;

      // Tính phần trăm lệch tối đa: (timeDiff/10)^2 * 100%
      let maxFluctuationPercent = Math.pow(timeDiffSec / 10, 2) * 100;
      // Nếu có parameter n >= 1 thì chia phần trăm cho n
      if (n !== undefined && !Number.isNaN(n) && n >= 1) {
        maxFluctuationPercent = maxFluctuationPercent / n;
      }

      // Chuyển phần trăm thành giá trị tuyệt đối
      const maxFluctuationValue =
        (this.lastReading.value * maxFluctuationPercent) / 100;

      if (timeDiffSec < 2) {
        // Nếu < 2 giây: 50% trả kết quả cũ, 50% random trong range
        const returnOldValue = Math.random() < 0.5;
        if (returnOldValue) {
          newValue = this.lastReading.value;
        } else {
          // Random giá trị trong khoảng lệch
          const fluctuation =
            (Math.random() - 0.5) * 2 * maxFluctuationValue;
          newValue = this.lastReading.value + fluctuation;
        }
      } else {
        // Nếu >= 2 giây: random trong khoảng lệch
        const fluctuation = (Math.random() - 0.5) * 2 * maxFluctuationValue;
        newValue = this.lastReading.value + fluctuation;
      }
    }

    // Giữ giá trị trong phạm vi cho phép
    newValue = Math.max(TEMPERATURE_CONFIG.MIN, newValue);
    newValue = Math.min(TEMPERATURE_CONFIG.MAX, newValue);

    // Làm tròn đến 2 chữ số thập phân
    newValue = Math.round(newValue * 100) / 100;

    // Lưu cache
    this.lastReading = {
      value: newValue,
      timestamp: currentTime,
    };

    // Xác định trạng thái
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    let statusMessage = 'Nhiệt độ bình thường';

    if (newValue < 18) {
      status = 'warning';
      statusMessage = 'Cảnh báo: Nhiệt độ quá thấp';
    } else if (newValue > 26) {
      status = 'warning';
      statusMessage = 'Cảnh báo: Nhiệt độ quá cao';
    } else if (newValue < 16 || newValue > 28) {
      status = 'critical';
      statusMessage = 'Lỗi: Nhiệt độ ngoài phạm vi cho phép';
    }

    const responseTime = Date.now() - startTime;

    return {
      sensorName: TEMPERATURE_CONFIG.SENSOR_NAME,
      value: newValue,
      unit: TEMPERATURE_CONFIG.UNIT,
      timestamp: new Date().toISOString(),
      status,
      statusMessage,
      responseTime,
    };
  }
}
