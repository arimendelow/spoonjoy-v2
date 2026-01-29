import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DockContextProvider, useDockContext, useDockActions, type DockAction } from '../app/components/navigation/dock-context'
import { SpoonDock } from '../app/components/navigation/spoon-dock'
import { DockItem } from '../app/components/navigation/dock-item'
import { DockCenter } from '../app/components/navigation/dock-center'
import { BookOpen, Book, ShoppingCart, User, ArrowLeft, Edit, Share, Save, X } from 'lucide-react'

/**
 * # DockContext
 * 
 * Context provider for contextual dock navigation.
 * Allows pages to register custom actions that replace the default navigation items.
 * 
 * ## Key Features
 * 
 * - **Contextual Actions** - Pages can register custom actions
 * - **Automatic Cleanup** - Actions are cleared when page unmounts
 * - **Type-Safe** - Full TypeScript support for action definitions
 * - **Animation Ready** - Morph animation between states (implemented in Unit 7b)
 * 
 * ## Usage Pattern
 * 
 * ```tsx
 * function RecipeDetailPage() {
 *   useDockActions([
 *     { id: 'back', icon: ArrowLeft, label: 'Back', onAction: '/recipes', position: 'left' },
 *     { id: 'edit', icon: Edit, label: 'Edit', onAction: () => {}, position: 'right' },
 *   ])
 *   
 *   return <div>Recipe content...</div>
 * }
 * ```
 */
const meta: Meta<typeof DockContextProvider> = {
  title: 'Navigation/DockContext',
  component: DockContextProvider,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        component: `
The DockContext system allows pages to register contextual navigation actions.
When a page registers actions, the dock morphs from default navigation to 
contextual actions. When the page unmounts, the dock returns to default.
        `,
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Default navigation items
const defaultNavItems = [
  { icon: BookOpen, label: 'Recipes', href: '/recipes' },
  { icon: Book, label: 'Cookbooks', href: '/cookbooks' },
  { icon: ShoppingCart, label: 'List', href: '/shopping-list' },
  { icon: User, label: 'Profile', href: '/account/settings' },
]

// Contextual actions for recipe detail page
const recipeDetailActions: DockAction[] = [
  { id: 'back', icon: ArrowLeft, label: 'Back', onAction: '/recipes', position: 'left' },
  { id: 'edit', icon: Edit, label: 'Edit', onAction: () => alert('Edit clicked'), position: 'left' },
  { id: 'add-to-list', icon: ShoppingCart, label: 'Add', onAction: () => alert('Added to list!'), position: 'right' },
  { id: 'share', icon: Share, label: 'Share', onAction: () => alert('Share clicked'), position: 'right' },
]

// Contextual actions for edit page
const editPageActions: DockAction[] = [
  { id: 'cancel', icon: X, label: 'Cancel', onAction: '/recipes', position: 'left' },
  { id: 'save', icon: Save, label: 'Save', onAction: () => alert('Saved!'), position: 'right' },
]

/**
 * Contextual dock that responds to context
 */
function ContextualDock() {
  const { actions, isContextual } = useDockContext()
  
  // Left items: either contextual or default
  const leftItems = isContextual && actions
    ? actions.filter(a => a.position === 'left')
    : defaultNavItems.slice(0, 2)
  
  // Right items: either contextual or default
  const rightItems = isContextual && actions
    ? actions.filter(a => a.position === 'right')
    : defaultNavItems.slice(2)

  return (
    <SpoonDock>
      {leftItems.map((item, index) => (
        <DockItem
          key={'id' in item ? item.id : item.href}
          icon={item.icon}
          label={item.label}
          href={'href' in item ? item.href : '#'}
          onClick={'onAction' in item && typeof item.onAction === 'function' ? item.onAction : undefined}
          active={false}
        />
      ))}
      <DockCenter href="/" />
      {rightItems.map((item, index) => (
        <DockItem
          key={'id' in item ? item.id : item.href}
          icon={item.icon}
          label={item.label}
          href={'href' in item ? item.href : '#'}
          onClick={'onAction' in item && typeof item.onAction === 'function' ? item.onAction : undefined}
          active={false}
        />
      ))}
    </SpoonDock>
  )
}

/**
 * Page that registers contextual actions
 */
function RecipeDetailPage() {
  useDockActions(recipeDetailActions)
  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">Recipe: Chocolate Cake</h1>
      <p className="text-zinc-400 mb-4">This is a recipe detail page with contextual dock actions.</p>
      <div className="bg-zinc-800 rounded-lg p-4">
        <p className="text-sm text-zinc-300">The dock now shows: Back, Edit, Add, Share</p>
      </div>
    </div>
  )
}

/**
 * Edit page with different contextual actions
 */
function RecipeEditPage() {
  useDockActions(editPageActions)
  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">Edit: Chocolate Cake</h1>
      <p className="text-zinc-400 mb-4">This is an edit page with Cancel/Save actions.</p>
      <div className="bg-zinc-800 rounded-lg p-4">
        <p className="text-sm text-zinc-300">The dock now shows: Cancel, Save</p>
      </div>
    </div>
  )
}

/**
 * Default list page (no contextual actions)
 */
function RecipeListPage() {
  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">All Recipes</h1>
      <p className="text-zinc-400 mb-4">This is the recipes list with default navigation.</p>
      <div className="bg-zinc-800 rounded-lg p-4">
        <p className="text-sm text-zinc-300">The dock shows default: Recipes, Cookbooks, List, Profile</p>
      </div>
    </div>
  )
}

// =============================================================================
// STORIES
// =============================================================================

/**
 * Interactive demo showing context switching.
 * Click the buttons to simulate navigating between pages.
 */
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [currentPage, setCurrentPage] = useState<'list' | 'detail' | 'edit'>('list')

    return (
      <DockContextProvider>
        <div className="min-h-screen bg-zinc-900 pb-20">
          {/* Page navigation buttons */}
          <div className="p-4 flex gap-2">
            <button
              onClick={() => setCurrentPage('list')}
              className={`px-4 py-2 rounded ${currentPage === 'list' ? 'bg-blue-600' : 'bg-zinc-700'} text-white`}
            >
              Recipe List
            </button>
            <button
              onClick={() => setCurrentPage('detail')}
              className={`px-4 py-2 rounded ${currentPage === 'detail' ? 'bg-blue-600' : 'bg-zinc-700'} text-white`}
            >
              Recipe Detail
            </button>
            <button
              onClick={() => setCurrentPage('edit')}
              className={`px-4 py-2 rounded ${currentPage === 'edit' ? 'bg-blue-600' : 'bg-zinc-700'} text-white`}
            >
              Edit Recipe
            </button>
          </div>

          {/* Current page content */}
          {currentPage === 'list' && <RecipeListPage />}
          {currentPage === 'detail' && <RecipeDetailPage />}
          {currentPage === 'edit' && <RecipeEditPage />}

          {/* Dock responds to context */}
          <ContextualDock />
        </div>
      </DockContextProvider>
    )
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story: `
Click the buttons to switch between pages and watch the dock change:
- **Recipe List**: Default navigation (Recipes, Cookbooks, List, Profile)
- **Recipe Detail**: Contextual actions (Back, Edit, Add, Share)
- **Edit Recipe**: Edit actions (Cancel, Save)
        `,
      },
    },
  },
}

/**
 * Default navigation state (no contextual actions)
 */
export const DefaultNavigation: Story = {
  render: () => (
    <DockContextProvider>
      <div className="min-h-screen bg-zinc-900 pb-20">
        <RecipeListPage />
        <ContextualDock />
      </div>
    </DockContextProvider>
  ),
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story: 'The dock shows default navigation when no contextual actions are registered.',
      },
    },
  },
}

/**
 * Contextual navigation on recipe detail page
 */
export const RecipeDetailContext: Story = {
  render: () => (
    <DockContextProvider>
      <div className="min-h-screen bg-zinc-900 pb-20">
        <RecipeDetailPage />
        <ContextualDock />
      </div>
    </DockContextProvider>
  ),
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story: 'On recipe detail pages, the dock shows contextual actions: Back, Edit, Add to List, Share.',
      },
    },
  },
}

/**
 * Edit page context with Cancel/Save actions
 */
export const EditPageContext: Story = {
  render: () => (
    <DockContextProvider>
      <div className="min-h-screen bg-zinc-900 pb-20">
        <RecipeEditPage />
        <ContextualDock />
      </div>
    </DockContextProvider>
  ),
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story: 'On edit pages, the dock shows Cancel and Save actions.',
      },
    },
  },
}
