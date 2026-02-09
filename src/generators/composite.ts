import { hsbToRgb } from '../utils/color';

/**
 * 合成背景和前景通道为最终 RGBA 图像
 * 
 * @param width - 图像宽度
 * @param height - 图像高度
 * @param bgH - 背景 H 通道
 * @param bgS - 背景 S 通道
 * @param bgB - 背景 B 通道
 * @param bgA - 背景 Alpha 通道
 * @param fgH - 前景 H 通道
 * @param fgS - 前景 S 通道
 * @param fgB - 前景 B 通道
 * @param fgA - 前景 Alpha 通道
 * @returns 合成后的 ImageData 对象
 */
export function compositeChannels(
  width: number,
  height: number,
  bgH: Uint8Array,
  bgS: Uint8Array,
  bgB: Uint8Array,
  bgA: Uint8Array,
  fgH: Uint8Array,
  fgS: Uint8Array,
  fgB: Uint8Array,
  fgA: Uint8Array,
): ImageData {
  const totalPixels = width * height;
  const imageData = new ImageData(width, height);
  const data = imageData.data;
  
  for (let i = 0; i < totalPixels; i++) {
    // 将背景 HSB 转换为 RGB
    const [bgR, bgG, bgBValue] = hsbToRgb(bgH[i], bgS[i], bgB[i]);
    const bgAlpha = bgA[i] / 255; // 归一化到 0-1
    
    // 将前景 HSB 转换为 RGB
    const [fgR, fgG, fgBValue] = hsbToRgb(fgH[i], fgS[i], fgB[i]);
    const fgAlpha = fgA[i] / 255; // 归一化到 0-1
    
    // 使用标准的“前景覆盖（over）”合成：
    // outAlpha = fgA + bgA * (1 - fgA)
    // outRGB = (fgRGB * fgA + bgRGB * bgA * (1 - fgA)) / outAlpha
    const finalAlpha = Math.min(fgAlpha + bgAlpha * (1 - fgAlpha), 1);

    let resultR: number;
    let resultG: number;
    let resultB: number;

    if (finalAlpha > 0) {
      const r = fgR * fgAlpha + bgR * bgAlpha * (1 - fgAlpha);
      const g = fgG * fgAlpha + bgG * bgAlpha * (1 - fgAlpha);
      const b = fgBValue * fgAlpha + bgBValue * bgAlpha * (1 - fgAlpha);

      resultR = r / finalAlpha;
      resultG = g / finalAlpha;
      resultB = b / finalAlpha;
    } else {
      resultR = 0;
      resultG = 0;
      resultB = 0;
    }
    
    // 写入 RGBA 数据
    const idx = i * 4;
    data[idx] = Math.round(clamp(resultR, 0, 255)); // R
    data[idx + 1] = Math.round(clamp(resultG, 0, 255)); // G
    data[idx + 2] = Math.round(clamp(resultB, 0, 255)); // B
    data[idx + 3] = Math.round(finalAlpha * 255); // A
  }
  
  return imageData;
}

/**
 * 将值限制在指定范围内
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
