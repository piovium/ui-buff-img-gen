import type { ColorPreset } from './types';

/**
 * 颜色预设数组
 * 包含所有可用的颜色预设配置
 */
export const COLOR_PRESETS: ColorPreset[] = [
  {
    // normal
    bg_h_value: 30,
    bg_s_start: 200,
    bg_s_end: 160,
    bg_b_start: 210,
    bg_b_end: 130,
    fg_h_top: 42,
    fg_h_bottom: 30,
    fg_s_topright: 98,
    fg_s_bottomleft: 123,
    fg_b_factor: 255,
    fg_h_offset: -12,
    ring_b_value: 127,
  },
  {
    // buff
    bg_h_value: 17,
    bg_s_start: 255,
    bg_s_end: 170,
    bg_b_start: 165,
    bg_b_end: 130,
    fg_h_top: 20,
    fg_h_bottom: 18,
    fg_s_topright: 122,
    fg_s_bottomleft: 132,
    fg_b_factor: 252,
    fg_h_offset: -2,
    ring_b_value: 127,
  },
  {
    // debuff
    bg_h_value: 0,
    bg_s_start: 165,
    bg_s_end: 128,
    bg_b_start: 201,
    bg_b_end: 140,
    fg_h_top: 0,
    fg_h_bottom: 0,
    fg_s_topright: 117,
    fg_s_bottomleft: 130,
    fg_b_factor: 252,
    fg_h_offset: 0,
    ring_b_value: 127,
  },
  {
    // 冰
    bg_h_value: 128,
    bg_s_start: 160,
    bg_s_end: 84,
    bg_b_start: 186,
    bg_b_end: 102,
    fg_h_top: 128,
    fg_h_bottom: 128,
    fg_s_topright: 81,
    fg_s_bottomleft: 82,
    fg_b_factor: 245,
    fg_h_offset: 2,
    ring_b_value: 127,
  },
  {
    // 水
    bg_h_value: 152,
    bg_s_start: 206,
    bg_s_end: 160,
    bg_b_start: 248,
    bg_b_end: 125,
    fg_h_top: 152,
    fg_h_bottom: 142,
    fg_s_topright: 90,
    fg_s_bottomleft: 110,
    fg_b_factor: 255,
    fg_h_offset: 12,
    ring_b_value: 127,
  },
  {
    // 火
    bg_h_value: 9,
    bg_s_start: 196,
    bg_s_end: 115,
    bg_b_start: 216,
    bg_b_end: 127,
    fg_h_top: 16,
    fg_h_bottom: 6,
    fg_s_topright: 148,
    fg_s_bottomleft: 160,
    fg_b_factor: 255,
    fg_h_offset: -4,
    ring_b_value: 127,
  },
  {
    // 雷
    bg_h_value: 192,
    bg_s_start: 156,
    bg_s_end: 125,
    bg_b_start: 237,
    bg_b_end: 140,
    fg_h_top: 200,
    fg_h_bottom: 192,
    fg_s_topright: 84,
    fg_s_bottomleft: 102,
    fg_b_factor: 252,
    fg_h_offset: -12,
    ring_b_value: 127,
  },
  {
    // 风
    bg_h_value: 118,
    bg_s_start: 210,
    bg_s_end: 105,
    bg_b_start: 175,
    bg_b_end: 96,
    fg_h_top: 114,
    fg_h_bottom: 113,
    fg_s_topright: 160,
    fg_s_bottomleft: 163,
    fg_b_factor: 252,
    fg_h_offset: 8,
    ring_b_value: 127,
  },
  {
    // 岩
    bg_h_value: 27,
    bg_s_start: 212,
    bg_s_end: 180,
    bg_b_start: 206,
    bg_b_end: 128,
    fg_h_top: 32,
    fg_h_bottom: 28,
    fg_s_topright: 143,
    fg_s_bottomleft: 148,
    fg_b_factor: 252,
    fg_h_offset: -8,
    ring_b_value: 127,
  },
  {
    // 草
    bg_h_value: 65,
    bg_s_start: 163,
    bg_s_end: 105,
    bg_b_start: 188,
    bg_b_end: 115,
    fg_h_top: 52,
    fg_h_bottom: 50,
    fg_s_topright: 112,
    fg_s_bottomleft: 112,
    fg_b_factor: 232,
    fg_h_offset: 8,
    ring_b_value: 127,
  },
];

/**
 * 输出图像宽度（像素）
 */
export const OUTPUT_WIDTH = 100;

/**
 * 输出图像高度（像素）
 */
export const OUTPUT_HEIGHT = 100;

/**
 * 预设名称数组
 * 与 COLOR_PRESETS 数组索引对应
 */
export const PRESET_NAMES: readonly string[] = [
  'normal',
  'buff',
  'debuff',
  '冰',
  '水',
  '火',
  '雷',
  '风',
  '岩',
  '草',
] as const;
