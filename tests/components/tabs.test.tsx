import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

describe('Design System: Tabs Component', () => {
  it('renders default active tab and switches on click', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content One</TabsContent>
        <TabsContent value="tab2">Content Two</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText('Content One')).toBeInTheDocument();
    expect(screen.queryByText('Content Two')).not.toBeInTheDocument();

    // Click Tab 2
    fireEvent.click(screen.getByText('Tab 2'));
    expect(screen.getByText('Content Two')).toBeInTheDocument();
    expect(screen.queryByText('Content One')).not.toBeInTheDocument();
  });
});
