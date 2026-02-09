/**
 * 生成器模块统一导出
 */

export * from './channel';
export * from './background';
export * from './foreground';
export * from './ring';
export * from './composite';

import type { InputParams, ColorParams } from '../types';
import { generateBackgroundChannels } from './background';
import { generateForegroundChannels } from './foreground';
import { generateRingMask } from './ring';
import { compositeChannels } from './composite';

/**
 * 应用圆环蒙版到背景通道
 * 
 * @param bgA - 背景 Alpha 通道
 * @param bgB - 背景 B 通道
 * @param mask - 圆环蒙版
 * @param ringBValue - 圆环亮度值（0-255）
 */
function applyRingMask(
  bgA: Uint8Array,
  bgB: Uint8Array,
  mask: Uint8Array,
  ringBValue: number,
): void {
  const totalPixels = bgA.length;
  
  for (let i = 0; i < totalPixels; i++) {
    const maskAlpha = mask[i] / 255; // 归一化到 0-1
    
    // 对 bg_a: 创建值为 175 的 overlay，以 mask 为 alpha 叠加
    // overlay = 175 * mask_alpha + bg_a * (1 - mask_alpha)
    bgA[i] = Math.round(175 * maskAlpha + bgA[i] * (1 - maskAlpha));
    
    // 对 bg_b: 使用 ring_b_value 的 overlay，以 mask 为 alpha 叠加
    // overlay = ring_b_value * mask_alpha + bg_b * (1 - mask_alpha)
    bgB[i] = Math.round(ringBValue * maskAlpha + bgB[i] * (1 - maskAlpha));
  }
}

/**
 * 生成最终图像
 * 
 * @param width - 图像宽度
 * @param height - 图像高度
 * @param inputParams - 输入参数
 * @returns Promise<ImageData> - 生成的图像数据
 */
export async function generateImage(
  width: number,
  height: number,
  inputParams: InputParams,
  colorParams: ColorParams,
): Promise<ImageData> {
  
  // 加载前景图像（如果提供）
  let fgImageData: ImageData | null = null;
  if (inputParams.fg_image_path) {
    // 如果 fg_image_path 是文件路径字符串，需要先转换为 File 对象
    // 这里假设 fg_image_path 可能是 URL 或文件路径
    // 实际使用时可能需要根据具体情况调整
    try {
      // 如果是 URL，直接加载
      if (inputParams.fg_image_path.startsWith('http://') || 
          inputParams.fg_image_path.startsWith('https://') ||
          inputParams.fg_image_path.startsWith('data:')) {
        fgImageData = await loadImageFromUrl(inputParams.fg_image_path);
      } else {
        // 如果是文件路径，需要先获取 File 对象
        // 这里暂时抛出错误，提示需要 File 对象
        throw new Error('fg_image_path 需要是 URL 或 data URL，或使用 File 对象');
      }
    } catch (error) {
      console.warn('无法加载前景图像:', error);
      fgImageData = null;
    }
  }
  
  // 生成背景通道
  const bgChannels = generateBackgroundChannels(
    width,
    height,
    colorParams,
    inputParams.ring,
  );
  
  // 如果 ring=true，应用圆环蒙版到 bg_a 和 bg_b
  if (inputParams.ring) {
    const ringMask = generateRingMask(width, height);
    applyRingMask(bgChannels.bg_a, bgChannels.bg_b, ringMask, colorParams.ring_b_value);
  }
  
  // 生成前景通道
  const fgChannels = generateForegroundChannels(
    width,
    height,
    colorParams,
    fgImageData,
    inputParams,
  );
  
  // 合成最终图像
  const finalImageData = compositeChannels(
    width,
    height,
    bgChannels.bg_h,
    bgChannels.bg_s,
    bgChannels.bg_b,
    bgChannels.bg_a,
    fgChannels.fg_h,
    fgChannels.fg_s,
    fgChannels.fg_b,
    fgChannels.fg_a,
  );
  
  return finalImageData;
}

/**
 * 从 URL 加载图像为 ImageData
 * 
 * @param url - 图像 URL
 * @returns Promise<ImageData>
 */
async function loadImageFromUrl(url: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 允许跨域
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建 canvas 上下文'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(imageData);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('处理图像时出错'));
      }
    };
    
    img.onerror = () => {
      reject(new Error('图像加载失败'));
    };
    
    img.src = url;
  });
}
