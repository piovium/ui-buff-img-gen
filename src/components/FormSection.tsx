import { Component } from 'solid-js';

interface FormSectionProps {
  title: string;
  children?: any;
}

const FormSection: Component<FormSectionProps> = (props) => {
  return (
    <div class="form-section">
      <h3 class="form-section-title">{props.title}</h3>
      <div class="form-section-content">{props.children}</div>
    </div>
  );
};

export default FormSection;

