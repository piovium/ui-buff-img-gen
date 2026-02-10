import type { ColorParams, InputParams } from '../types';
import { extractAlphaChannelAdvanced } from '../utils/image';
import { clamp, lerp } from '../utils/math';
import { applyGaussianBlurToChannel } from '../utils/blur';

/**
 * 前景 H 通道函数（垂直线性渐变）
 * 
 * @param yPercent - Y 坐标百分比（0-1），0 为顶部，1 为底部
 * @param topValue - 顶部 H 值（0-255）
 * @param bottomValue - 底部 H 值（0-255）
 * @returns H 值（0-255）
 */
export function fg_h_channel_function(
  yPercent: number,
  topValue: number,
  bottomValue: number,
): number {
  return Math.round(lerp(topValue, bottomValue, yPercent));
}

/**
 * 前景 S 通道函数（对角线线性渐变）
 * 
 * @param diagonalPercent - 对角线距离百分比（0-1），0 为右上角，1 为左下角
 * @param toprightValue - 右上角 S 值（0-255）
 * @param bottomleftValue - 左下角 S 值（0-255）
 * @returns S 值（0-255）
 */
export function fg_s_channel_function(
  diagonalPercent: number,
  toprightValue: number,
  bottomleftValue: number,
): number {
  return Math.round(lerp(toprightValue, bottomleftValue, diagonalPercent));
}

/**
 * 前景 B 通道函数
 * 
 * @param distancePercent - 距离百分比（0-1）
 * @param startValue - 0% 处的值（0-255）
 * @returns B 值（0-255）
 */
export function fg_b_channel_function(
  distancePercent: number,
  startValue: number,
): number {
  const percent = distancePercent * 100; // 转换为百分比
  // 抛物线（0%为顶点开口向下，0%处的值接受输入）
  const a = - 20 / 10000;
  const x = percent;
  const value = a * x * x + startValue;
  return Math.round(clamp(value, 0, 255));
}

/**
 * 生成前景通道数据
 * 
 * @param width - 图像宽度
 * @param height - 图像高度
 * @param colorParams - 颜色参数
 * @param fgImageData - 前景图像数据（可选）
 * @param inputParams - 输入参数（包含前景图像的位置、缩放、反色、羽化等选项）
 * @returns 包含 fg_h, fg_s, fg_b, fg_a 四个通道的对象
 */
export function generateForegroundChannels(
  width: number,
  height: number,
  colorParams: ColorParams,
  fgImageData: ImageData | null,
  inputParams?: Partial<InputParams>,
): {
  fg_h: Uint8Array;
  fg_s: Uint8Array;
  fg_b: Uint8Array;
  fg_a: Uint8Array;
} {
  const totalPixels = width * height;
  const fg_h = new Uint8Array(totalPixels);
  const fg_s = new Uint8Array(totalPixels);
  const fg_b = new Uint8Array(totalPixels);
  const fg_a = new Uint8Array(totalPixels);
  
  // 提取 alpha 通道（如果图像存在）
  let alphaChannel: Uint8Array | null = null;
  if (fgImageData) {
    // 获取前景图像参数（使用默认值）
    const fgX = inputParams?.fg_x ?? 0;
    const fgY = inputParams?.fg_y ?? 0;
    const fgW = inputParams?.fg_w ?? 100;
    const fgH = inputParams?.fg_h ?? 100;
    
    // 计算缩放后的尺寸（相对于原始图像尺寸的百分比）
    const scaledWidth = Math.round(fgImageData.width * (fgW / 100));
    const scaledHeight = Math.round(fgImageData.height * (fgH / 100));
    
    // 先缩放图像
    let processedImageData: ImageData;
    if (scaledWidth !== fgImageData.width || scaledHeight !== fgImageData.height) {
      processedImageData = resizeImageData(fgImageData, scaledWidth, scaledHeight);
    } else {
      processedImageData = fgImageData;
    }
    
    // 从缩放后的图像中提取 alpha 通道（在填充边缘之前）
    const aFactor = inputParams?.a_factor ?? 0.5;
    let sourceAlphaChannel = extractAlphaChannelAdvanced(processedImageData, aFactor);
    
    // 应用反色（如果需要，在填充边缘之前）
    if (inputParams?.fg_invert_alpha) {
      for (let i = 0; i < sourceAlphaChannel.length; i++) {
        sourceAlphaChannel[i] = 255 - sourceAlphaChannel[i];
      }
    }
    
    // 创建目标尺寸的 alpha 通道数组，初始化为全 0（边缘永远是 0）
    alphaChannel = new Uint8Array(width * height);
    
    // 将源 alpha 通道复制到目标位置
    const sourceWidth = processedImageData.width;
    const sourceHeight = processedImageData.height;
    
    for (let sy = 0; sy < sourceHeight; sy++) {
      for (let sx = 0; sx < sourceWidth; sx++) {
        const targetX = fgX + sx;
        const targetY = fgY + sy;
        
        // 只复制在目标范围内的像素
        if (targetX >= 0 && targetX < width && targetY >= 0 && targetY < height) {
          const sourceIndex = sy * sourceWidth + sx;
          const targetIndex = targetY * width + targetX;
          alphaChannel[targetIndex] = sourceAlphaChannel[sourceIndex];
        }
      }
    }
    
    // 应用羽化（高斯模糊，如果需要）
    if (inputParams?.fg_feather) {
      // 直接对单通道数组进行模糊，无需转换为 ImageData
      alphaChannel = applyGaussianBlurToChannel(alphaChannel, width, height, 2);
    }
  }
  
  // 计算最大对角线距离（用于对角线渐变）
  const maxDiagonal = Math.sqrt(width * width + height * height);
  const centerX = width / 2;
  const centerY = height / 2;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      
      // Y 坐标百分比（用于垂直渐变）
      const yPercent = y / height;
      
      // 对角线距离百分比（用于对角线渐变）
      // 右上角为 (width, 0)，左下角为 (0, height)
      const dx = width - x;
      const dy = y;
      const diagonalDistance = Math.sqrt(dx * dx + dy * dy);
      const diagonalPercent = diagonalDistance / maxDiagonal;

      // 计算径向距离百分比
      const dxr = x - centerX;
      const dyr = y - centerY;
      const distance = Math.sqrt(dxr * dxr + dyr * dyr);
      const radialPercent = distance / maxDiagonal;

      // Alpha 通道：从图像提取，如果没有图像则全 0
      if (alphaChannel) {
        fg_a[index] = alphaChannel[index];
      } else {
        fg_a[index] = 0;
      }
      
      // 生成 H S 通道
      let fg_h_value = fg_h_channel_function(
        yPercent,
        colorParams.fg_h_top,
        colorParams.fg_h_bottom,
      );

      fg_h_value = fg_h_value + (1 - fg_a[index] / 255) * colorParams.fg_h_offset;
      fg_h[index] = Math.round(clamp(fg_h_value < 0 ? 255 + fg_h_value : fg_h_value, 0, 254));

      const fg_s_value = fg_s_channel_function(
        diagonalPercent,
        colorParams.fg_s_topright,
        colorParams.fg_s_bottomleft,
      );
      fg_s[index] = Math.round(clamp(fg_s_value * (2 - fg_a[index] / 255), 0, 255));

      // 生成 B 通道
      const fg_b_value = fg_b_channel_function(
        radialPercent,
        colorParams.fg_b_factor,
      );
      fg_b[index] = Math.round(fg_b_value); // 根据 alpha 调整亮度

    }
  }
  
  return { fg_h, fg_s, fg_b, fg_a };
}

/**
 * 调整 ImageData 到目标尺寸
 * 
 * @param imageData - 原始图像数据
 * @param targetWidth - 目标宽度
 * @param targetHeight - 目标高度
 * @returns 调整后的 ImageData
 */
function resizeImageData(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
): ImageData {
  // 创建临时 canvas 进行缩放
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = imageData.width;
  sourceCanvas.height = imageData.height;
  const sourceCtx = sourceCanvas.getContext('2d', { 
    willReadFrequently: true,
    alpha: true 
  });
  if (!sourceCtx) {
    throw new Error('无法创建 canvas 上下文');
  }
  
  // 先清空 canvas，确保 alpha 通道正确
  sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
  sourceCtx.putImageData(imageData, 0, 0);
  
  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = targetWidth;
  targetCanvas.height = targetHeight;
  const targetCtx = targetCanvas.getContext('2d', { 
    willReadFrequently: true,
    alpha: true 
  });
  if (!targetCtx) {
    throw new Error('无法创建目标 canvas 上下文');
  }
  
  // 先清空目标 canvas，确保 alpha 通道正确
  targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  
  // 使用图像平滑缩放
  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = 'high';
  targetCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
  
  // 返回缩放后的 ImageData
  return targetCtx.getImageData(0, 0, targetWidth, targetHeight);
}
