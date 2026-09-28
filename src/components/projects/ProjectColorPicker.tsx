import React from 'react';
import { PROJECT_COLOR_PALETTE, ProjectColorOption } from './project-theme';

export interface ProjectColorPickerProps {
  readonly value: string;
  readonly onChange: (color: string) => void;
  readonly id?: string;
}

export const ProjectColorPicker: React.FC<ProjectColorPickerProps> = ({ value, onChange, id }) => {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label="Project Color"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'center',
      }}
    >
      {PROJECT_COLOR_PALETTE.map((color: ProjectColorOption) => {
        const isSelected = value === color.id;
        return (
          <button
            key={color.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`Select color ${color.label}`}
            onClick={() => onChange(color.id)}
            style={{
              width: '1.75rem',
              height: '1.75rem',
              borderRadius: 'var(--wb-radius-full)',
              backgroundColor: color.bgToken,
              border: isSelected ? '2px solid var(--wb-color-fg)' : '2px solid transparent',
              outline: isSelected ? '2px solid var(--wb-color-focus)' : 'none',
              outlineOffset: '2px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, outline 0.15s ease',
              transform: isSelected ? 'scale(1.15)' : 'scale(1)',
              padding: 0,
            }}
          />
        );
      })}
    </div>
  );
};
