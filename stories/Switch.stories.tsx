import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import { Switch, SwitchField, SwitchGroup } from '../app/components/ui/switch'
import { Label, Description } from '../app/components/ui/fieldset'

/**
 * # Switch
 *
 * The toggle. The flip-flopper. The "on or off" that doesn't need three states
 * to feel important.
 *
 * Switches are the cooler cousin of checkboxes. Same job, better looks.
 * Where a checkbox screams "1990s tax form," a switch whispers "premium
 * mobile app." It's the difference between a light switch and a... well,
 * also a light switch, but one designed by someone who cares about aesthetics.
 *
 * ## The Philosophy of Switches
 *
 * A switch represents an immediate action. Unlike a checkbox that often waits
 * for a "Submit" button, a switch says "this is happening NOW." It's the
 * instant gratification of form elements. Flip it, and something changes.
 * No patience required.
 *
 * ## Features
 *
 * - **21 color variants** - Express your toggle's personality
 * - **Immediate feedback** - Smooth sliding animation included
 * - **SwitchField** - Switch + Label, properly associated
 * - **SwitchGroup** - Multiple switches, organized together
 * - **Accessible by default** - Screen readers understand flipping too
 * - **Keyboard friendly** - Space to toggle, just like checkboxes
 *
 * ## When to use Switch vs Checkbox
 *
 * - **Switch**: Settings that take effect immediately ("Enable dark mode")
 * - **Checkbox**: Options that need to be submitted ("I agree to terms")
 *
 * Though honestly, they're often interchangeable. Use whichever looks better.
 * We won't tell.
 */
const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The toggle switch. Built on HeadlessUI with 21 color variants, smooth animations, and automatic accessibility.

Perfect for settings pages, feature flags, and anywhere you need an on/off that looks like it belongs in this decade.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: [
        'dark/zinc', 'dark/white', 'white', 'dark', 'zinc',
        'red', 'orange', 'amber', 'yellow', 'lime', 'green',
        'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo',
        'violet', 'purple', 'fuchsia', 'pink', 'rose',
      ],
      description: 'The color when toggled on. Because boring gray isn\'t always the answer.',
    },
    checked: {
      control: 'boolean',
      description: 'Whether the switch is on. Controlled mode.',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Initial on/off state for uncontrolled usage.',
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents toggling. The switch is on vacation.',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// BASIC STATES
// =============================================================================

/**
 * The off state. Waiting. Ready. Full of potential energy.
 * One click away from becoming something.
 */
export const Off: Story = {
  args: {
    defaultChecked: false,
  },
}

/**
 * The on state. Activated. Engaged. Living its best life.
 * Notice the smooth slide animation when toggling.
 */
export const On: Story = {
  args: {
    defaultChecked: true,
  },
}

// =============================================================================
// DISABLED STATES
// =============================================================================

/**
 * Disabled and off. It's taking a break.
 * Maybe it'll be back later. Maybe not.
 */
export const DisabledOff: Story = {
  args: {
    disabled: true,
    defaultChecked: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled switches get 50% opacity. They\'re visible but unresponsive, like that friend who leaves you on read.',
      },
    },
  },
}

/**
 * Disabled and on. Someone flipped this and walked away.
 * You're just here to look at it.
 */
export const DisabledOn: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'A disabled switch that\'s on. The decision has been made. It\'s not up for debate.',
      },
    },
  },
}

// =============================================================================
// COLOR VARIANTS
// =============================================================================

/**
 * ## The Rainbow of Toggles
 *
 * 21 colors to match your mood, brand, or general vibe.
 * Each color is carefully tuned to look good both on and off.
 * (Mostly on, let's be honest. The off state is just gray.)
 */
export const AllColors: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      {[
        'dark/zinc', 'dark/white', 'white', 'dark', 'zinc',
        'red', 'orange', 'amber', 'yellow', 'lime', 'green',
        'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo',
        'violet', 'purple', 'fuchsia', 'pink', 'rose',
      ].map((color) => (
        <div key={color} className="flex items-center gap-2">
          <Switch color={color as any} defaultChecked />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">{color}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All 21 colors, toggled on and ready for action. The off state is always gray because neutrality is calming.',
      },
    },
  },
}

/**
 * The neutral palette. Professional and understated.
 * For enterprise apps and people who wear suits to Zoom calls.
 */
export const NeutralColors: Story = {
  render: () => (
    <div className="flex gap-4">
      {['dark/zinc', 'dark/white', 'white', 'dark', 'zinc'].map((color) => (
        <div key={color} className="flex flex-col items-center gap-1">
          <Switch color={color as any} defaultChecked />
          <span className="text-xs text-zinc-500">{color}</span>
        </div>
      ))}
    </div>
  ),
}

/**
 * Warm colors. For settings that feel... warm? Dangerous?
 * Use red for "do not disturb" and you'll feel like a VIP.
 */
export const WarmColors: Story = {
  render: () => (
    <div className="flex gap-4">
      {['red', 'orange', 'amber', 'yellow'].map((color) => (
        <div key={color} className="flex flex-col items-center gap-1">
          <Switch color={color as any} defaultChecked />
          <span className="text-xs text-zinc-500">{color}</span>
        </div>
      ))}
    </div>
  ),
}

/**
 * Cool colors. Calm and collected.
 * Perfect for "enable" settings that should feel safe.
 */
export const CoolColors: Story = {
  render: () => (
    <div className="flex gap-4">
      {['lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo'].map((color) => (
        <div key={color} className="flex flex-col items-center gap-1">
          <Switch color={color as any} defaultChecked />
          <span className="text-xs text-zinc-500">{color}</span>
        </div>
      ))}
    </div>
  ),
}

/**
 * The fun colors. For apps with personality.
 * Your settings page doesn't have to be boring.
 */
export const VibrantColors: Story = {
  render: () => (
    <div className="flex gap-4">
      {['violet', 'purple', 'fuchsia', 'pink', 'rose'].map((color) => (
        <div key={color} className="flex flex-col items-center gap-1">
          <Switch color={color as any} defaultChecked />
          <span className="text-xs text-zinc-500">{color}</span>
        </div>
      ))}
    </div>
  ),
}

// =============================================================================
// WITH LABELS
// =============================================================================

/**
 * Switch with a label. The dynamic duo.
 *
 * Use `SwitchField` to properly associate a label with your switch.
 * The label goes on the left, the switch on the right. It's the law.
 */
export const WithLabel: Story = {
  render: () => (
    <SwitchField>
      <Label>Enable notifications</Label>
      <Switch defaultChecked />
    </SwitchField>
  ),
  parameters: {
    docs: {
      description: {
        story: 'SwitchField creates a grid layout with the label on the left and switch on the right. Click anywhere to toggle!',
      },
    },
  },
}

/**
 * Switch with label and description.
 * For when "Enable notifications" isn't descriptive enough.
 */
export const WithLabelAndDescription: Story = {
  render: () => (
    <SwitchField>
      <Label>Email notifications</Label>
      <Description>Receive email updates about new recipes and comments.</Description>
      <Switch defaultChecked color="blue" />
    </SwitchField>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Add a Description for context. The label automatically becomes bold when a description is present.',
      },
    },
  },
}

/**
 * Multiple switches with labels. A common settings pattern.
 */
export const MultipleWithLabels: Story = {
  render: () => (
    <SwitchGroup>
      <SwitchField>
        <Label>Dark mode</Label>
        <Switch color="zinc" defaultChecked />
      </SwitchField>
      <SwitchField>
        <Label>Compact view</Label>
        <Switch color="zinc" />
      </SwitchField>
      <SwitchField>
        <Label>Auto-save</Label>
        <Description>Automatically save drafts every minute.</Description>
        <Switch color="green" defaultChecked />
      </SwitchField>
    </SwitchGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use SwitchGroup to space multiple switches consistently. Mix and match descriptions as needed.',
      },
    },
  },
}

/**
 * Disabled switches with labels. The settings you can't change.
 * Probably controlled by your IT department.
 */
export const DisabledWithLabel: Story = {
  render: () => (
    <SwitchGroup>
      <SwitchField>
        <Label>Mandatory security feature</Label>
        <Description>This setting is controlled by your organization.</Description>
        <Switch disabled defaultChecked color="blue" />
      </SwitchField>
      <SwitchField>
        <Label>Premium feature</Label>
        <Description>Upgrade your plan to enable this feature.</Description>
        <Switch disabled />
      </SwitchField>
    </SwitchGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled switches communicate "you can\'t change this" while still showing the current state.',
      },
    },
  },
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * A settings panel. Where switches shine.
 * This is their natural habitat.
 */
export const SettingsPanel: Story = {
  render: () => (
    <div className="w-96 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
          Notifications
        </h3>
        <SwitchGroup>
          <SwitchField>
            <Label>Push notifications</Label>
            <Description>Get notified on your device.</Description>
            <Switch color="indigo" defaultChecked />
          </SwitchField>
          <SwitchField>
            <Label>Email digest</Label>
            <Description>Weekly summary of activity.</Description>
            <Switch color="indigo" defaultChecked />
          </SwitchField>
          <SwitchField>
            <Label>Marketing emails</Label>
            <Description>Tips, updates, and special offers.</Description>
            <Switch color="indigo" />
          </SwitchField>
        </SwitchGroup>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
          Appearance
        </h3>
        <SwitchGroup>
          <SwitchField>
            <Label>Dark mode</Label>
            <Description>Easier on the eyes at night.</Description>
            <Switch color="zinc" defaultChecked />
          </SwitchField>
          <SwitchField>
            <Label>Reduce motion</Label>
            <Description>Minimize animations throughout the app.</Description>
            <Switch color="zinc" />
          </SwitchField>
        </SwitchGroup>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
          Privacy
        </h3>
        <SwitchGroup>
          <SwitchField>
            <Label>Public profile</Label>
            <Description>Let others see your recipes and activity.</Description>
            <Switch color="emerald" defaultChecked />
          </SwitchField>
          <SwitchField>
            <Label>Show online status</Label>
            <Description>Let others see when you're active.</Description>
            <Switch color="emerald" />
          </SwitchField>
        </SwitchGroup>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A realistic settings panel. Switches grouped by category, each with descriptions explaining what they do.',
      },
    },
  },
}

/**
 * Feature toggles. For when you're feeling indecisive about your app's features.
 * Or doing A/B testing. Same thing, really.
 */
export const FeatureToggles: Story = {
  render: function FeatureTogglesExample() {
    const [features, setFeatures] = useState({
      newEditor: true,
      betaFeatures: false,
      experimentalUI: false,
      debugMode: false,
    })

    const toggleFeature = (key: keyof typeof features) => {
      setFeatures((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    return (
      <div className="w-80">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
          Developer Options
        </h3>
        <SwitchGroup>
          <SwitchField>
            <Label>New recipe editor</Label>
            <Description>Try the redesigned editing experience.</Description>
            <Switch
              color="blue"
              checked={features.newEditor}
              onChange={() => toggleFeature('newEditor')}
            />
          </SwitchField>
          <SwitchField>
            <Label>Beta features</Label>
            <Description>Access features before everyone else.</Description>
            <Switch
              color="violet"
              checked={features.betaFeatures}
              onChange={() => toggleFeature('betaFeatures')}
            />
          </SwitchField>
          <SwitchField>
            <Label>Experimental UI</Label>
            <Description>Warning: Things might break.</Description>
            <Switch
              color="orange"
              checked={features.experimentalUI}
              onChange={() => toggleFeature('experimentalUI')}
            />
          </SwitchField>
          <SwitchField>
            <Label>Debug mode</Label>
            <Description>Show detailed error information.</Description>
            <Switch
              color="red"
              checked={features.debugMode}
              onChange={() => toggleFeature('debugMode')}
            />
          </SwitchField>
        </SwitchGroup>
        <div className="mt-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono text-zinc-600 dark:text-zinc-400">
          {JSON.stringify(features, null, 2)}
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Feature flags in action. Each toggle immediately updates state. The JSON below shows the current configuration.',
      },
    },
  },
}

/**
 * Do not disturb mode. The classic mobile pattern.
 * One switch to rule them all, then individual overrides.
 */
export const DoNotDisturbPattern: Story = {
  render: function DNDExample() {
    const [dnd, setDnd] = useState(false)
    const [allowCalls, setAllowCalls] = useState(true)
    const [allowAlarms, setAllowAlarms] = useState(true)

    return (
      <div className="w-80">
        <div className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-4">
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white">Do Not Disturb</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {dnd ? 'Notifications silenced' : 'Notifications enabled'}
            </p>
          </div>
          <Switch color="red" checked={dnd} onChange={setDnd} />
        </div>

        <div className={dnd ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
            Exceptions
          </p>
          <SwitchGroup>
            <SwitchField>
              <Label>Allow calls</Label>
              <Description>Calls will still ring through.</Description>
              <Switch
                color="green"
                checked={allowCalls}
                onChange={setAllowCalls}
                disabled={!dnd}
              />
            </SwitchField>
            <SwitchField>
              <Label>Allow alarms</Label>
              <Description>Alarms will still sound.</Description>
              <Switch
                color="green"
                checked={allowAlarms}
                onChange={setAllowAlarms}
                disabled={!dnd}
              />
            </SwitchField>
          </SwitchGroup>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'A master switch that reveals additional options when enabled. The exceptions are disabled until DND is turned on.',
      },
    },
  },
}

/**
 * Cookie consent. Because every website needs one now.
 * At least make it look nice.
 */
export const CookieConsent: Story = {
  render: function CookieConsentExample() {
    const [essential, setEssential] = useState(true)
    const [analytics, setAnalytics] = useState(false)
    const [marketing, setMarketing] = useState(false)

    return (
      <div className="w-96 p-6 border border-zinc-200 dark:border-zinc-700 rounded-xl">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          Cookie Preferences
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          We use cookies to improve your experience. You can choose which cookies to allow.
        </p>

        <SwitchGroup>
          <SwitchField>
            <Label>Essential cookies</Label>
            <Description>Required for the site to function. Can't be disabled.</Description>
            <Switch color="green" checked={essential} onChange={setEssential} disabled />
          </SwitchField>
          <SwitchField>
            <Label>Analytics cookies</Label>
            <Description>Help us understand how visitors use the site.</Description>
            <Switch color="blue" checked={analytics} onChange={setAnalytics} />
          </SwitchField>
          <SwitchField>
            <Label>Marketing cookies</Label>
            <Description>Used to show you relevant ads.</Description>
            <Switch color="violet" checked={marketing} onChange={setMarketing} />
          </SwitchField>
        </SwitchGroup>

        <div className="mt-6 flex gap-3">
          <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200">
            Save preferences
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            onClick={() => {
              setAnalytics(true)
              setMarketing(true)
            }}
          >
            Accept all
          </button>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'A cookie consent banner with switches. Essential is always on (and disabled), others are opt-in.',
      },
    },
  },
}

/**
 * Controlled switch with state display.
 * Watch the state update in real-time.
 */
export const ControlledSwitch: Story = {
  render: function ControlledExample() {
    const [isOn, setIsOn] = useState(false)

    return (
      <div className="flex flex-col items-center gap-4">
        <Switch color="blue" checked={isOn} onChange={setIsOn} />
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-3 h-3 rounded-full ${isOn ? 'bg-green-500' : 'bg-zinc-300'}`}
          />
          <span className="text-sm font-medium text-zinc-900 dark:text-white">
            Status: {isOn ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'A controlled switch with React state. The indicator below updates in real-time.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Click to toggle! The fundamental switch interaction.
 * Watch the Interactions panel for the play-by-play.
 */
export const ClickToToggle: Story = {
  args: {
    defaultChecked: false,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')

    // Initially off
    await expect(switchEl).not.toBeChecked()

    // Click to turn on
    await userEvent.click(switchEl)
    await expect(switchEl).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledTimes(1)
    await expect(args.onChange).toHaveBeenLastCalledWith(true)

    // Click to turn off
    await userEvent.click(switchEl)
    await expect(switchEl).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledTimes(2)
    await expect(args.onChange).toHaveBeenLastCalledWith(false)
  },
  parameters: {
    docs: {
      description: {
        story: 'The basic click-to-toggle interaction. Click once to turn on, click again to turn off.',
      },
    },
  },
}

/**
 * Testing disabled switches don't respond to clicks.
 * They're not rude, they're just... unavailable.
 */
export const DisabledInteraction: Story = {
  args: {
    disabled: true,
    defaultChecked: false,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')

    // Verify it's disabled
    await expect(switchEl).toHaveAttribute('data-disabled')
    await expect(switchEl).not.toBeChecked()

    // Try to click (should do nothing)
    await userEvent.click(switchEl)

    // Should still be off and onChange not called
    await expect(switchEl).not.toBeChecked()
    await expect(args.onChange).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled switches ignore all clicks. The onChange callback is never fired.',
      },
    },
  },
}

/**
 * Testing keyboard accessibility. Space toggles the switch.
 * Because not everyone uses a mouse.
 */
export const KeyboardInteraction: Story = {
  args: {
    defaultChecked: false,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')

    // Focus the switch
    switchEl.focus()
    await expect(switchEl).toHaveFocus()

    // Press Space to toggle on
    await userEvent.keyboard(' ')
    await expect(switchEl).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledTimes(1)
    await expect(args.onChange).toHaveBeenLastCalledWith(true)

    // Press Space again to toggle off
    await userEvent.keyboard(' ')
    await expect(switchEl).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledTimes(2)
    await expect(args.onChange).toHaveBeenLastCalledWith(false)
  },
  parameters: {
    docs: {
      description: {
        story: 'Space bar toggles the switch, just like a checkbox. Keyboard users rejoice!',
      },
    },
  },
}

/**
 * Testing that clicking the label toggles the switch.
 * Labels aren't just decoration.
 */
export const LabelClickToggle: Story = {
  render: (args) => (
    <SwitchField>
      <Label>Click this label</Label>
      <Switch {...args} />
    </SwitchField>
  ),
  args: {
    defaultChecked: false,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')
    const label = canvas.getByText('Click this label')

    // Initially off
    await expect(switchEl).not.toBeChecked()

    // Click the label (not the switch)
    await userEvent.click(label)
    await expect(switchEl).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledTimes(1)

    // Click the label again
    await userEvent.click(label)
    await expect(switchEl).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledTimes(2)
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking the label toggles the switch. That\'s what labels are for!',
      },
    },
  },
}

/**
 * Test the focus state - verify the switch can receive focus.
 * Tab to see the focus ring in action.
 */
export const FocusState: Story = {
  args: {
    defaultChecked: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')

    // Tab to focus
    await userEvent.tab()

    // Verify focus
    await expect(switchEl).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tab to see the focus ring. It\'s blue and offset for maximum visibility.',
      },
    },
  },
}

/**
 * Starting from on and toggling off.
 * Because sometimes you inherit an "on" state you need to change.
 */
export const ToggleFromOn: Story = {
  args: {
    defaultChecked: true,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')

    // Initially on
    await expect(switchEl).toBeChecked()

    // Click to turn off
    await userEvent.click(switchEl)
    await expect(switchEl).not.toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith(false)

    // Click to turn on again
    await userEvent.click(switchEl)
    await expect(switchEl).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith(true)
  },
  parameters: {
    docs: {
      description: {
        story: 'Starting from the on state and toggling. Same behavior, different starting point.',
      },
    },
  },
}

/**
 * Testing that disabled switch doesn't respond to keyboard.
 * Can't Space your way through this one.
 */
export const DisabledKeyboardInteraction: Story = {
  args: {
    disabled: true,
    defaultChecked: false,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')

    // Focus the switch
    switchEl.focus()

    // Try to toggle with Space (should do nothing)
    await userEvent.keyboard(' ')

    // Should still be off
    await expect(switchEl).not.toBeChecked()
    await expect(args.onChange).not.toHaveBeenCalled()
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled switches don\'t respond to keyboard either. Consistent behavior across input methods.',
      },
    },
  },
}

/**
 * Multiple rapid toggles. Stress testing the switch.
 * For the impatient among us.
 */
export const RapidToggling: Story = {
  args: {
    defaultChecked: false,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')

    // Click multiple times rapidly
    await userEvent.click(switchEl) // on
    await userEvent.click(switchEl) // off
    await userEvent.click(switchEl) // on
    await userEvent.click(switchEl) // off
    await userEvent.click(switchEl) // on

    // Should end up on
    await expect(switchEl).toBeChecked()

    // onChange should have been called 5 times
    await expect(args.onChange).toHaveBeenCalledTimes(5)
  },
  parameters: {
    docs: {
      description: {
        story: 'Rapid toggling works as expected. Each click fires onChange, and the final state is correct.',
      },
    },
  },
}
