import { applyGaussianBlurToChannel } from '../utils/blur';

/**
 * 生成圆环蒙版
 * 
 * @param width - 图像宽度
 * @param height - 图像高度
 * @returns Uint8Array - 蒙版数据，每个值范围 0-255
 */
export function generateRingMask(width: number, height: number): Uint8Array {
  // 创建高分辨率临时 Canvas（scale=2）
  const scale = 2;
  const tempWidth = width * scale;
  const tempHeight = height * scale;
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = tempWidth;
  tempCanvas.height = tempHeight;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) {
    throw new Error('无法创建 canvas 上下文');
  }
  
  const centerX = tempWidth / 2;
  const centerY = tempHeight / 2;
  const radius = Math.min(tempWidth, tempHeight) / 2;
  
  // 绘制半径为 82% 的圆（填充 255）
  tempCtx.fillStyle = '#ffffff';
  tempCtx.beginPath();
  tempCtx.arc(centerX, centerY, radius * 0.82, 0, Math.PI * 2);
  tempCtx.fill();
  
  // 绘制 8 边形
  // 按顺时针顺序排列所有 8 个点
  const octagonPoints = [
    [0.18, 0.18], // 顶部（通过点4对称得到）
    [0.50, 0.12], // 右上（点4的对称）
    [0.82, 0.18], // 右（点3）
    [0.88, 0.50], // 右下（点2）
    [0.82, 0.82], // 底部（点2的对称）
    [0.50, 0.88], // 左下（点2的对称）
    [0.18, 0.82], // 左（点1）
    [0.12, 0.50], // 左上（点4）
  ];
  
  tempCtx.beginPath();
  for (let i = 0; i < octagonPoints.length; i++) {
    const [xPercent, yPercent] = octagonPoints[i];
    const x = xPercent * tempWidth;
    const y = yPercent * tempHeight;
    if (i === 0) {
      tempCtx.moveTo(x, y);
    } else {
      tempCtx.lineTo(x, y);
    }
  }
  tempCtx.closePath();
  tempCtx.fill();
  
  // 绘制半径为 71% 的圆（填充 0，挖空中心）
  tempCtx.globalCompositeOperation = 'destination-out';
  tempCtx.beginPath();
  tempCtx.arc(centerX, centerY, radius * 0.71, 0, Math.PI * 2);
  tempCtx.fill();
  tempCtx.globalCompositeOperation = 'source-over';
  
  // 保存原始 mask（提取单通道）
  const originalImageData = tempCtx.getImageData(0, 0, tempWidth, tempHeight);
  const originalMask = new Uint8Array(tempWidth * tempHeight);
  for (let i = 0; i < originalMask.length; i++) {
    originalMask[i] = originalImageData.data[i * 4]; // 提取 R 通道（灰度值）
  }
  
  // 应用高斯模糊（直接对单通道进行模糊）
  const blurredMask = applyGaussianBlurToChannel(originalMask, tempWidth, tempHeight, 3);
  
  // 使用原始 mask 裁切，只保留向内羽化的部分
  // 即：如果原始 mask 为 0，则结果也为 0；否则使用模糊后的值
  const finalMask = new Uint8Array(tempWidth * tempHeight);
  for (let i = 0; i < originalMask.length; i++) {
    const originalValue = originalMask[i];
    const blurredValue = blurredMask[i];
    
    // 如果原始 mask 为 0，则结果也为 0；否则使用模糊后的值
    finalMask[i] = originalValue === 0 ? 0 : blurredValue;
  }
  
  // 将单通道 mask 转换为 ImageData 用于后续缩放
  const finalImageData = new ImageData(tempWidth, tempHeight);
  for (let i = 0; i < finalMask.length; i++) {
    const value = finalMask[i];
    const idx = i * 4;
    finalImageData.data[idx] = value;     // R
    finalImageData.data[idx + 1] = value; // G
    finalImageData.data[idx + 2] = value; // B
    finalImageData.data[idx + 3] = 255;   // A
  }
  
  // 缩放回原始尺寸
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = width;
  finalCanvas.height = height;
  const finalCtx = finalCanvas.getContext('2d');
  if (!finalCtx) {
    throw new Error('无法创建最终 canvas 上下文');
  }
  
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCtx.drawImage(
    createCanvasFromImageData(finalImageData),
    0,
    0,
    width,
    height,
  );
  
  // 提取最终的 alpha 通道（或使用 R 通道，因为这是灰度图）
  const finalResizedImageData = finalCtx.getImageData(0, 0, width, height);
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < mask.length; i++) {
    mask[i] = finalResizedImageData.data[i * 4]; // 提取 R 通道
  }
  
  return mask;
}


/**
 * 从 ImageData 创建 Canvas
 * 
 * @param imageData - 图像数据
 * @returns Canvas 元素
 */
function createCanvasFromImageData(imageData: ImageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建 canvas 上下文');
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

