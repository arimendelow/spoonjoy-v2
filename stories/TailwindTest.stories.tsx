import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Test story to verify Tailwind CSS is working correctly in Storybook.
 * This story demonstrates various Tailwind utility classes including
 * custom theme colors defined in tailwind.config.js.
 */
const TailwindTest = () => {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Tailwind CSS Test</h1>

      {/* Basic utilities */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Utilities</h2>
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-blue-500 rounded-lg" />
          <div className="w-16 h-16 bg-green-500 rounded-full" />
          <div className="w-16 h-16 bg-red-500 rounded-md shadow-lg" />
        </div>
      </div>

      {/* Custom theme colors */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Custom Theme Colors</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-600">
            Primary
          </button>
          <button className="px-4 py-2 bg-success text-white rounded hover:bg-success-600">
            Success
          </button>
          <button className="px-4 py-2 bg-danger text-white rounded hover:bg-danger-600">
            Danger
          </button>
          <button className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-600">
            Secondary
          </button>
        </div>
      </div>

      {/* Responsive utilities */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Responsive Grid</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 bg-gray-100 rounded-lg text-center font-medium"
            >
              Item {i}
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Typography</h2>
        <p className="text-sm text-gray-500">Small muted text</p>
        <p className="text-base text-gray-700">Base body text</p>
        <p className="text-lg font-medium text-gray-900">Large medium text</p>
      </div>
    </div>
  )
}

const meta: Meta<typeof TailwindTest> = {
  title: 'Tests/Tailwind CSS',
  component: TailwindTest,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
