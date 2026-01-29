import type { Meta, StoryObj } from '@storybook/react'
import { ThemeToggle, ThemeDropdown } from '../app/components/ui/theme-toggle'
import { ThemeProvider } from '../app/components/ui/theme-provider'

const meta: Meta<typeof ThemeToggle> = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
A theme toggle component that allows users to switch between light, dark, and system themes.

## Features
- **System default** — Respects user's OS preference when set to "system"
- **Manual override** — Users can explicitly choose light or dark mode
- **Persistent** — Saves user preference to localStorage

## Usage

The toggle cycles through three states:
1. **System** (monitor icon) — Uses OS preference
2. **Light** (sun icon) — Forces light mode
3. **Dark** (moon icon) — Forces dark mode

Click the button to cycle through themes, or use the dropdown variant for explicit selection.
        `,
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ThemeToggle>

/**
 * The simple toggle button that cycles through themes on click.
 * Icons change to reflect the current theme setting.
 */
export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        Click to cycle: System → Light → Dark → System
      </span>
    </div>
  ),
}

/**
 * The toggle with surrounding context showing how it adapts to themes.
 */
export const WithContext: Story = {
  render: () => (
    <div className="p-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-between min-w-[300px]">
      <span className="font-medium text-zinc-900 dark:text-zinc-100">
        Toggle Theme
      </span>
      <ThemeToggle />
    </div>
  ),
}

/**
 * The dropdown variant with explicit theme selection.
 */
export const Dropdown: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ThemeDropdown />
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        Click to open menu with all theme options
      </span>
    </div>
  ),
}

/**
 * Both variants side by side for comparison.
 */
export const Comparison: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="w-24 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Toggle:
        </span>
        <ThemeToggle />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-24 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Dropdown:
        </span>
        <ThemeDropdown />
      </div>
    </div>
  ),
}

/**
 * In a navbar-like context, similar to how it appears in the app.
 */
export const InNavbar: Story = {
  render: () => (
    <nav className="bg-zinc-800 dark:bg-zinc-950 text-white px-6 py-4 flex justify-between items-center rounded-lg">
      <span className="text-xl font-bold">Spoonjoy</span>
      <div className="flex items-center gap-4">
        <a href="#" className="text-zinc-300 hover:text-white">Recipes</a>
        <a href="#" className="text-zinc-300 hover:text-white">Cookbooks</a>
        <ThemeToggle />
      </div>
    </nav>
  ),
}
