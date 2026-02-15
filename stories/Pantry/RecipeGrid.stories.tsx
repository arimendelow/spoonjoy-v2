import type { Meta, StoryObj } from '@storybook/react-vite'
import { RecipeGrid } from '../../app/components/pantry/RecipeGrid'

const meta: Meta<typeof RecipeGrid> = {
  title: 'Pantry/RecipeGrid',
  component: RecipeGrid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    recipes: [
      {
        id: 'r-1',
        title: 'Lemon Pasta',
        description: 'Bright pasta with garlic, lemon zest, and parmesan.',
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=900&h=600&fit=crop',
        difficulty: 'Easy',
        cookTimeMinutes: 20,
        href: '/recipes/r-1',
      },
      {
        id: 'r-2',
        title: 'Spiced Chickpea Bowl',
        description: 'Roasted chickpeas, fluffy rice, and tahini drizzle.',
        difficulty: 'Medium',
        cookTimeMinutes: 35,
        href: '/recipes/r-2',
      },
      {
        id: 'r-3',
        title: 'Roast Chicken and Root Veg',
        description: 'One-pan dinner with crisp skin and caramelized vegetables.',
        imageUrl: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=900&h=600&fit=crop',
        difficulty: 'Hard',
        cookTimeMinutes: 70,
        href: '/recipes/r-3',
      },
    ],
  },
}

export const Empty: Story = {
  args: {
    recipes: [],
  },
}
