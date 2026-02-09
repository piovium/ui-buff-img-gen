import type { ColorParams } from '../types';
import { clamp } from '../utils/math';

/**
 * 背景 Alpha 通道函数
 * 
 * @param distancePercent - 距离百分比（0-1）
 * @returns Alpha 值（0-255）
 */
export function bg_a_channel_function(distancePercent: number): number {
  const percent = distancePercent * 100; // 转换为百分比
  
  if (percent >= 0 && percent <= 58) {
    // 0-58%: 余弦函数（周期 0.7，峰值 255，谷值 125）
    // 将 0-58% 映射到余弦函数的周期
    const t = (percent / 100) * 0.7; // 映射到 0-0.7 周期
    const cosine = Math.cos(t * 2 * Math.PI);
    // 余弦值范围 [-1, 1]，映射到 [125, 255]
    const value = 125 + (cosine + 1) / 2 * (255 - 125);
    return Math.round(clamp(value, 0, 255));
  } else if (percent > 58 && percent < 70) {
    // 58-70%: 抛物线（58%处与上一段相等，70%为顶点值 0，开口向上）
    // 首先计算 58% 处的值（与余弦函数在 58% 处的值相等）
    const t58 = (58 / 100) * 0.7;
    const cosine58 = Math.cos(t58 * 2 * Math.PI);
    const value58 = 125 + (cosine58 + 1) / 2 * (255 - 125);
    
    // 抛物线：y = a * (x - 70)^2 + 0
    // 当 x = 58 时，y = value58
    // a = value58 / (58 - 70)^2 = value58 / 144
    const a = value58 / 144;
    const x = percent;
    const value = a * Math.pow(x - 70, 2);
    return Math.round(clamp(value, 0, 255));
  } else {
    // 70-100%: 常数 0
    return 0;
  }
}

/**
 * 背景 H 通道函数（常数函数）
 * 
 * @param constantValue - 常数 H 值（0-255）
 * @returns H 值（0-255）
 */
export function bg_h_channel_function(
  constantValue: number,
): number {
  return Math.round(clamp(constantValue, 0, 255));
}

/**
 * 背景 S 通道函数
 * 
 * @param distancePercent - 距离百分比（0-1）
 * @param startValue - 0% 处的值（0-255）
 * @param endValue - 62% 处的值（0-255）
 * @returns S 值（0-255）
 */
export function bg_s_channel_function(
  distancePercent: number,
  startValue: number,
  endValue: number,
): number {
  const percent = distancePercent * 100; // 转换为百分比
  
  if (percent >= 0 && percent < 62) {
    // 0-62%: 抛物线（0%为顶点开口向下，0%和62%处的值接受输入）
    // 抛物线：y = a * x^2 + b * x + c
    // 当 x = 0 时，y = startValue（顶点）
    // 当 x = 62 时，y = endValue
    // 顶点在 x = 0，所以 b = 0，c = startValue
    // a * 62^2 + startValue = endValue
    // a = (endValue - startValue) / 62^2
    const a = (endValue - startValue) / (62 * 62);
    const x = percent;
    const value = a * x * x + startValue;
    return Math.round(clamp(value, 0, 255));
  } else if (percent >= 62 && percent < 70) {
    // 62-70%: 线性函数（62%处与上阶段相同，70%处值为 50）
    // 首先计算 62% 处的值
    const a = (endValue - startValue) / (62 * 62);
    const value62 = a * 62 * 62 + startValue;
    
    // 线性插值：从 value62 到 50
    const t = (percent - 62) / (70 - 62);
    const value = value62 + (50 - value62) * t;
    return Math.round(clamp(value, 0, 255));
  } else {
    // 70-100%: 常数 50
    return 50;
  }
}

/**
 * 背景 B 通道函数
 * 
 * @param distancePercent - 距离百分比（0-1）
 * @param startValue - 0% 处的值（0-255）
 * @param endValue - 62% 处的值（0-255）
 * @returns B 值（0-255）
 */
export function bg_b_channel_function(
  distancePercent: number,
  startValue: number,
  endValue: number,
): number {
  const percent = distancePercent * 100; // 转换为百分比
  
  if (percent >= 0 && percent < 62) {
    // 0-62%: 抛物线（0%为顶点开口向下，0%和62%处的值接受输入）
    const a = (endValue - startValue) / (62 * 62);
    const x = percent;
    const value = a * x * x + startValue;
    return Math.round(clamp(value, 0, 255));
  } else if (percent >= 62 && percent < 70) {
    // 62-70%: 线性函数（62%处与上阶段相同，70%处值为 200）
    const a = (endValue - startValue) / (62 * 62);
    const value62 = a * 62 * 62 + startValue;
    
    // 线性插值：从 value62 到 200
    const t = (percent - 62) / (70 - 62);
    const value = value62 + (200 - value62) * t;
    return Math.round(clamp(value, 0, 255));
  } else {
    // 70-100%: 常数 200
    return 200;
  }
}

/**
 * 生成背景通道数据
 * 
 * @param width - 图像宽度
 * @param height - 图像高度
 * @param colorParams - 颜色参数
 * @param ring - 是否使用环形效果（影响 alpha 通道）
 * @returns 包含 bg_h, bg_s, bg_b, bg_a 四个通道的对象
 */
export function generateBackgroundChannels(
  width: number,
  height: number,
  colorParams: ColorParams,
  ring: boolean = false,
): {
  bg_h: Uint8Array;
  bg_s: Uint8Array;
  bg_b: Uint8Array;
  bg_a: Uint8Array;
} {
  const totalPixels = width * height;
  const bg_h = new Uint8Array(totalPixels);
  const bg_s = new Uint8Array(totalPixels);
  const bg_b = new Uint8Array(totalPixels);
  const bg_a = new Uint8Array(totalPixels);
  
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      
      // 计算径向距离百分比
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const distancePercent = distance / maxDistance;
      
      // 生成各通道值
      bg_h[index] = bg_h_channel_function(
        colorParams.bg_h_value,
      );
      bg_s[index] = bg_s_channel_function(
        distancePercent,
        colorParams.bg_s_start,
        colorParams.bg_s_end,
      );
      bg_b[index] = bg_b_channel_function(
        distancePercent,
        colorParams.bg_b_start,
        colorParams.bg_b_end,
      );
      
      // Alpha 通道：如果 ring=true，使用 ring 变体（目前与普通版本相同）
      // 可以根据需要实现 ring 变体的 bg_a 函数
      bg_a[index] = ring
        ? bg_a_channel_function_ring(distancePercent)
        : bg_a_channel_function(distancePercent);
    }
  }
  
  return { bg_h, bg_s, bg_b, bg_a };
}

/**
 * 带环形效果的背景 Alpha 通道函数
 * （目前实现与普通版本相同，可根据需要调整）
 * 
 * @param distancePercent - 距离百分比（0-1）
 * @returns Alpha 值（0-255）
 */
function bg_a_channel_function_ring(distancePercent: number): number {
  const percent = distancePercent * 100; // 转换为百分比
  
  if (percent >= 0 && percent <= 58) {
    // 0-58%: 余弦函数（周期 0.7，峰值 255，谷值 125）
    // 将 0-58% 映射到余弦函数的周期
    const t = (percent / 100) * 0.7; // 映射到 0-0.7 周期
    const cosine = Math.cos(t * 2 * Math.PI);
    // 余弦值范围 [-1, 1]，映射到 [125, 255]
    const value = 125 + (cosine + 1) / 2 * (255 - 125);
    return Math.round(clamp(value, 0, 255));
  } else if (percent > 58 && percent < 62) {
    // 58-70%: 抛物线（58%处与上一段相等，70%为顶点值 0，开口向上）
    // 首先计算 58% 处的值（与余弦函数在 58% 处的值相等）
    const t58 = (58 / 100) * 0.7;
    const cosine58 = Math.cos(t58 * 2 * Math.PI);
    const value58 = 125 + (cosine58 + 1) / 2 * (255 - 125);
    
    // 抛物线：y = a * (x - 70)^2 + 0
    // 当 x = 58 时，y = value58
    // a = value58 / (58 - 70)^2 = value58 / 144
    const a = value58 / 16;
    const x = percent;
    const value = a * Math.pow(x - 62, 2);
    return Math.round(clamp(value, 0, 255));
  } else {
    // 70-100%: 常数 0
    return 0;
  }
}

