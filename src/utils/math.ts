/**
 * 将值限制在指定范围内
 * 
 * @param value - 要限制的值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 限制后的值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 线性插值函数
 * 
 * @param start - 起始值
 * @param end - 结束值
 * @param t - 插值参数（0-1），0 返回 start，1 返回 end
 * @returns 插值结果
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

