import type { Preview } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import { MemoryRouter } from 'react-router'
import '../app/styles/tailwind.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },

    backgrounds: {
      disable: true, // Using theme addon instead
    },
  },

  decorators: [
    // Wrap all stories with MemoryRouter for react-router components
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    // Apply dark class to html element and set appropriate background
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
};

export default preview;
