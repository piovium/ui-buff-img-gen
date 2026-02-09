/**
 * 导出图像
 * 
 * @param canvas - Canvas 元素
 * @param filename - 文件名（不含扩展名）
 * @param format - 图像格式：'png' 或 'webp'
 */
export function exportImage(
  canvas: HTMLCanvasElement,
  filename: string,
  format: 'png' | 'webp' = 'png',
): Promise<void> {
  return new Promise((resolve, reject) => {
    // 确定 MIME 类型
    const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
    
    // 转换为 Blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('无法创建图像 Blob'));
          return;
        }

        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${format}`;
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理 URL
        URL.revokeObjectURL(url);
        
        resolve();
      },
      mimeType,
      format === 'webp' ? 0.9 : undefined, // WebP 质量（0-1）
    );
  });
}

/**
 * 生成带时间戳的文件名
 * 
 * @returns 格式化的文件名：UI_Gcg_Buff_${timestamp}
 */
export function generateFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `UI_Gcg_Buff_${timestamp}`;
}

