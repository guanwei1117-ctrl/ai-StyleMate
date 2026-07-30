import { Injectable, Logger } from '@nestjs/common';

export interface WeatherInfo {
  /** 城市名 */
  city: string;
  /** 天气状况文字描述（如"晴""多云""小雨"） */
  condition: string;
  /** WMO 天气码 */
  weatherCode: number;
  /** 当前温度 (°C) */
  temperature: number;
  /** 体感温度 (°C) */
  apparentTemperature: number;
  /** 风速 km/h */
  windSpeed: number;
  /** 湿度 % */
  humidity: number;
  /** 是否下雨 */
  isRaining: boolean;
}

/**
 * 天气服务 — 基于 Open-Meteo 免费 API（无需 API key）
 *
 * 流程：城市名 → Open-Meteo Geocoding API 获取经纬度 → Open-Meteo Forecast API 获取实时天气
 */
@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  private static readonly WMO_CODES: Record<number, { label: string; raining: boolean }> = {
    0: { label: '晴', raining: false },
    1: { label: '晴间多云', raining: false },
    2: { label: '多云', raining: false },
    3: { label: '阴', raining: false },
    45: { label: '雾', raining: false },
    48: { label: '雾凇', raining: false },
    51: { label: '毛毛雨', raining: true },
    53: { label: '毛毛雨', raining: true },
    55: { label: '毛毛雨', raining: true },
    56: { label: '冻雨', raining: true },
    57: { label: '冻雨', raining: true },
    61: { label: '小雨', raining: true },
    63: { label: '中雨', raining: true },
    65: { label: '大雨', raining: true },
    66: { label: '冻雨', raining: true },
    67: { label: '冻雨', raining: true },
    71: { label: '小雪', raining: false },
    73: { label: '中雪', raining: false },
    75: { label: '大雪', raining: false },
    77: { label: '阵雪', raining: false },
    80: { label: '阵雨', raining: true },
    81: { label: '阵雨', raining: true },
    82: { label: '暴雨', raining: true },
    85: { label: '阵雪', raining: false },
    86: { label: '阵雪', raining: false },
    95: { label: '雷阵雨', raining: true },
    96: { label: '雷阵雨伴冰雹', raining: true },
    99: { label: '雷阵雨伴冰雹', raining: true },
  };

  async getWeather(city: string): Promise<WeatherInfo> {
    const coords = await this.geocode(city);
    const weather = await this.fetchWeather(coords.latitude, coords.longitude);

    this.logger.log(
      `天气获取成功 | 城市: ${city} | ${weather.condition} ${weather.temperature}°C (体感 ${weather.apparentTemperature}°C)`,
    );

    return {
      city: coords.name,
      ...weather,
    };
  }

  private async geocode(
    city: string,
  ): Promise<{ latitude: number; longitude: number; name: string }> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`城市解析失败: ${res.status}`);
    }

    const data = await res.json() as any;
    if (!data.results || data.results.length === 0) {
      throw new Error(`找不到城市「${city}」，请确认城市名`);
    }

    const hit = data.results[0];
    return {
      latitude: hit.latitude,
      longitude: hit.longitude,
      name: hit.name,
    };
  }

  private async fetchWeather(
    latitude: number,
    longitude: number,
  ): Promise<Omit<WeatherInfo, 'city'>> {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
      `&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`天气获取失败: ${res.status}`);
    }

    const data = await res.json() as any;
    const current = data.current;
    if (!current) {
      throw new Error('天气数据为空');
    }

    const weatherCode = Number(current.weather_code);
    const wmo = WeatherService.WMO_CODES[weatherCode] ?? {
      label: '未知',
      raining: false,
    };

    return {
      condition: wmo.label,
      weatherCode,
      temperature: Math.round(Number(current.temperature_2m)),
      apparentTemperature: Math.round(Number(current.apparent_temperature)),
      windSpeed: Math.round(Number(current.wind_speed_10m)),
      humidity: Number(current.relative_humidity_2m),
      isRaining: wmo.raining,
    };
  }
}
