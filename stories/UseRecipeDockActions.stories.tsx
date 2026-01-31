import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect, within, userEvent } from 'storybook/test'
import { useState } from 'react'
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router'
import { DockContextProvider, useDockContext, type DockAction } from '../app/components/navigation/dock-context'
import {
  useRecipeDetailActions,
  useRecipeEditActions,
} from '../app/components/navigation/use-recipe-dock-actions'
import { MobileNav } from '../app/components/navigation/mobile-nav'
import { ArrowLeft, Edit, ShoppingCart, Share, X, Save } from 'lucide-react'

/**
 * # UseRecipeDockActions
 * 
 * Hooks for registering contextual dock actions on recipe pages.
 * These hooks automatically register and cleanup dock actions based on component lifecycle.
 * 
 * ## Hooks
 * 
 * ### useRecipeDetailActions
 * For recipe detail pages (/recipes/:id):
 * - Back: Navigate to recipes list
 * - Edit: Navigate to edit page
 * - Add to List: Add ingredients to shopping list
 * - Share: Share recipe
 * 
 * ### useRecipeEditActions
 * For recipe edit pages (/recipes/:id/edit):
 * - Cancel: Navigate back to detail view
 * - Save: Submit form
 * 
 * ## Usage
 * 
 * ```tsx
 * function RecipeDetailPage({ recipeId }: { recipeId: string }) {
 *   useRecipeDetailActions({
 *     recipeId,
 *     onAddToList: () => console.log('Add to list'),
 *     onShare: () => console.log('Share'),
 *   })
 *   
 *   return <div>Recipe content...</div>
 * }
 * ```
 */
const meta: Meta = {
  title: 'Navigation/UseRecipeDockActions',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#18181b' }],
    },
    docs: {
      description: {
        component: `
These hooks provide pre-configured dock actions for recipe pages, making it easy
to add contextual navigation without manually setting up each action.

The hooks automatically clean up when the component unmounts, returning the dock
to its default navigation state.
        `,
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

/**
 * Display the current dock context state for debugging
 */
function DockStateDisplay() {
  const { actions, isContextual } = useDockContext()
  
  return (
    <div className="bg-zinc-800 rounded-lg p-4 mb-4">
      <h3 className="text-white font-semibold mb-2">Dock Context State</h3>
      <div className="text-zinc-400 text-sm space-y-1">
        <p>Mode: <span className="text-white">{isContextual ? 'Contextual' : 'Default Navigation'}</span></p>
        {actions && (
          <div>
            <p>Actions:</p>
            <ul className="ml-4 mt-1 space-y-1">
              {actions.map((action) => (
                <li key={action.id} className="flex items-center gap-2">
                  <action.icon className="h-4 w-4" />
                  <span className="text-white">{action.label}</span>
                  <span className="text-zinc-500">({action.position})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Log action triggers for demo purposes
 */
function ActionLog({ logs }: { logs: string[] }) {
  if (logs.length === 0) return null
  
  return (
    <div className="bg-zinc-800 rounded-lg p-4 mb-4">
      <h3 className="text-white font-semibold mb-2">Action Log</h3>
      <div className="text-zinc-400 text-sm space-y-1 max-h-32 overflow-y-auto">
        {logs.map((log, i) => (
          <p key={i} className="text-green-400">✓ {log}</p>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// DEMO PAGES
// =============================================================================

/**
 * Simulated recipe detail page that uses useRecipeDetailActions
 */
function RecipeDetailPage({ 
  recipeId, 
  onAddToList, 
  onShare,
  logs,
  setLogs,
}: { 
  recipeId: string
  onAddToList?: () => void
  onShare?: () => void
  logs: string[]
  setLogs: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const handleAddToList = () => {
    setLogs(prev => [...prev, `Add to list triggered for recipe ${recipeId}`])
    onAddToList?.()
  }
  
  const handleShare = () => {
    setLogs(prev => [...prev, `Share triggered for recipe ${recipeId}`])
    onShare?.()
  }

  useRecipeDetailActions({
    recipeId,
    onAddToList: handleAddToList,
    onShare: handleShare,
  })

  return (
    <div className="p-4 text-white">
      <DockStateDisplay />
      <ActionLog logs={logs} />
      
      <h1 className="text-2xl font-bold mb-2">Recipe Detail</h1>
      <p className="text-zinc-400 mb-4">Recipe ID: {recipeId}</p>
      
      <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
        <h2 className="font-semibold">Dock Actions Available:</h2>
        <ul className="text-zinc-400 text-sm space-y-1">
          <li className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Back - Navigate to /recipes</li>
          <li className="flex items-center gap-2"><Edit className="h-4 w-4" /> Edit - Navigate to edit page</li>
          <li className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Add - Triggers onAddToList</li>
          <li className="flex items-center gap-2"><Share className="h-4 w-4" /> Share - Triggers onShare</li>
        </ul>
      </div>
    </div>
  )
}

/**
 * Simulated recipe edit page that uses useRecipeEditActions
 */
function RecipeEditPage({ 
  recipeId, 
  onSave,
  logs,
  setLogs,
}: { 
  recipeId: string
  onSave?: () => void
  logs: string[]
  setLogs: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const handleSave = () => {
    setLogs(prev => [...prev, `Save triggered for recipe ${recipeId}`])
    onSave?.()
  }

  useRecipeEditActions({
    recipeId,
    onSave: handleSave,
  })

  return (
    <div className="p-4 text-white">
      <DockStateDisplay />
      <ActionLog logs={logs} />
      
      <h1 className="text-2xl font-bold mb-2">Edit Recipe</h1>
      <p className="text-zinc-400 mb-4">Recipe ID: {recipeId}</p>
      
      <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
        <h2 className="font-semibold">Dock Actions Available:</h2>
        <ul className="text-zinc-400 text-sm space-y-1">
          <li className="flex items-center gap-2"><X className="h-4 w-4" /> Cancel - Navigate to detail view</li>
          <li className="flex items-center gap-2"><Save className="h-4 w-4" /> Save - Triggers onSave</li>
        </ul>
      </div>
      
      <div className="mt-4 bg-zinc-800 rounded-lg p-4">
        <p className="text-zinc-400 text-sm">
          (Simulated edit form would go here)
        </p>
      </div>
    </div>
  )
}

/**
 * Default page (no contextual actions)
 */
function RecipesListPage() {
  return (
    <div className="p-4 text-white">
      <DockStateDisplay />
      
      <h1 className="text-2xl font-bold mb-2">Recipes List</h1>
      <p className="text-zinc-400 mb-4">Default navigation (no contextual actions)</p>
      
      <div className="space-y-2">
        {['pasta-carbonara', 'chicken-tikka', 'veggie-stir-fry'].map((id) => (
          <a
            key={id}
            href={`/recipes/${id}`}
            className="block bg-zinc-800 rounded-lg p-3 hover:bg-zinc-700 transition-colors"
          >
            <span className="text-white capitalize">{id.replace('-', ' ')}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// STORIES
// =============================================================================

/**
 * Recipe detail page with all contextual actions
 */
export const RecipeDetailActions: Story = {
  render: () => {
    const [logs, setLogs] = useState<string[]>([])
    
    return (
      <MemoryRouter initialEntries={['/recipes/pasta-carbonara']}>
        <DockContextProvider>
          <div className="h-screen w-full bg-zinc-900 relative">
            <RecipeDetailPage 
              recipeId="pasta-carbonara" 
              logs={logs}
              setLogs={setLogs}
            />
            <MobileNav isAuthenticated={true} />
          </div>
        </DockContextProvider>
      </MemoryRouter>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
The useRecipeDetailActions hook sets up four contextual actions:
- **Back**: Navigates to /recipes (href-based)
- **Edit**: Navigates to /recipes/:id/edit (programmatic via useNavigate)
- **Add**: Calls the provided onAddToList handler
- **Share**: Calls the provided onShare handler

Click the dock items to trigger actions and see them logged.
        `,
      },
    },
  },
}

/**
 * Recipe edit page with save/cancel actions
 */
export const RecipeEditActions: Story = {
  render: () => {
    const [logs, setLogs] = useState<string[]>([])
    
    return (
      <MemoryRouter initialEntries={['/recipes/pasta-carbonara/edit']}>
        <DockContextProvider>
          <div className="h-screen w-full bg-zinc-900 relative">
            <RecipeEditPage 
              recipeId="pasta-carbonara"
              logs={logs}
              setLogs={setLogs}
            />
            <MobileNav isAuthenticated={true} />
          </div>
        </DockContextProvider>
      </MemoryRouter>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
The useRecipeEditActions hook sets up two contextual actions:
- **Cancel**: Navigates back to /recipes/:id (href-based)
- **Save**: Calls the provided onSave handler
        `,
      },
    },
  },
}

/**
 * Transition between pages showing action cleanup
 */
export const ActionCleanupDemo: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState<'list' | 'detail' | 'edit'>('list')
    const [logs, setLogs] = useState<string[]>([])

    return (
      <MemoryRouter 
        initialEntries={[
          '/recipes',
          '/recipes/pasta-carbonara',
          '/recipes/pasta-carbonara/edit',
        ]}
        initialIndex={currentPage === 'list' ? 0 : currentPage === 'detail' ? 1 : 2}
      >
        <DockContextProvider>
          <div className="h-screen w-full bg-zinc-900 relative">
            <div className="p-4 border-b border-zinc-800">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage('list')}
                  className={`px-3 py-1 rounded ${
                    currentPage === 'list' ? 'bg-white text-black' : 'bg-zinc-800 text-white'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setCurrentPage('detail')}
                  className={`px-3 py-1 rounded ${
                    currentPage === 'detail' ? 'bg-white text-black' : 'bg-zinc-800 text-white'
                  }`}
                >
                  Detail
                </button>
                <button
                  onClick={() => setCurrentPage('edit')}
                  className={`px-3 py-1 rounded ${
                    currentPage === 'edit' ? 'bg-white text-black' : 'bg-zinc-800 text-white'
                  }`}
                >
                  Edit
                </button>
              </div>
            </div>
            
            {currentPage === 'list' && <RecipesListPage />}
            {currentPage === 'detail' && (
              <RecipeDetailPage 
                recipeId="pasta-carbonara"
                logs={logs}
                setLogs={setLogs}
              />
            )}
            {currentPage === 'edit' && (
              <RecipeEditPage 
                recipeId="pasta-carbonara"
                logs={logs}
                setLogs={setLogs}
              />
            )}
            
            <MobileNav isAuthenticated={true} />
          </div>
        </DockContextProvider>
      </MemoryRouter>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates how dock actions change when navigating between pages:
- **List page**: Default navigation (Recipes, Cookbooks, List, Profile)
- **Detail page**: Contextual actions (Back, Edit, Add, Share)
- **Edit page**: Contextual actions (Cancel, Save)

The hooks automatically clean up when components unmount, returning
the dock to its default state or the next page's contextual state.
        `,
      },
    },
  },
}

/**
 * Shows the action layout (left vs right positioning)
 */
export const ActionPositioning: Story = {
  render: () => (
    <div className="p-6 bg-zinc-900 min-h-screen">
      <h2 className="text-white text-xl font-bold mb-6">Action Positioning</h2>
      
      <div className="space-y-6">
        {/* Detail Actions */}
        <div className="bg-zinc-800 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">Recipe Detail Actions</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <span className="text-zinc-500 text-xs block mb-2">LEFT</span>
              <div className="flex gap-4">
                <div className="flex flex-col items-center text-white/60">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-[10px] mt-1">Back</span>
                </div>
                <div className="flex flex-col items-center text-white/60">
                  <Edit className="h-5 w-5" />
                  <span className="text-[10px] mt-1">Edit</span>
                </div>
              </div>
            </div>
            
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">SJ</span>
            </div>
            
            <div className="text-center">
              <span className="text-zinc-500 text-xs block mb-2">RIGHT</span>
              <div className="flex gap-4">
                <div className="flex flex-col items-center text-white/60">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="text-[10px] mt-1">Add</span>
                </div>
                <div className="flex flex-col items-center text-white/60">
                  <Share className="h-5 w-5" />
                  <span className="text-[10px] mt-1">Share</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Actions */}
        <div className="bg-zinc-800 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">Recipe Edit Actions</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <span className="text-zinc-500 text-xs block mb-2">LEFT</span>
              <div className="flex gap-4">
                <div className="flex flex-col items-center text-white/60">
                  <X className="h-5 w-5" />
                  <span className="text-[10px] mt-1">Cancel</span>
                </div>
              </div>
            </div>
            
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">SJ</span>
            </div>
            
            <div className="text-center">
              <span className="text-zinc-500 text-xs block mb-2">RIGHT</span>
              <div className="flex gap-4">
                <div className="flex flex-col items-center text-white/60">
                  <Save className="h-5 w-5" />
                  <span className="text-[10px] mt-1">Save</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-zinc-500 text-sm mt-6">
        Actions are positioned relative to the center logo. Left actions are typically
        navigation (back, cancel), while right actions are typically operations (save, share, add).
      </p>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Visualizes how actions are positioned in the dock (left vs right of center logo).',
      },
    },
  },
}

/**
 * Interaction test - verify actions are registered
 */
export const VerifyActionsRegistered: Story = {
  render: () => {
    const [logs, setLogs] = useState<string[]>([])
    
    return (
      <MemoryRouter initialEntries={['/recipes/test-recipe']}>
        <DockContextProvider>
          <div className="h-screen w-full bg-zinc-900 relative">
            <RecipeDetailPage 
              recipeId="test-recipe"
              logs={logs}
              setLogs={setLogs}
            />
            <MobileNav isAuthenticated={true} />
          </div>
        </DockContextProvider>
      </MemoryRouter>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Verify contextual actions are displayed
    await expect(canvas.getByText('Back')).toBeInTheDocument()
    await expect(canvas.getByText('Edit')).toBeInTheDocument()
    await expect(canvas.getByText('Add')).toBeInTheDocument()
    await expect(canvas.getByText('Share')).toBeInTheDocument()
    
    // Verify default nav items are NOT displayed
    expect(canvas.queryByText('Recipes')).not.toBeInTheDocument()
    expect(canvas.queryByText('Cookbooks')).not.toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: 'Automated test verifying that contextual actions replace default navigation.',
      },
    },
  },
}

/**
 * Interaction test - click actions trigger handlers
 */
export const ClickActionsTest: Story = {
  render: () => {
    const [logs, setLogs] = useState<string[]>([])
    
    return (
      <MemoryRouter initialEntries={['/recipes/click-test']}>
        <DockContextProvider>
          <div className="h-screen w-full bg-zinc-900 relative">
            <RecipeDetailPage 
              recipeId="click-test"
              logs={logs}
              setLogs={setLogs}
            />
            <MobileNav isAuthenticated={true} />
          </div>
        </DockContextProvider>
      </MemoryRouter>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Click the Add button
    const addButton = canvas.getByText('Add').closest('a')
    if (addButton) {
      await userEvent.click(addButton)
    }
    
    // Click the Share button
    const shareButton = canvas.getByText('Share').closest('a')
    if (shareButton) {
      await userEvent.click(shareButton)
    }
    
    // Verify actions were logged (check the action log)
    await expect(canvas.getByText(/Add to list triggered/)).toBeInTheDocument()
    await expect(canvas.getByText(/Share triggered/)).toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: 'Automated test verifying that clicking dock actions triggers the handlers.',
      },
    },
  },
}
