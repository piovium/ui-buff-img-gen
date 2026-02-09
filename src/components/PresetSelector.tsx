import { Component } from 'solid-js';
import { COLOR_PRESETS, PRESET_NAMES } from '../constants';
import { hsbToRgb } from '../utils/color';

interface PresetSelectorProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const PresetSelector: Component<PresetSelectorProps> = (props) => {
  // 获取预设颜色（RGB）
  const getPresetColor = (index: number): string => {
    const preset = COLOR_PRESETS[index];
    if (!preset) {
      return '#808080'; // 默认灰色
    }

    // 使用 bg_h_value, bg_s_start, bg_b_start 合成颜色
    const [r, g, b] = hsbToRgb(
      preset.bg_h_value,
      preset.bg_s_start,
      225.0,
    );

    // 转换为十六进制颜色
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div class="preset-selector">
      <label class="preset-selector-label">颜色预设</label>
      <div class="preset-selector-group">
        {COLOR_PRESETS.map((_preset, index) => {
          const color = getPresetColor(index);
          const isSelected = props.selectedIndex === index;

          return (
            <label
              class="preset-button-label"
              classList={{ 'preset-button-selected': isSelected }}
              title={PRESET_NAMES[index]}
              onClick={(e) => {
                e.preventDefault();
                props.onSelect(index);
              }}
            >
              <input
                type="radio"
                name="color-preset"
                value={index}
                checked={isSelected}
                class="preset-button-input"
                readOnly
              />
              <div
                class="preset-button-circle"
                style={{ 'background-color': color }}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default PresetSelector;
