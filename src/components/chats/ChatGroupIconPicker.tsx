import React from 'react';
import { CHAT_GROUP_ICON_LIST } from './chat-theme';

export interface ChatGroupIconPickerProps {
  readonly id?: string;
  readonly value?: string;
  readonly onChange: (iconId: string) => void;
}

export const ChatGroupIconPicker: React.FC<ChatGroupIconPickerProps> = ({
  id,
  value = 'message-square',
  onChange,
}) => {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label="Chat group icon selection"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(2.25rem, 1fr))',
        gap: '0.375rem',
        maxHeight: '130px',
        overflowY: 'auto',
        padding: '0.25rem',
        border: '1px solid var(--wb-color-border-subtle)',
        borderRadius: 'var(--wb-radius-md)',
        backgroundColor: 'var(--wb-color-surface)',
      }}
    >
      {CHAT_GROUP_ICON_LIST.map((item) => {
        const isSelected = value === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={item.label}
            title={item.label}
            onClick={() => onChange(item.id)}
            style={{
              height: '2.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--wb-radius-md)',
              border: isSelected ? '2px solid var(--wb-color-primary)' : '1px solid transparent',
              backgroundColor: isSelected
                ? 'var(--wb-color-primary-subtle)'
                : 'var(--wb-color-surface-hover)',
              color: isSelected ? 'var(--wb-color-primary)' : 'var(--wb-color-fg)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
};
