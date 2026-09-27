import React, { useState } from 'react';
import {
  Logo,
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  Radio,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Avatar,
  Tooltip,
  Dialog,
  DialogFooter,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Separator,
  Skeleton,
  Progress,
  EmptyState,
  LoadingState,
  ErrorState,
} from '@/components/ui';
import { useThemeStore } from '@/stores/theme.store';
import { toast } from '@/stores/toast.store';
import {
  Sun,
  Moon,
  Laptop,
  Plus,
  Trash2,
  Settings,
  Folder,
  Send,
  MoreVertical,
  Search,
  Copy,
} from 'lucide-react';

export const DesignSystemShowcasePage: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useThemeStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputVal, setInputVal] = useState('Production CricAuction Workspace');
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [switchVal, setSwitchVal] = useState(true);
  const [radioVal, setRadioVal] = useState('opt1');
  const [progressVal, setProgressVal] = useState(65);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', paddingBottom: '5rem' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.5rem',
          backgroundColor: 'var(--wb-color-surface)',
          border: '1px solid var(--wb-color-border)',
          borderRadius: 'var(--wb-radius-xl)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Logo size="lg" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 'var(--wb-text-xl)',
                  fontWeight: 'var(--wb-weight-bold)',
                }}
              >
                WorkBench Design System
              </h1>
              <Badge variant="primary" badgeStyle="subtle">
                Phase 2 UI Foundation
              </Badge>
            </div>
            <p
              style={{
                margin: '0.25rem 0 0 0',
                fontSize: 'var(--wb-text-xs)',
                color: 'var(--wb-color-fg-muted)',
              }}
            >
              Interactive component showcase and design token specification.
            </p>
          </div>
        </div>

        {/* Theme Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.25rem',
            backgroundColor: 'var(--wb-color-bg-subtle)',
            borderRadius: 'var(--wb-radius-lg)',
            border: '1px solid var(--wb-color-border)',
          }}
        >
          <Button
            variant={theme === 'dark' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('dark')}
            leftIcon={<Moon size={14} />}
          >
            Dark
          </Button>
          <Button
            variant={theme === 'light' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('light')}
            leftIcon={<Sun size={14} />}
          >
            Light
          </Button>
          <Button
            variant={theme === 'system' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('system')}
            leftIcon={<Laptop size={14} />}
          >
            System ({resolvedTheme})
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">UI Components</TabsTrigger>
          <TabsTrigger value="forms">Form Controls</TabsTrigger>
          <TabsTrigger value="feedback">Feedback & Overlays</TabsTrigger>
          <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
        </TabsList>

        {/* 1. COMPONENTS TAB */}
        <TabsContent
          value="components"
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          {/* Brand & Logos */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Logo Primitives</CardTitle>
              <CardDescription>
                Official WorkBench asset integration with responsive sizes
              </CardDescription>
            </CardHeader>
            <CardContent
              style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}
            >
              <Logo size="sm" />
              <Logo size="md" />
              <Logo size="lg" />
              <Logo size={48} />
            </CardContent>
          </Card>

          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Semantic button variants, sizes, and states</CardDescription>
            </CardHeader>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}
              >
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link Style</Button>
              </div>

              <Separator />

              <div
                style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}
              >
                <Button size="sm" leftIcon={<Plus size={14} />}>
                  Small Button
                </Button>
                <Button size="md" leftIcon={<Folder size={16} />}>
                  Medium Button
                </Button>
                <Button size="lg" rightIcon={<Send size={18} />}>
                  Large Button
                </Button>
                <Button size="icon" variant="secondary" aria-label="Settings">
                  <Settings size={16} />
                </Button>
                <Button isLoading variant="primary">
                  Saving...
                </Button>
                <Button disabled variant="primary">
                  Disabled
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Badges & Avatars */}
          <Card>
            <CardHeader>
              <CardTitle>Badges & Avatars</CardTitle>
              <CardDescription>Status indicators and entity avatar representations</CardDescription>
            </CardHeader>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}
              >
                <Badge variant="neutral">Neutral</Badge>
                <Badge variant="primary" dot>
                  Primary Active
                </Badge>
                <Badge variant="success" dot>
                  Synchronized
                </Badge>
                <Badge variant="warning" dot>
                  Needs Review
                </Badge>
                <Badge variant="destructive" dot>
                  Failed
                </Badge>
                <Badge variant="info">Info Badge</Badge>
                <Badge variant="primary" badgeStyle="solid">
                  Solid Badge
                </Badge>
                <Badge variant="neutral" badgeStyle="outline">
                  Outline Badge
                </Badge>
              </div>

              <Separator />

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Avatar name="Venky Rao" size="sm" type="user" />
                <Avatar name="Venky Rao" size="md" type="user" />
                <Avatar name="CricAuction Project" size="lg" type="project" color="#0369a1" />
                <Avatar name="Claude AI" size="xl" type="source" color="#6366f1" />
              </div>
            </CardContent>
          </Card>

          {/* Cards & Surfaces */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem',
            }}
          >
            <Card variant="default">
              <CardHeader>
                <CardTitle>Standard Surface Card</CardTitle>
                <CardDescription>Default surface for content blocks</CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ fontSize: 'var(--wb-text-sm)', color: 'var(--wb-color-fg-muted)' }}>
                  WorkBench cards provide clean information density with clear visual hierarchy.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="ghost">
                  Dismiss
                </Button>
                <Button size="sm" variant="primary">
                  Action
                </Button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Surface Card</CardTitle>
                <CardDescription>Higher elevation for popovers and key cards</CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ fontSize: 'var(--wb-text-sm)', color: 'var(--wb-color-fg-muted)' }}>
                  Enhanced shadow depth for floating controls and prominent workspace sections.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="secondary">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* 2. FORMS TAB */}
        <TabsContent
          value="forms"
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Form Controls & Inputs</CardTitle>
              <CardDescription>
                Accessible inputs with validation states, labels, and helper text
              </CardDescription>
            </CardHeader>
            <CardContent
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              <Input
                label="Workspace Project Name"
                required
                leftIcon={<Search size={14} />}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                helperText="Permanent identifier within this workspace"
              />

              <Input
                label="Input With Error State"
                value="Invalid@URL#Format"
                errorMessage="Please provide a valid accessible URL"
              />

              <Input
                label="Disabled Input"
                disabled
                value="Read-only system value"
                helperText="This setting cannot be changed"
              />

              <Select
                label="Default Ingestion Provider"
                options={[
                  { label: 'ChatGPT (OpenAI)', value: 'chatgpt' },
                  { label: 'Claude (Anthropic)', value: 'claude' },
                  { label: 'Gemini (Google)', value: 'gemini' },
                  { label: 'Perplexity', value: 'perplexity' },
                ]}
                helperText="Determines AST normalization engine"
              />

              <div style={{ gridColumn: '1 / -1' }}>
                <Textarea
                  label="Project Context / Summary"
                  placeholder="Record key architectural decisions, goals, and constraints..."
                  rows={3}
                  helperText="Markdown formatted summary"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <span
                  style={{
                    fontSize: 'var(--wb-text-xs)',
                    fontWeight: 'var(--wb-weight-medium)',
                    color: 'var(--wb-color-fg)',
                  }}
                >
                  Selection Controls
                </span>
                <Checkbox
                  label="Enable Local-First Fast Search Indexing"
                  checked={checkboxVal}
                  onChange={(e) => setCheckboxVal(e.target.checked)}
                  helperText="Maintains inverted index in memory"
                />
                <Checkbox
                  label="Indeterminate State Option"
                  indeterminate
                  helperText="Partially selected child items"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <span
                  style={{
                    fontSize: 'var(--wb-text-xs)',
                    fontWeight: 'var(--wb-weight-medium)',
                    color: 'var(--wb-color-fg)',
                  }}
                >
                  Switches & Toggles
                </span>
                <Switch
                  label="Auto-Route Unassigned Imports to Inbox"
                  description="Prevents project clutter"
                  checked={switchVal}
                  onChange={setSwitchVal}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <span
                  style={{
                    fontSize: 'var(--wb-text-xs)',
                    fontWeight: 'var(--wb-weight-medium)',
                    color: 'var(--wb-color-fg)',
                  }}
                >
                  Radio Group
                </span>
                <Radio
                  label="Option Alpha — Full Provenance"
                  name="demo-radio"
                  checked={radioVal === 'opt1'}
                  onChange={() => setRadioVal('opt1')}
                />
                <Radio
                  label="Option Beta — Minimal Metadata"
                  name="demo-radio"
                  checked={radioVal === 'opt2'}
                  onChange={() => setRadioVal('opt2')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. FEEDBACK & OVERLAYS TAB */}
        <TabsContent
          value="feedback"
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          {/* Dialogs, Toasts, Dropdowns */}
          <Card>
            <CardHeader>
              <CardTitle>Interactive Overlays & Feedback</CardTitle>
              <CardDescription>
                Accessible modals, menus, tooltips, and toast notifications
              </CardDescription>
            </CardHeader>
            <CardContent
              style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}
            >
              <Button onClick={() => setIsDialogOpen(true)} variant="primary">
                Open Demo Dialog
              </Button>

              <DropdownMenu
                trigger={
                  <Button variant="secondary" rightIcon={<MoreVertical size={14} />}>
                    Actions Menu
                  </Button>
                }
              >
                <DropdownMenuItem
                  icon={<Plus size={14} />}
                  onClick={() => toast.info('New item created')}
                >
                  New Conversation
                </DropdownMenuItem>
                <DropdownMenuItem
                  icon={<Copy size={14} />}
                  onClick={() => toast.success('Snippet copied')}
                >
                  Copy Provenance
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  icon={<Trash2 size={14} />}
                  destructive
                  onClick={() => toast.error('Item archived')}
                >
                  Archive Item
                </DropdownMenuItem>
              </DropdownMenu>

              <Tooltip content="Fast keyboard shortcut: Ctrl+K" placement="top">
                <Button variant="outline">Hover for Tooltip</Button>
              </Tooltip>

              <Button
                variant="secondary"
                onClick={() =>
                  toast.success('Workspace indexed successfully in 12ms', 'Search Index Updated')
                }
              >
                Trigger Success Toast
              </Button>
              <Button
                variant="destructive"
                onClick={() => toast.error('Unable to parse malformed JSON file', 'Import Error')}
              >
                Trigger Error Toast
              </Button>
            </CardContent>
          </Card>

          {/* Progress & Skeletons */}
          <Card>
            <CardHeader>
              <CardTitle>Progress & Loading Skeletons</CardTitle>
              <CardDescription>Subtle visual states for asynchronous operations</CardDescription>
            </CardHeader>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Progress value={progressVal} showLabel variant="primary" />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setProgressVal(Math.max(0, progressVal - 15))}
                  >
                    -15%
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setProgressVal(Math.min(100, progressVal + 15))}
                  >
                    +15%
                  </Button>
                </div>
              </div>

              <Separator label="Loading Skeletons" />

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Skeleton circle width={40} height={40} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <Skeleton height={16} width="60%" />
                  <Skeleton height={12} width="90%" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Structural States */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem',
            }}
          >
            <EmptyState
              title="No Conversations in Inbox"
              description="Captured chats, bookmarks, and files will appear here until assigned to a project."
              actionLabel="Quick Capture"
              onAction={() => toast.info('Quick Capture Modal Triggered')}
            />

            <LoadingState message="Indexing workspace entities..." />

            <ErrorState
              title="Parser Malfunction"
              message="The selected external payload could not be parsed."
              onRetry={() => toast.info('Retrying import...')}
            />
          </div>
        </TabsContent>

        {/* 4. DESIGN TOKENS TAB */}
        <TabsContent
          value="tokens"
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Semantic Color Tokens</CardTitle>
              <CardDescription>
                Theme-aware CSS variables defined in :root and [data-theme]
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {[
                  { name: '--wb-color-bg', bg: 'var(--wb-color-bg)' },
                  { name: '--wb-color-surface', bg: 'var(--wb-color-surface)' },
                  { name: '--wb-color-surface-elevated', bg: 'var(--wb-color-surface-elevated)' },
                  { name: '--wb-color-border', bg: 'var(--wb-color-border)' },
                  { name: '--wb-color-primary', bg: 'var(--wb-color-primary)' },
                  { name: '--wb-color-secondary', bg: 'var(--wb-color-secondary)' },
                  { name: '--wb-color-accent', bg: 'var(--wb-color-accent)' },
                  { name: '--wb-color-success', bg: 'var(--wb-color-success)' },
                  { name: '--wb-color-warning', bg: 'var(--wb-color-warning)' },
                  { name: '--wb-color-destructive', bg: 'var(--wb-color-destructive)' },
                ].map((item) => (
                  <div
                    key={item.name}
                    style={{
                      border: '1px solid var(--wb-color-border)',
                      borderRadius: 'var(--wb-radius-md)',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ height: '40px', backgroundColor: item.bg }} />
                    <div
                      style={{
                        padding: '0.5rem',
                        fontSize: 'var(--wb-text-xs)',
                        fontFamily: 'var(--wb-font-mono)',
                      }}
                    >
                      {item.name}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography System</CardTitle>
              <CardDescription>Semantic typography scale</CardDescription>
            </CardHeader>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="wb-display">Display Title (36px Bold)</div>
              <div className="wb-h1">Heading 1 (30px Bold)</div>
              <div className="wb-h2">Heading 2 (24px Semibold)</div>
              <div className="wb-h3">Heading 3 (20px Semibold)</div>
              <div className="wb-body-lg">Body Large (18px) — For intro paragraphs</div>
              <div className="wb-body">Body Standard (16px) — Primary interface body text</div>
              <div className="wb-body-sm">Body Small (14px) — Secondary metadata and items</div>
              <div className="wb-caption">Caption (12px) — Timestamps and badges</div>
              <div className="wb-code">Monospace Code — const brain = new WorkBenchBrain();</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Demo Modal Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Create New Project Container"
        description="Projects are the primary organizational unit in WorkBench."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Project Name" defaultValue="CricAuction Integration" required />
          <Textarea
            label="Project Description"
            defaultValue="WebSocket protocols and backend architecture notes"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsDialogOpen(false);
                toast.success('Project created');
              }}
            >
              Create Project
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
};
