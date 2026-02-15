import type { Meta, StoryObj } from '@storybook/react-vite'
import { PantryPage } from '../../app/components/pantry/PantryPage'

const meta: Meta<typeof PantryPage> = {
  title: 'Pantry/PantryPage',
  component: PantryPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    profile: {
      name: 'Chef Rowan Hale',
      bio: 'I cook practical meals with big flavor and minimal cleanup.',
      recipeCount: 18,
      cookbookCount: 4,
      profileHref: '/users/chef-rowan-hale',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop',
      location: 'Brooklyn, NY',
      joinedLabel: 'Joined 2024',
    },
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

export const EmptyPantry: Story = {
  args: {
    profile: {
      name: 'Chef Rowan Hale',
      bio: 'I cook practical meals with big flavor and minimal cleanup.',
      recipeCount: 0,
      cookbookCount: 0,
    },
    recipes: [],
  },
}
