import React from 'react';
import { CHAT_GROUP_COLOR_PALETTE } from './chat-theme';

export interface ChatGroupColorPickerProps {
  readonly id?: string;
  readonly value?: string;
  readonly onChange: (colorId: string) => void;
}

export const ChatGroupColorPicker: React.FC<ChatGroupColorPickerProps> = ({
  id,
  value = 'blue',
  onChange,
}) => {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label="Chat group color selection"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}
    >
      {CHAT_GROUP_COLOR_PALETTE.map((color) => {
        const isSelected = value === color.id;
        return (
          <button
            key={color.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={color.label}
            onClick={() => onChange(color.id)}
            style={{
              width: '1.75rem',
              height: '1.75rem',
              borderRadius: 'var(--wb-radius-full)',
              backgroundColor: color.bgToken,
              border: isSelected ? '2px solid var(--wb-color-fg)' : '2px solid transparent',
              outline: isSelected ? '2px solid var(--wb-color-primary)' : 'none',
              outlineOffset: '2px',
              cursor: 'pointer',
              transition: 'transform var(--wb-duration-fast) var(--wb-ease-default)',
              transform: isSelected ? 'scale(1.15)' : 'scale(1)',
              padding: 0,
            }}
          />
        );
      })}
    </div>
  );
};
