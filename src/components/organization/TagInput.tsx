import React from 'react';
import { TagPicker, TagPickerProps } from './TagPicker';

export interface TagInputProps extends TagPickerProps {
  readonly helperText?: string;
  readonly errorMessage?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ helperText, errorMessage, ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
      <TagPicker {...props} />
      {errorMessage && (
        <span style={{ fontSize: '11px', color: 'var(--wb-color-destructive)' }}>
          {errorMessage}
        </span>
      )}
      {!errorMessage && helperText && (
        <span style={{ fontSize: '11px', color: 'var(--wb-color-fg-muted)' }}>{helperText}</span>
      )}
    </div>
  );
};
