# Storybook Reorganization Plan

## Overview

Reorganize flat `stories/` directory into logical groupings to improve discoverability and navigation.

## Target Structure

```
stories/
├── Recipe/
│   ├── Input/                      # Creating and editing recipes
│   │   ├── RecipeForm.stories.tsx
│   │   ├── RecipeImageUpload.stories.tsx
│   │   ├── IngredientInputToggle.stories.tsx
│   │   ├── IngredientParseInput.stories.tsx
│   │   ├── ManualIngredientInput.stories.tsx
│   │   ├── ParsedIngredientList.stories.tsx
│   │   └── ParsedIngredientRow.stories.tsx
│   │
│   └── View/                       # Displaying recipes
│       ├── RecipeView.stories.tsx
│       ├── RecipeHeader.stories.tsx
│       ├── StepCard.stories.tsx
│       ├── StepOutputUseCallout.stories.tsx
│       ├── StepOutputUseDisplay.stories.tsx
│       ├── IngredientList.stories.tsx
│       ├── ScaleSelector.stories.tsx
│       └── ScaledQuantity.stories.tsx
│
├── Layout/                         # Layout components
│   ├── StackedLayout.stories.tsx
│   ├── SidebarLayout.stories.tsx
│   ├── Sidebar.stories.tsx
│   ├── Navbar.stories.tsx
│   ├── MobileNav.stories.tsx
│   └── AuthLayout.stories.tsx
│
├── Navigation/                     # Navigation components
│   ├── SpoonDock.stories.tsx
│   ├── DockCenter.stories.tsx
│   ├── DockContext.stories.tsx
│   ├── DockIndicator.stories.tsx
│   ├── DockItem.stories.tsx
│   ├── QuickActions.stories.tsx
│   └── UseRecipeDockActions.stories.tsx
│
├── Form/                           # Form components
│   ├── Input.stories.tsx
│   ├── Textarea.stories.tsx
│   ├── Select.stories.tsx
│   ├── Listbox.stories.tsx
│   ├── Combobox.stories.tsx
│   ├── Checkbox.stories.tsx
│   ├── Radio.stories.tsx
│   ├── Switch.stories.tsx
│   ├── Fieldset.stories.tsx
│   └── ValidationError.stories.tsx
│
├── Feedback/                       # Feedback components
│   ├── Alert.stories.tsx
│   ├── Dialog.stories.tsx
│   └── ConfirmationDialog.stories.tsx
│
├── Data/                           # Data display components
│   ├── Table.stories.tsx
│   ├── DescriptionList.stories.tsx
│   └── Pagination.stories.tsx
│
├── UI/                             # Basic UI components
│   ├── Button.stories.tsx
│   ├── Link.stories.tsx
│   ├── Badge.stories.tsx
│   ├── Avatar.stories.tsx
│   ├── Dropdown.stories.tsx
│   ├── Divider.stories.tsx
│   ├── Heading.stories.tsx
│   └── Text.stories.tsx
│
├── Brand/                          # Brand components
│   ├── SpoonjoyLogo.stories.tsx
│   └── ThemeToggle.stories.tsx
│
├── Auth/                           # Authentication
│   └── OAuth.stories.tsx
│
└── _Dev/                           # Development/testing only
    └── TailwindTest.stories.tsx
```

## Move Mapping

| Current Path | New Path | Category |
|-------------|----------|----------|
| `IngredientInputToggle.stories.tsx` | `Recipe/Input/IngredientInputToggle.stories.tsx` | Recipe Input |
| `IngredientParseInput.stories.tsx` | `Recipe/Input/IngredientParseInput.stories.tsx` | Recipe Input |
| `ManualIngredientInput.stories.tsx` | `Recipe/Input/ManualIngredientInput.stories.tsx` | Recipe Input |
| `ParsedIngredientList.stories.tsx` | `Recipe/Input/ParsedIngredientList.stories.tsx` | Recipe Input |
| `ParsedIngredientRow.stories.tsx` | `Recipe/Input/ParsedIngredientRow.stories.tsx` | Recipe Input |
| `RecipeForm.stories.tsx` | `Recipe/Input/RecipeForm.stories.tsx` | Recipe Input |
| `RecipeImageUpload.stories.tsx` | `Recipe/Input/RecipeImageUpload.stories.tsx` | Recipe Input |
| `IngredientList.stories.tsx` | `Recipe/View/IngredientList.stories.tsx` | Recipe View |
| `RecipeHeader.stories.tsx` | `Recipe/View/RecipeHeader.stories.tsx` | Recipe View |
| `RecipeView.stories.tsx` | `Recipe/View/RecipeView.stories.tsx` | Recipe View |
| `ScaleSelector.stories.tsx` | `Recipe/View/ScaleSelector.stories.tsx` | Recipe View |
| `ScaledQuantity.stories.tsx` | `Recipe/View/ScaledQuantity.stories.tsx` | Recipe View |
| `StepCard.stories.tsx` | `Recipe/View/StepCard.stories.tsx` | Recipe View |
| `StepOutputUseCallout.stories.tsx` | `Recipe/View/StepOutputUseCallout.stories.tsx` | Recipe View |
| `StepOutputUseDisplay.stories.tsx` | `Recipe/View/StepOutputUseDisplay.stories.tsx` | Recipe View |
| `AuthLayout.stories.tsx` | `Layout/AuthLayout.stories.tsx` | Layout |
| `MobileNav.stories.tsx` | `Layout/MobileNav.stories.tsx` | Layout |
| `Navbar.stories.tsx` | `Layout/Navbar.stories.tsx` | Layout |
| `Sidebar.stories.tsx` | `Layout/Sidebar.stories.tsx` | Layout |
| `SidebarLayout.stories.tsx` | `Layout/SidebarLayout.stories.tsx` | Layout |
| `StackedLayout.stories.tsx` | `Layout/StackedLayout.stories.tsx` | Layout |
| `DockCenter.stories.tsx` | `Navigation/DockCenter.stories.tsx` | Navigation |
| `DockContext.stories.tsx` | `Navigation/DockContext.stories.tsx` | Navigation |
| `DockIndicator.stories.tsx` | `Navigation/DockIndicator.stories.tsx` | Navigation |
| `DockItem.stories.tsx` | `Navigation/DockItem.stories.tsx` | Navigation |
| `QuickActions.stories.tsx` | `Navigation/QuickActions.stories.tsx` | Navigation |
| `SpoonDock.stories.tsx` | `Navigation/SpoonDock.stories.tsx` | Navigation |
| `UseRecipeDockActions.stories.tsx` | `Navigation/UseRecipeDockActions.stories.tsx` | Navigation |
| `Checkbox.stories.tsx` | `Form/Checkbox.stories.tsx` | Form |
| `Combobox.stories.tsx` | `Form/Combobox.stories.tsx` | Form |
| `Fieldset.stories.tsx` | `Form/Fieldset.stories.tsx` | Form |
| `Input.stories.tsx` | `Form/Input.stories.tsx` | Form |
| `Listbox.stories.tsx` | `Form/Listbox.stories.tsx` | Form |
| `Radio.stories.tsx` | `Form/Radio.stories.tsx` | Form |
| `Select.stories.tsx` | `Form/Select.stories.tsx` | Form |
| `Switch.stories.tsx` | `Form/Switch.stories.tsx` | Form |
| `Textarea.stories.tsx` | `Form/Textarea.stories.tsx` | Form |
| `ValidationError.stories.tsx` | `Form/ValidationError.stories.tsx` | Form |
| `Alert.stories.tsx` | `Feedback/Alert.stories.tsx` | Feedback |
| `ConfirmationDialog.stories.tsx` | `Feedback/ConfirmationDialog.stories.tsx` | Feedback |
| `Dialog.stories.tsx` | `Feedback/Dialog.stories.tsx` | Feedback |
| `DescriptionList.stories.tsx` | `Data/DescriptionList.stories.tsx` | Data |
| `Pagination.stories.tsx` | `Data/Pagination.stories.tsx` | Data |
| `Table.stories.tsx` | `Data/Table.stories.tsx` | Data |
| `Avatar.stories.tsx` | `UI/Avatar.stories.tsx` | UI |
| `Badge.stories.tsx` | `UI/Badge.stories.tsx` | UI |
| `Button.stories.tsx` | `UI/Button.stories.tsx` | UI |
| `Divider.stories.tsx` | `UI/Divider.stories.tsx` | UI |
| `Dropdown.stories.tsx` | `UI/Dropdown.stories.tsx` | UI |
| `Heading.stories.tsx` | `UI/Heading.stories.tsx` | UI |
| `Link.stories.tsx` | `UI/Link.stories.tsx` | UI |
| `Text.stories.tsx` | `UI/Text.stories.tsx` | UI |
| `SpoonjoyLogo.stories.tsx` | `Brand/SpoonjoyLogo.stories.tsx` | Brand |
| `ThemeToggle.stories.tsx` | `Brand/ThemeToggle.stories.tsx` | Brand |
| `OAuth.stories.tsx` | `Auth/OAuth.stories.tsx` | Auth |
| `TailwindTest.stories.tsx` | `_Dev/TailwindTest.stories.tsx` | Dev |

## Summary by Category

| Category | Count |
|----------|-------|
| Recipe/Input | 7 |
| Recipe/View | 8 |
| Layout | 6 |
| Navigation | 7 |
| Form | 10 |
| Feedback | 3 |
| Data | 3 |
| UI | 8 |
| Brand | 2 |
| Auth | 1 |
| _Dev | 1 |
| **Total** | **56** |

## Notes

1. **Recipe stories** are split into Input (creating/editing) and View (displaying) to match the target structure
2. **Future additions**: RecipeBuilder, StepList, StepEditorCard, and StepDependencySelector will go in Recipe/Input
3. **Storybook title paths** will need updating in each file to match new locations (e.g., `title: 'Recipe/Input/RecipeForm'`)
4. **_Dev prefix** keeps development/test stories sorted to bottom of sidebar
