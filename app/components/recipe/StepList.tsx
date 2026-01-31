/**
 * StepList component.
 *
 * Manages a collection of StepEditorCard instances with:
 * - '+ Add Step' button to add new steps at end
 * - Remove step with confirmation dialog
 * - Drag-to-reorder with Framer Motion
 * - Up/down buttons for accessible reordering
 * - Empty state handling
 * - Steps array management (controlled component)
 */

import { Reorder } from 'framer-motion'
import { GripVertical, Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogActions, DialogDescription, DialogTitle } from '~/components/ui/dialog'
import { StepEditorCard, type StepData } from './StepEditorCard'

export interface StepListProps {
  steps: StepData[]
  recipeId: string
  onChange: (steps: StepData[]) => void
  disabled?: boolean
}

export function StepList({ steps, recipeId, onChange, disabled = false }: StepListProps) {
  const [stepToRemove, setStepToRemove] = useState<string | null>(null)

  const handleAddStep = () => {
    const newStep: StepData = {
      id: `step-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      stepNum: steps.length + 1,
      description: '',
      ingredients: [],
    }
    onChange([...steps, newStep])
  }

  const handleRemoveStep = (stepId: string) => {
    setStepToRemove(stepId)
  }

  const confirmRemove = () => {
    if (!stepToRemove) return

    const newSteps = steps
      .filter((step) => step.id !== stepToRemove)
      .map((step, index) => ({
        ...step,
        stepNum: index + 1,
      }))
    onChange(newSteps)
    setStepToRemove(null)
  }

  const cancelRemove = () => {
    setStepToRemove(null)
  }

  const handleStepSave = (stepId: string, data: Omit<StepData, 'id' | 'stepNum'>) => {
    const newSteps = steps.map((step) =>
      step.id === stepId ? { ...step, ...data } : step
    )
    onChange(newSteps)
  }

  // Renumber steps after reorder and call onChange
  const handleReorder = useCallback(
    (newOrder: StepData[]) => {
      const renumberedSteps = newOrder.map((step, index) => ({
        ...step,
        stepNum: index + 1,
      }))
      onChange(renumberedSteps)
    },
    [onChange]
  )

  // Move step up in list
  const handleMoveUp = useCallback(
    (index: number) => {
      if (index <= 0) return
      const newSteps = [...steps]
      const temp = newSteps[index]
      newSteps[index] = newSteps[index - 1]
      newSteps[index - 1] = temp
      handleReorder(newSteps)
    },
    [steps, handleReorder]
  )

  // Move step down in list
  const handleMoveDown = useCallback(
    (index: number) => {
      if (index >= steps.length - 1) return
      const newSteps = [...steps]
      const temp = newSteps[index]
      newSteps[index] = newSteps[index + 1]
      newSteps[index + 1] = temp
      handleReorder(newSteps)
    },
    [steps, handleReorder]
  )

  // Handle keyboard reorder on drag handle
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          handleMoveUp(index)
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          handleMoveDown(index)
        }
      }
    },
    [handleMoveUp, handleMoveDown]
  )

  return (
    <div>
      {steps.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">No steps yet. Add your first step below.</p>
      ) : (
        <Reorder.Group
          axis="y"
          values={steps}
          onReorder={handleReorder}
          className="space-y-4 mb-4"
        >
          {steps.map((step, index) => (
            <Reorder.Item
              key={step.id}
              value={step}
              dragListener={false}
            >
              <StepEditorCard
                stepNumber={step.stepNum}
                step={step}
                recipeId={recipeId}
                onSave={(data) => handleStepSave(step.id, data)}
                onRemove={() => handleRemoveStep(step.id)}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                canMoveUp={index > 0}
                canMoveDown={index < steps.length - 1}
                disabled={disabled}
                dragHandle={
                  <button
                    type="button"
                    aria-label="Drag to reorder"
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    <GripVertical className="h-5 w-5" />
                  </button>
                }
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <Button
        type="button"
        onClick={handleAddStep}
        disabled={disabled}
        outline
      >
        <Plus data-slot="icon" />
        Add Step
      </Button>

      {/* Confirmation dialog for step removal */}
      <Dialog open={stepToRemove !== null} onClose={cancelRemove} role="alertdialog">
        <DialogTitle>Remove Step</DialogTitle>
        <DialogDescription>
          Are you sure you want to remove this step? This action cannot be undone.
        </DialogDescription>
        <DialogActions>
          <Button outline onClick={cancelRemove}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmRemove}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
