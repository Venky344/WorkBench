import React from 'react';
import { PROJECT_ICON_LIST, ProjectIconOption } from './project-theme';

export interface ProjectIconPickerProps {
  readonly value: string;
  readonly onChange: (icon: string) => void;
  readonly id?: string;
}

export const ProjectIconPicker: React.FC<ProjectIconPickerProps> = ({ value, onChange, id }) => {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label="Project Icon"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(2.5rem, 1fr))',
        gap: '0.5rem',
      }}
    >
      {PROJECT_ICON_LIST.map((item: ProjectIconOption) => {
        const isSelected = value === item.id;
        const IconComponent = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`Select icon ${item.label}`}
            title={item.label}
            onClick={() => onChange(item.id)}
            style={{
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--wb-radius-md)',
              backgroundColor: isSelected
                ? 'var(--wb-color-surface-active)'
                : 'var(--wb-color-surface-card)',
              color: isSelected ? 'var(--wb-color-primary)' : 'var(--wb-color-fg-muted)',
              border: isSelected
                ? '1.5px solid var(--wb-color-primary)'
                : '1px solid var(--wb-color-border-subtle)',
              cursor: 'pointer',
              transition: 'var(--wb-transition-colors)',
              padding: 0,
            }}
          >
            <IconComponent size={18} />
          </button>
        );
      })}
    </div>
  );
};
