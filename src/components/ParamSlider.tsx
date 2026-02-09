import { Component, createSignal, createEffect } from 'solid-js';

interface ParamSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onUpdate: (value: number) => void;
}

const ParamSlider: Component<ParamSliderProps> = (props) => {
  const [localValue, setLocalValue] = createSignal(props.value);

  // 同步外部值变化
  createEffect(() => {
    setLocalValue(props.value);
  });

  // 更新值
  const handleUpdate = (newValue: number) => {
    // 限制在 min-max 范围内
    const clampedValue = Math.max(
      props.min,
      Math.min(props.max, newValue),
    );
    setLocalValue(clampedValue);
    props.onUpdate(clampedValue);
  };

  // 滑块变化
  const handleSliderChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value);
    handleUpdate(value);
  };

  // 输入框变化
  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value);
    if (!isNaN(value)) {
      handleUpdate(value);
    }
  };

  return (
    <div class="param-slider">
      <label class="param-slider-label">{props.label}</label>
      <div class="param-slider-controls">
        <input
          type="range"
          class="param-slider-range"
          min={props.min}
          max={props.max}
          step={props.step}
          value={localValue()}
          onInput={handleSliderChange}
        />
        <input
          type="number"
          class="param-slider-input"
          min={props.min}
          max={props.max}
          step={props.step}
          value={localValue()}
          onInput={handleInputChange}
        />
      </div>
    </div>
  );
};

export default ParamSlider;

