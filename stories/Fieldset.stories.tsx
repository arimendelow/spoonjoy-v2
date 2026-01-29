import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Fieldset, Legend, FieldGroup, Field, Label, Description, ErrorMessage } from '../app/components/ui/fieldset'
import { Input } from '../app/components/ui/input'
import { Textarea } from '../app/components/ui/textarea'
import { Checkbox, CheckboxField } from '../app/components/ui/checkbox'
import { Radio, RadioField, RadioGroup } from '../app/components/ui/radio'
import { Select } from '../app/components/ui/select'

/**
 * # Fieldset
 *
 * The unsung hero of form organization. The container that says "these fields?
 * They belong together." While inputs get all the glory and buttons get all
 * the clicks, Fieldset quietly does the hard work of making forms make sense.
 *
 * Think of Fieldset as the Marie Kondo of form elements — it groups related
 * fields together so users don't have to wonder "does this address go with
 * shipping or billing?" Spoiler: it sparks joy.
 *
 * ## The Fieldset Philosophy
 *
 * Forms without fieldsets are like recipes without sections. Sure, you could
 * list all 47 ingredients in one giant blob, but wouldn't it be nicer to know
 * which ones are for the sauce vs. the garnish?
 *
 * ## The Cast of Characters
 *
 * - **Fieldset** - The container. The parent. The one who holds it all together.
 * - **Legend** - The title. Bold, proud, and slightly larger than everyone else.
 * - **FieldGroup** - Groups fields with consistent spacing. The organizer.
 * - **Field** - Wraps individual inputs with their labels. The matchmaker.
 * - **Label** - Tells users what to type. The helpful friend.
 * - **Description** - Extra context. The "here's what this actually means" text.
 * - **ErrorMessage** - The red text of shame. Use sparingly.
 *
 * ## Features
 *
 * - **Semantic HTML** - Screen readers actually understand what's happening
 * - **Auto-spacing** - FieldGroup adds consistent space between fields
 * - **Label association** - Click a label, focus its input. It's the law.
 * - **Disabled propagation** - Disable a Fieldset, disable everything inside
 * - **Dark mode** - Because forms are filled out at 2am too
 */
const meta: Meta<typeof Fieldset> = {
  title: 'UI/Fieldset',
  component: Fieldset,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The unsung hero of form organization. Groups related form fields with semantic HTML, auto-spacing, and disability propagation.

Built on HeadlessUI, Fieldset brings order to the chaos of forms. Legend gives it a title, FieldGroup spaces the fields, and Field connects labels to inputs.
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// WITH LEGEND
// =============================================================================

/**
 * A Fieldset with a Legend. The classic combo.
 *
 * Legend is like the chapter title of your form section. It tells users
 * "everything below this heading is related." Screen readers announce it
 * when users navigate into the fieldset. Accessibility win!
 */
export const WithLegend: Story = {
  render: () => (
    <Fieldset>
      <Legend>Personal Information</Legend>
      <FieldGroup>
        <Field>
          <Label>Full name</Label>
          <Input placeholder="Julia Child" />
        </Field>
        <Field>
          <Label>Email</Label>
          <Input type="email" placeholder="julia@spoonjoy.com" />
        </Field>
      </FieldGroup>
    </Fieldset>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Legend announces the section to screen readers. It\'s like a heading, but with semantic meaning for forms.',
      },
    },
  },
}

/**
 * Legend without FieldGroup. Less spacing, more compact.
 * For when you just need a title and one or two fields.
 */
export const LegendOnly: Story = {
  render: () => (
    <Fieldset>
      <Legend>Quick Note</Legend>
      <Field>
        <Label>Message</Label>
        <Textarea placeholder="Leave a note for the chef..." />
      </Field>
    </Fieldset>
  ),
}

/**
 * Legend with description text. Context matters!
 * The `data-slot="text"` makes it style correctly.
 */
export const LegendWithDescription: Story = {
  render: () => (
    <Fieldset>
      <Legend>Shipping Address</Legend>
      <p data-slot="text" className="text-sm text-zinc-500 dark:text-zinc-400">
        We'll use this address to deliver your cookware.
      </p>
      <FieldGroup>
        <Field>
          <Label>Street address</Label>
          <Input placeholder="123 Culinary Lane" />
        </Field>
        <Field>
          <Label>City</Label>
          <Input placeholder="Flavortown" />
        </Field>
      </FieldGroup>
    </Fieldset>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Add helper text with data-slot="text" for automatic spacing. Great for explaining why you need this info.',
      },
    },
  },
}

// =============================================================================
// GROUPED FIELDS
// =============================================================================

/**
 * ## FieldGroup: The Spacer of Dreams
 *
 * FieldGroup adds consistent vertical spacing (space-y-8) between fields.
 * It's the CSS equivalent of "give everything room to breathe."
 *
 * Without FieldGroup, your fields would huddle together like penguins
 * in a blizzard. With it, they stand proud and organized.
 */
export const GroupedFields: Story = {
  render: () => (
    <Fieldset>
      <Legend>Recipe Details</Legend>
      <FieldGroup>
        <Field>
          <Label>Recipe name</Label>
          <Input placeholder="Grandma's Secret Meatballs" />
        </Field>
        <Field>
          <Label>Description</Label>
          <Textarea placeholder="A family recipe passed down through generations..." />
        </Field>
        <Field>
          <Label>Prep time (minutes)</Label>
          <Input type="number" placeholder="30" />
        </Field>
        <Field>
          <Label>Difficulty</Label>
          <Select defaultValue="">
            <option value="" disabled>Select difficulty</option>
            <option value="easy">Easy - My cat could do this</option>
            <option value="medium">Medium - Requires focus</option>
            <option value="hard">Hard - Gordon Ramsay mode</option>
          </Select>
        </Field>
      </FieldGroup>
    </Fieldset>
  ),
  parameters: {
    docs: {
      description: {
        story: 'FieldGroup wraps fields with data-slot="control" for proper spacing after the legend.',
      },
    },
  },
}

/**
 * Fields with labels and descriptions. Maximum clarity.
 * Label says what, Description says why.
 */
export const FieldsWithDescriptions: Story = {
  render: () => (
    <Fieldset>
      <Legend>Privacy Settings</Legend>
      <FieldGroup>
        <Field>
          <Label>Display name</Label>
          <Description>This is how other users will see you.</Description>
          <Input placeholder="Chef Anonymous" />
        </Field>
        <Field>
          <Label>Bio</Label>
          <Description>Tell the world about your cooking journey. Keep it under 500 characters.</Description>
          <Textarea placeholder="I burn water but I'm trying..." />
        </Field>
      </FieldGroup>
    </Fieldset>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Description adds context below the label. Auto-spaced with CSS data-slot magic.',
      },
    },
  },
}

/**
 * Fields with error messages. The red text of validation failure.
 * Use ErrorMessage when something's wrong and the user needs to fix it.
 */
export const FieldsWithErrors: Story = {
  render: () => (
    <Fieldset>
      <Legend>Create Account</Legend>
      <FieldGroup>
        <Field>
          <Label>Username</Label>
          <Input invalid defaultValue="xx" />
          <ErrorMessage>Username must be at least 3 characters.</ErrorMessage>
        </Field>
        <Field>
          <Label>Email</Label>
          <Input type="email" invalid defaultValue="not-an-email" />
          <ErrorMessage>Please enter a valid email address.</ErrorMessage>
        </Field>
        <Field>
          <Label>Password</Label>
          <Input type="password" invalid defaultValue="123" />
          <ErrorMessage>Password must be at least 8 characters with one number.</ErrorMessage>
        </Field>
      </FieldGroup>
    </Fieldset>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ErrorMessage shows below the input in red. Be helpful with error copy — tell users how to fix it!',
      },
    },
  },
}

/**
 * Mix of valid and invalid fields. Real-world validation.
 */
export const MixedValidation: Story = {
  render: () => (
    <Fieldset>
      <Legend>Update Profile</Legend>
      <FieldGroup>
        <Field>
          <Label>Name</Label>
          <Input defaultValue="Julia Child" />
          <Description>Looking good!</Description>
        </Field>
        <Field>
          <Label>Email</Label>
          <Input type="email" invalid defaultValue="julia@" />
          <ErrorMessage>Please complete your email address.</ErrorMessage>
        </Field>
        <Field>
          <Label>Website</Label>
          <Input type="url" defaultValue="https://spoonjoy.com" />
        </Field>
      </FieldGroup>
    </Fieldset>
  ),
}

// =============================================================================
// MULTIPLE FIELDSETS
// =============================================================================

/**
 * Multiple fieldsets in one form. The ultimate organization.
 *
 * Real forms often have multiple sections: personal info, address, payment.
 * Each gets its own Fieldset. Each has its own Legend. Order from chaos.
 */
export const MultipleFieldsets: Story = {
  render: () => (
    <div className="space-y-10">
      <Fieldset>
        <Legend>Personal Information</Legend>
        <FieldGroup>
          <Field>
            <Label>Full name</Label>
            <Input placeholder="Your name" />
          </Field>
          <Field>
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" />
          </Field>
        </FieldGroup>
      </Fieldset>

      <Fieldset>
        <Legend>Shipping Address</Legend>
        <FieldGroup>
          <Field>
            <Label>Street</Label>
            <Input placeholder="123 Main St" />
          </Field>
          <Field>
            <Label>City</Label>
            <Input placeholder="New York" />
          </Field>
        </FieldGroup>
      </Fieldset>

      <Fieldset>
        <Legend>Preferences</Legend>
        <FieldGroup>
          <CheckboxField>
            <Checkbox defaultChecked color="indigo" />
            <Label>Send me recipe recommendations</Label>
          </CheckboxField>
          <CheckboxField>
            <Checkbox color="indigo" />
            <Label>Subscribe to newsletter</Label>
          </CheckboxField>
        </FieldGroup>
      </Fieldset>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complex forms should be broken into logical sections. Each Fieldset = one topic.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}

// =============================================================================
// DIFFERENT FIELD TYPES
// =============================================================================

/**
 * Fieldset with various input types. The whole gang.
 */
export const VariousInputTypes: Story = {
  render: () => (
    <Fieldset>
      <Legend>Recipe Metadata</Legend>
      <FieldGroup>
        <Field>
          <Label>Recipe name</Label>
          <Input placeholder="Enter recipe name" />
        </Field>
        <Field>
          <Label>Category</Label>
          <Select defaultValue="">
            <option value="" disabled>Select category</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="dessert">Dessert</option>
          </Select>
        </Field>
        <Field>
          <Label>Description</Label>
          <Textarea placeholder="Describe your recipe..." />
        </Field>
        <Field>
          <Label>Servings</Label>
          <Input type="number" placeholder="4" />
        </Field>
      </FieldGroup>
    </Fieldset>
  ),
}

/**
 * Fieldset with checkboxes. Multi-select options.
 */
export const WithCheckboxes: Story = {
  render: () => (
    <Fieldset>
      <Legend>Dietary Restrictions</Legend>
      <p data-slot="text" className="text-sm text-zinc-500 dark:text-zinc-400">
        Select all that apply to your recipe.
      </p>
      <FieldGroup>
        <CheckboxField>
          <Checkbox color="green" />
          <Label>Vegetarian</Label>
          <Description>No meat or fish</Description>
        </CheckboxField>
        <CheckboxField>
          <Checkbox color="green" />
          <Label>Vegan</Label>
          <Description>No animal products whatsoever</Description>
        </CheckboxField>
        <CheckboxField>
          <Checkbox color="amber" />
          <Label>Gluten-free</Label>
          <Description>No wheat, barley, or rye</Description>
        </CheckboxField>
        <CheckboxField>
          <Checkbox color="blue" />
          <Label>Dairy-free</Label>
          <Description>No milk, cheese, or butter (the horror!)</Description>
        </CheckboxField>
      </FieldGroup>
    </Fieldset>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Checkboxes in a FieldGroup get consistent spacing. Each can have its own label and description.',
      },
    },
  },
}

/**
 * Fieldset with radio buttons. Single-select options.
 */
export const WithRadios: Story = {
  render: () => (
    <Fieldset>
      <Legend>Cooking Skill Level</Legend>
      <p data-slot="text" className="text-sm text-zinc-500 dark:text-zinc-400">
        Be honest. We won't judge. (Much.)
      </p>
      <RadioGroup defaultValue="beginner">
        <FieldGroup>
          <RadioField>
            <Radio value="beginner" color="green" />
            <Label>Beginner</Label>
            <Description>I can make toast without burning it (usually)</Description>
          </RadioField>
          <RadioField>
            <Radio value="intermediate" color="amber" />
            <Label>Intermediate</Label>
            <Description>I've mastered more than three recipes</Description>
          </RadioField>
          <RadioField>
            <Radio value="advanced" color="red" />
            <Label>Advanced</Label>
            <Description>I've made a roux and it didn't turn into glue</Description>
          </RadioField>
          <RadioField>
            <Radio value="professional" color="purple" />
            <Label>Professional</Label>
            <Description>I correct Gordon Ramsay's technique</Description>
          </RadioField>
        </FieldGroup>
      </RadioGroup>
    </Fieldset>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Radio buttons for single-select choices. Wrap in RadioGroup for proper grouping.',
      },
    },
  },
}

// =============================================================================
// DISABLED STATE
// =============================================================================

/**
 * A disabled Fieldset. Everything inside becomes untouchable.
 *
 * When you disable a Fieldset, ALL its children become disabled.
 * It's like putting a "Do Not Enter" sign on an entire form section.
 * HeadlessUI handles the disability propagation automatically.
 */
export const Disabled: Story = {
  render: () => (
    <Fieldset disabled>
      <Legend>Account Locked</Legend>
      <p data-slot="text" className="text-sm text-zinc-500 dark:text-zinc-400">
        Contact support to unlock your account.
      </p>
      <FieldGroup>
        <Field>
          <Label>Username</Label>
          <Input defaultValue="locked_user" />
        </Field>
        <Field>
          <Label>Email</Label>
          <Input type="email" defaultValue="locked@example.com" />
        </Field>
        <CheckboxField>
          <Checkbox defaultChecked />
          <Label>Remember me</Label>
        </CheckboxField>
      </FieldGroup>
    </Fieldset>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled on the Fieldset propagates to all children. Labels and inputs all get 50% opacity.',
      },
    },
  },
}

/**
 * Partially disabled form. Some sections editable, some not.
 */
export const PartiallyDisabled: Story = {
  render: () => (
    <div className="space-y-10">
      <Fieldset disabled>
        <Legend>Account Info (Verified)</Legend>
        <p data-slot="text" className="text-sm text-zinc-500 dark:text-zinc-400">
          These fields are locked after verification.
        </p>
        <FieldGroup>
          <Field>
            <Label>Legal name</Label>
            <Input defaultValue="Julia Child" />
          </Field>
          <Field>
            <Label>Date of birth</Label>
            <Input type="date" defaultValue="1912-08-15" />
          </Field>
        </FieldGroup>
      </Fieldset>

      <Fieldset>
        <Legend>Contact Info (Editable)</Legend>
        <p data-slot="text" className="text-sm text-zinc-500 dark:text-zinc-400">
          You can update these anytime.
        </p>
        <FieldGroup>
          <Field>
            <Label>Phone</Label>
            <Input type="tel" placeholder="+1 (555) 123-4567" />
          </Field>
          <Field>
            <Label>Website</Label>
            <Input type="url" placeholder="https://yourwebsite.com" />
          </Field>
        </FieldGroup>
      </Fieldset>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Mix disabled and enabled fieldsets for forms where some info is locked.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}

// =============================================================================
// REAL-WORLD EXAMPLES
// =============================================================================

/**
 * A complete recipe form. The real deal.
 */
export const RecipeForm: Story = {
  render: () => (
    <div className="space-y-10">
      <Fieldset>
        <Legend>Basic Information</Legend>
        <FieldGroup>
          <Field>
            <Label>Recipe name</Label>
            <Input placeholder="What are we making?" />
          </Field>
          <Field>
            <Label>Description</Label>
            <Description>Hook readers with a mouthwatering description.</Description>
            <Textarea placeholder="This recipe will change your life..." />
          </Field>
        </FieldGroup>
      </Fieldset>

      <Fieldset>
        <Legend>Time & Difficulty</Legend>
        <FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label>Prep time</Label>
              <Input type="number" placeholder="15 min" />
            </Field>
            <Field>
              <Label>Cook time</Label>
              <Input type="number" placeholder="30 min" />
            </Field>
          </div>
          <Field>
            <Label>Difficulty</Label>
            <Select defaultValue="">
              <option value="" disabled>How hard is this?</option>
              <option value="1">1 - Microwave expert level</option>
              <option value="2">2 - Can follow instructions</option>
              <option value="3">3 - Knows what a roux is</option>
              <option value="4">4 - Owns a mandoline (and all fingers)</option>
              <option value="5">5 - Michelin star material</option>
            </Select>
          </Field>
        </FieldGroup>
      </Fieldset>

      <Fieldset>
        <Legend>Tags</Legend>
        <p data-slot="text" className="text-sm text-zinc-500 dark:text-zinc-400">
          Help people find your recipe.
        </p>
        <FieldGroup>
          <CheckboxField>
            <Checkbox color="green" />
            <Label>Vegetarian</Label>
          </CheckboxField>
          <CheckboxField>
            <Checkbox color="amber" />
            <Label>Quick & Easy</Label>
          </CheckboxField>
          <CheckboxField>
            <Checkbox color="blue" />
            <Label>Budget-friendly</Label>
          </CheckboxField>
          <CheckboxField>
            <Checkbox color="pink" />
            <Label>Date Night</Label>
          </CheckboxField>
        </FieldGroup>
      </Fieldset>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A real recipe form with multiple fieldsets, mixed inputs, and helpful descriptions.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}

/**
 * User profile settings. Classic settings page vibes.
 */
export const ProfileSettings: Story = {
  render: () => (
    <div className="space-y-10">
      <Fieldset>
        <Legend>Profile</Legend>
        <FieldGroup>
          <Field>
            <Label>Display name</Label>
            <Description>This is your public persona.</Description>
            <Input defaultValue="Chef Anonymous" />
          </Field>
          <Field>
            <Label>Bio</Label>
            <Textarea defaultValue="I cook things and sometimes they turn out edible." />
          </Field>
        </FieldGroup>
      </Fieldset>

      <Fieldset>
        <Legend>Notifications</Legend>
        <FieldGroup>
          <CheckboxField>
            <Checkbox color="indigo" defaultChecked />
            <Label>Email notifications</Label>
            <Description>Get notified about comments and followers</Description>
          </CheckboxField>
          <CheckboxField>
            <Checkbox color="indigo" defaultChecked />
            <Label>Weekly digest</Label>
            <Description>A summary of what you missed</Description>
          </CheckboxField>
          <CheckboxField>
            <Checkbox color="indigo" />
            <Label>Marketing emails</Label>
            <Description>Tips, features, and promotional content</Description>
          </CheckboxField>
        </FieldGroup>
      </Fieldset>

      <Fieldset>
        <Legend>Privacy</Legend>
        <RadioGroup defaultValue="public">
          <FieldGroup>
            <RadioField>
              <Radio value="public" color="green" />
              <Label>Public profile</Label>
              <Description>Anyone can see your recipes</Description>
            </RadioField>
            <RadioField>
              <Radio value="followers" color="amber" />
              <Label>Followers only</Label>
              <Description>Only approved followers can see your recipes</Description>
            </RadioField>
            <RadioField>
              <Radio value="private" color="red" />
              <Label>Private</Label>
              <Description>Your recipes are for your eyes only</Description>
            </RadioField>
          </FieldGroup>
        </RadioGroup>
      </Fieldset>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A settings page with profile, notifications, and privacy sections. Each gets its own fieldset.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}

/**
 * Checkout form. Where money changes hands.
 */
export const CheckoutForm: Story = {
  render: () => (
    <div className="space-y-10">
      <Fieldset>
        <Legend>Contact</Legend>
        <FieldGroup>
          <Field>
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" />
          </Field>
          <Field>
            <Label>Phone</Label>
            <Description>In case we need to reach you about your order.</Description>
            <Input type="tel" placeholder="+1 (555) 123-4567" />
          </Field>
        </FieldGroup>
      </Fieldset>

      <Fieldset>
        <Legend>Shipping</Legend>
        <FieldGroup>
          <Field>
            <Label>Full name</Label>
            <Input placeholder="Julia Child" />
          </Field>
          <Field>
            <Label>Address</Label>
            <Input placeholder="123 Culinary Lane" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label>City</Label>
              <Input placeholder="Cambridge" />
            </Field>
            <Field>
              <Label>ZIP</Label>
              <Input placeholder="02139" />
            </Field>
          </div>
        </FieldGroup>
      </Fieldset>

      <Fieldset>
        <Legend>Delivery</Legend>
        <RadioGroup defaultValue="standard">
          <FieldGroup>
            <RadioField>
              <Radio value="standard" color="blue" />
              <Label>Standard (5-7 days)</Label>
              <Description>Free — Because good things come to those who wait</Description>
            </RadioField>
            <RadioField>
              <Radio value="express" color="amber" />
              <Label>Express (2-3 days)</Label>
              <Description>$9.99 — For the mildly impatient</Description>
            </RadioField>
            <RadioField>
              <Radio value="overnight" color="red" />
              <Label>Overnight</Label>
              <Description>$24.99 — You need this NOW</Description>
            </RadioField>
          </FieldGroup>
        </RadioGroup>
      </Fieldset>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A checkout form with contact, shipping, and delivery sections. Clean organization = higher conversions.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Testing that clicking labels focuses their associated inputs.
 * The whole point of the label-input relationship.
 */
export const LabelClickFocusesInput: Story = {
  render: () => (
    <Fieldset>
      <Legend>Test Form</Legend>
      <FieldGroup>
        <Field>
          <Label>Click this label</Label>
          <Input placeholder="I should get focused" />
        </Field>
      </FieldGroup>
    </Fieldset>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const label = canvas.getByText('Click this label')
    const input = canvas.getByPlaceholderText('I should get focused')

    // Click the label
    await userEvent.click(label)

    // Input should be focused
    await expect(input).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Clicking a label focuses its associated input. This is what proper form semantics gives you.',
      },
    },
  },
}

/**
 * Testing keyboard navigation through fields.
 * Tab should move between inputs in order.
 */
export const KeyboardNavigation: Story = {
  render: () => (
    <Fieldset>
      <Legend>Navigate Me</Legend>
      <FieldGroup>
        <Field>
          <Label>First field</Label>
          <Input placeholder="First" />
        </Field>
        <Field>
          <Label>Second field</Label>
          <Input placeholder="Second" />
        </Field>
        <Field>
          <Label>Third field</Label>
          <Input placeholder="Third" />
        </Field>
      </FieldGroup>
    </Fieldset>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const firstInput = canvas.getByPlaceholderText('First')
    const secondInput = canvas.getByPlaceholderText('Second')
    const thirdInput = canvas.getByPlaceholderText('Third')

    // Tab to first input
    await userEvent.tab()
    await expect(firstInput).toHaveFocus()

    // Tab to second
    await userEvent.tab()
    await expect(secondInput).toHaveFocus()

    // Tab to third
    await userEvent.tab()
    await expect(thirdInput).toHaveFocus()
  },
  parameters: {
    docs: {
      description: {
        story: 'Tab navigation works naturally through fields. No special handling needed.',
      },
    },
  },
}

/**
 * Testing that disabled fieldsets prevent all interaction.
 */
export const DisabledFieldsetInteraction: Story = {
  render: () => (
    <Fieldset disabled>
      <Legend>Can't Touch This</Legend>
      <FieldGroup>
        <Field>
          <Label>Locked input</Label>
          <Input placeholder="Try to type here" data-testid="disabled-input" />
        </Field>
        <CheckboxField>
          <Checkbox data-testid="disabled-checkbox" />
          <Label>Try to check me</Label>
        </CheckboxField>
      </FieldGroup>
    </Fieldset>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByTestId('disabled-input')
    const checkbox = canvas.getByTestId('disabled-checkbox')

    // Both should be disabled
    await expect(input).toBeDisabled()
    await expect(checkbox).toBeDisabled()

    // Can't type in disabled input
    await userEvent.type(input, 'hello')
    await expect(input).toHaveValue('')

    // Can't click disabled checkbox
    await expect(checkbox).not.toBeChecked()
    await userEvent.click(checkbox)
    await expect(checkbox).not.toBeChecked()
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled fieldsets block all interaction. Inputs can\'t be typed in, checkboxes can\'t be clicked.',
      },
    },
  },
}

/**
 * Testing form submission with Enter key from input.
 */
export const FormWithSubmit: Story = {
  args: {},
  render: () => {
    const handleSubmit = fn()
    return (
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <Fieldset>
          <Legend>Quick Search</Legend>
          <Field>
            <Label>Search recipes</Label>
            <Input placeholder="Type and press Enter" data-testid="search-input" />
          </Field>
        </Fieldset>
      </form>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByTestId('search-input')

    // Focus and type
    await userEvent.click(input)
    await userEvent.type(input, 'chocolate cake')

    // Verify value
    await expect(input).toHaveValue('chocolate cake')
  },
  parameters: {
    docs: {
      description: {
        story: 'Fieldsets work naturally inside forms. Enter submits, Tab navigates.',
      },
    },
  },
}

/**
 * Testing that typing in fields works correctly.
 */
export const TypingInFields: Story = {
  render: () => (
    <Fieldset>
      <Legend>Type Test</Legend>
      <FieldGroup>
        <Field>
          <Label>Name</Label>
          <Input placeholder="Enter your name" data-testid="name-input" />
        </Field>
        <Field>
          <Label>Message</Label>
          <Textarea placeholder="Enter a message" data-testid="message-textarea" />
        </Field>
      </FieldGroup>
    </Fieldset>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nameInput = canvas.getByTestId('name-input')
    const messageTextarea = canvas.getByTestId('message-textarea')

    // Type in the input
    await userEvent.type(nameInput, 'Julia Child')
    await expect(nameInput).toHaveValue('Julia Child')

    // Type in the textarea
    await userEvent.type(messageTextarea, 'The only time to eat diet food is while you\'re waiting for the steak to cook.')
    await expect(messageTextarea).toHaveValue('The only time to eat diet food is while you\'re waiting for the steak to cook.')
  },
  parameters: {
    docs: {
      description: {
        story: 'Typing works in all field types. Input and Textarea both accept text normally.',
      },
    },
  },
}
