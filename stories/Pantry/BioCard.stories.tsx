import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { BioCard } from '../../app/components/pantry/BioCard'

const meta: Meta<typeof BioCard> = {
  title: 'Pantry/BioCard',
  component: BioCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Chef Rowan Hale',
    bio: 'I cook practical meals with big flavor and minimal cleanup.',
    recipeCount: 18,
    cookbookCount: 4,
    profileHref: '/users/chef-rowan-hale',
    location: 'Brooklyn, NY',
    joinedLabel: 'Joined 2024',
    onEditProfile: fn(),
  },
}

export const WithPhoto: Story = {
  args: {
    ...Default.args,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop',
  },
}
