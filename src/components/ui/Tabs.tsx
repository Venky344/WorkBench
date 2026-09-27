import React, { createContext, useContext, useState, ReactNode, HTMLAttributes } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs components must be used within a Tabs provider');
  return context;
};

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className = '',
}) => {
  const [internalTab, setInternalTab] = useState(defaultValue || '');
  const activeTab = value !== undefined ? value : internalTab;

  const setActiveTab = (tab: string) => {
    if (value === undefined) setInternalTab(tab);
    onValueChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div
        className={`wb-tabs ${className}`}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`wb-tabs-list ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem',
        backgroundColor: 'var(--wb-color-bg-subtle)',
        border: '1px solid var(--wb-color-border)',
        borderRadius: 'var(--wb-radius-lg)',
        gap: '0.25rem',
        width: 'fit-content',
      }}
    >
      {children}
    </div>
  );
};

export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  disabled = false,
  className = '',
  style,
  ...props
}) => {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={`wb-tabs-trigger ${isActive ? 'wb-tab-active' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.375rem 0.875rem',
        fontSize: 'var(--wb-text-sm)',
        fontWeight: isActive ? 'var(--wb-weight-semibold)' : 'var(--wb-weight-medium)',
        color: isActive ? 'var(--wb-color-primary)' : 'var(--wb-color-fg-muted)',
        backgroundColor: isActive ? 'var(--wb-color-surface)' : 'transparent',
        border: isActive ? '1px solid var(--wb-color-border)' : '1px solid transparent',
        borderRadius: 'var(--wb-radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: isActive ? 'var(--wb-shadow-sm)' : 'none',
        transition: 'var(--wb-transition-colors)',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className = '',
  style,
  ...props
}) => {
  const { activeTab } = useTabs();
  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={`wb-tabs-content ${className}`}
      style={{
        animation: 'wb-fade-in var(--wb-duration-fast) var(--wb-ease-out)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
