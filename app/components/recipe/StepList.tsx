/**
 * StepList component.
 *
 * Manages a collection of StepEditorCard instances with:
 * - '+ Add Step' button to add new steps at end
 * - Remove step with confirmation dialog
 * - Empty state handling
 * - Steps array management (controlled component)
 */

import { Plus } from 'lucide-react'
import { useState } from 'react'
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

  return (
    <div>
      {steps.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">No steps yet. Add your first step below.</p>
      ) : (
        <div className="space-y-4 mb-4">
          {steps.map((step) => (
            <StepEditorCard
              key={step.id}
              stepNumber={step.stepNum}
              step={step}
              recipeId={recipeId}
              onSave={(data) => handleStepSave(step.id, data)}
              onRemove={() => handleRemoveStep(step.id)}
              disabled={disabled}
            />
          ))}
        </div>
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
