import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import {
  Pagination,
  PaginationPrevious,
  PaginationNext,
  PaginationList,
  PaginationPage,
  PaginationGap,
} from '../app/components/ui/pagination'

/**
 * # Pagination
 *
 * The humble pagination component. Because sometimes you have more content than
 * fits on one page, and infinite scroll is a crime against humanity (fight me).
 *
 * Pagination is the civilized way to say "there's more where this came from"
 * without making users scroll until their thumb falls off. It's like chapters
 * in a book, except nobody actually reads chapter 47 of your recipe collection.
 *
 * ## The Philosophy of Page Numbers
 *
 * Some say infinite scroll is the future. Those people have never tried to
 * find that one recipe they saw three weeks ago in a sea of endless content.
 * Pagination gives users *landmarks*. "It was on page 5" beats "somewhere between
 * scroll positions 47,382 and 891,203" every time.
 *
 * ## Component Anatomy
 *
 * - **Pagination** - The nav container. It's not much, but it's honest work
 * - **PaginationPrevious** - Goes back. Disabled on page 1 (obviously)
 * - **PaginationNext** - Goes forward. Disabled on the last page (also obviously)
 * - **PaginationList** - Container for page numbers. Hidden on mobile because fat fingers
 * - **PaginationPage** - Individual page buttons. The current one gets highlighted
 * - **PaginationGap** - The ellipsis (...) when there are too many pages to show
 *
 * ## When to Use Pagination
 *
 * - **Search results** - "Found 1,247 recipes for 'easy dinner'"
 * - **Lists and tables** - Recipes, orders, users, whatever you've got
 * - **Archives** - Blog posts, recipe collections, cooking disasters
 *
 * ## When to Consider Alternatives
 *
 * - **Short lists** - If it fits on one page, don't paginate it. That's just weird
 * - **Real-time feeds** - Social media style? Maybe infinite scroll is okay there
 * - **Sequential content** - If users need to read everything in order, maybe just show it all
 */
const meta: Meta<typeof Pagination> = {
  title: 'UI/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A pagination component for navigating through multi-page content.

Built with accessible navigation semantics, Previous/Next buttons, individual page links,
and gap indicators for large page counts. Responsive by default - page numbers hide on mobile.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    'aria-label': {
      control: 'text',
      description: 'Accessible label for the navigation. Defaults to "Page navigation".',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// HELPER COMPONENT
// =============================================================================

/**
 * A wrapper that simulates stateful pagination.
 * Because clicking page 3 should actually do something.
 */
function PaginationDemo({
  totalPages,
  initialPage = 1,
  showGaps = false,
}: {
  totalPages: number
  initialPage?: number
  showGaps?: boolean
}) {
  const [currentPage, setCurrentPage] = useState(initialPage)

  // Build the href for a page
  const pageHref = (page: number) => `#page-${page}`

  // Determine which pages to show
  const getVisiblePages = () => {
    if (!showGaps || totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Show: 1 ... current-1, current, current+1 ... last
    const pages: (number | 'gap')[] = []

    // Always show first page
    pages.push(1)

    // Gap after first if needed
    if (currentPage > 3) {
      pages.push('gap')
    }

    // Pages around current
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }

    // Gap before last if needed
    if (currentPage < totalPages - 2) {
      pages.push('gap')
    }

    // Always show last page
    if (!pages.includes(totalPages)) {
      pages.push(totalPages)
    }

    return pages
  }

  const handlePageClick = (page: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentPage(page)
  }

  return (
    <Pagination>
      <PaginationPrevious
        href={currentPage > 1 ? pageHref(currentPage - 1) : null}
        onClick={currentPage > 1 ? handlePageClick(currentPage - 1) : undefined}
      />
      <PaginationList>
        {getVisiblePages().map((page, index) =>
          page === 'gap' ? (
            <PaginationGap key={`gap-${index}`} />
          ) : (
            <PaginationPage
              key={page}
              href={pageHref(page)}
              current={page === currentPage}
              onClick={handlePageClick(page)}
            >
              {page}
            </PaginationPage>
          )
        )}
      </PaginationList>
      <PaginationNext
        href={currentPage < totalPages ? pageHref(currentPage + 1) : null}
        onClick={currentPage < totalPages ? handlePageClick(currentPage + 1) : undefined}
      />
    </Pagination>
  )
}

// =============================================================================
// BASIC STORIES
// =============================================================================

/**
 * The default pagination. A Previous button, some page numbers, and a Next button.
 * It's not rocket science, but it gets the job done.
 */
export const Default: Story = {
  render: () => <PaginationDemo totalPages={5} />,
}

/**
 * When you're on page 1, the Previous button is disabled.
 * Because going to page 0 is a philosophical problem we're not equipped to solve.
 */
export const OnFirstPage: Story = {
  render: () => <PaginationDemo totalPages={5} initialPage={1} />,
  parameters: {
    docs: {
      description: {
        story: 'Previous is disabled on page 1. There is no page 0. We checked.',
      },
    },
  },
}

/**
 * When you're on the last page, the Next button is disabled.
 * The content has ended. Go touch grass or something.
 */
export const OnLastPage: Story = {
  render: () => <PaginationDemo totalPages={5} initialPage={5} />,
  parameters: {
    docs: {
      description: {
        story: "Next is disabled on the last page. You've seen everything. Congratulations?",
      },
    },
  },
}

/**
 * Somewhere in the middle. Both Previous and Next are active.
 * This is the pagination sweet spot.
 */
export const OnMiddlePage: Story = {
  render: () => <PaginationDemo totalPages={5} initialPage={3} />,
  parameters: {
    docs: {
      description: {
        story: 'Middle page with both navigation arrows active. Living the dream.',
      },
    },
  },
}

// =============================================================================
// PAGE COUNT VARIANTS
// =============================================================================

/**
 * ## Single Page
 *
 * One page. Both arrows disabled. Is this even pagination?
 * Technically yes, but also... why?
 */
export const SinglePage: Story = {
  render: () => <PaginationDemo totalPages={1} />,
  parameters: {
    docs: {
      description: {
        story: "One page. The loneliest pagination. Maybe don't show this at all?",
      },
    },
  },
}

/**
 * ## Two Pages
 *
 * The binary pagination. It's either this page or that page.
 * Simple. Elegant. Like a light switch.
 */
export const TwoPages: Story = {
  render: () => <PaginationDemo totalPages={2} />,
  parameters: {
    docs: {
      description: {
        story: 'Two pages. The coin flip of pagination.',
      },
    },
  },
}

/**
 * ## Many Pages
 *
 * When you have lots of content. The gap indicators (ellipsis) help
 * users understand there's more without showing 50 page buttons.
 */
export const ManyPages: Story = {
  render: () => <PaginationDemo totalPages={20} initialPage={10} showGaps />,
  parameters: {
    docs: {
      description: {
        story: 'Many pages with gaps. The ellipsis says "trust us, there are more pages in between."',
      },
    },
  },
}

/**
 * ## Even More Pages
 *
 * For when your recipe collection has gotten *out of hand*.
 * Starting near the beginning to show the gap logic.
 */
export const LotsOfPages: Story = {
  render: () => <PaginationDemo totalPages={100} initialPage={3} showGaps />,
  parameters: {
    docs: {
      description: {
        story: '100 pages. Someone has been busy cooking (or hoarding recipes).',
      },
    },
  },
}

/**
 * ## Gap at the End
 *
 * Navigating from the beginning of a long list.
 * The gap appears before the last page.
 */
export const GapAtEnd: Story = {
  render: () => <PaginationDemo totalPages={50} initialPage={2} showGaps />,
  parameters: {
    docs: {
      description: {
        story: 'Early pages with gap before the end. The journey has just begun.',
      },
    },
  },
}

/**
 * ## Gap at the Start
 *
 * Navigating near the end of a long list.
 * The gap appears after the first page.
 */
export const GapAtStart: Story = {
  render: () => <PaginationDemo totalPages={50} initialPage={48} showGaps />,
  parameters: {
    docs: {
      description: {
        story: 'Late pages with gap after the start. Almost done!',
      },
    },
  },
}

/**
 * ## Gaps on Both Sides
 *
 * The classic middle-of-nowhere pagination.
 * Gaps on both sides because you're far from both ends.
 */
export const GapsBothSides: Story = {
  render: () => <PaginationDemo totalPages={50} initialPage={25} showGaps />,
  parameters: {
    docs: {
      description: {
        story: 'Gaps on both sides. You are here. The edges are far away.',
      },
    },
  },
}

// =============================================================================
// STATIC EXAMPLES (for visual reference)
// =============================================================================

/**
 * ## Static Previous Only
 *
 * Sometimes you just need Previous and Next without page numbers.
 * Simpler, but users lose the ability to jump to specific pages.
 */
export const PreviousNextOnly: Story = {
  render: () => (
    <Pagination>
      <PaginationPrevious href="#prev" />
      <PaginationNext href="#next" />
    </Pagination>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Just Previous and Next. Minimalist pagination for when page numbers are overkill.',
      },
    },
  },
}

/**
 * ## Disabled Previous
 *
 * Pass `href={null}` to disable a navigation button.
 */
export const DisabledPrevious: Story = {
  render: () => (
    <Pagination>
      <PaginationPrevious href={null} />
      <PaginationNext href="#next" />
    </Pagination>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Previous disabled via `href={null}`. You have reached the beginning.',
      },
    },
  },
}

/**
 * ## Disabled Next
 *
 * The end of the line. Nothing more to see here.
 */
export const DisabledNext: Story = {
  render: () => (
    <Pagination>
      <PaginationPrevious href="#prev" />
      <PaginationNext href={null} />
    </Pagination>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Next disabled. You have reached the end. Touch grass.',
      },
    },
  },
}

/**
 * ## Custom Button Text
 *
 * Don't like "Previous" and "Next"? Change them!
 * Just pass children to override the defaults.
 */
export const CustomButtonText: Story = {
  render: () => (
    <Pagination>
      <PaginationPrevious href="#prev">Older</PaginationPrevious>
      <PaginationList>
        <PaginationPage href="#1">1</PaginationPage>
        <PaginationPage href="#2" current>
          2
        </PaginationPage>
        <PaginationPage href="#3">3</PaginationPage>
      </PaginationList>
      <PaginationNext href="#next">Newer</PaginationNext>
    </Pagination>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom text for prev/next. "Older/Newer" for blogs, "Back/Forward" for wizards, whatever you need.',
      },
    },
  },
}

/**
 * ## With Gap Component
 *
 * The PaginationGap component renders an ellipsis to indicate hidden pages.
 * Customize the content if you really want to, but the default is fine.
 */
export const WithGap: Story = {
  render: () => (
    <Pagination>
      <PaginationPrevious href="#prev" />
      <PaginationList>
        <PaginationPage href="#1">1</PaginationPage>
        <PaginationGap />
        <PaginationPage href="#5">5</PaginationPage>
        <PaginationPage href="#6" current>
          6
        </PaginationPage>
        <PaginationPage href="#7">7</PaginationPage>
        <PaginationGap />
        <PaginationPage href="#20">20</PaginationPage>
      </PaginationList>
      <PaginationNext href="#next" />
    </Pagination>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Gaps (ellipsis) indicate there are pages between the visible ones. Mystery pages. Spooky.',
      },
    },
  },
}

// =============================================================================
// RESPONSIVE BEHAVIOR
// =============================================================================

/**
 * ## Responsive Design
 *
 * On mobile, the page numbers hide (via `sm:flex`). Users get just
 * Previous and Next buttons, which is actually fine for touch interfaces.
 * They can always tap through if they need to.
 *
 * Resize your browser to see it in action.
 */
export const ResponsiveBehavior: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
        Resize your browser! Page numbers hide on mobile.
      </p>
      <PaginationDemo totalPages={10} initialPage={5} showGaps />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'PaginationList uses `hidden sm:flex` - page numbers vanish on mobile. Try resizing!',
      },
    },
  },
}

// =============================================================================
// ACCESSIBILITY
// =============================================================================

/**
 * ## Accessible Navigation
 *
 * The pagination nav has `aria-label="Page navigation"` by default.
 * Each page button has `aria-label="Page X"` and the current page
 * gets `aria-current="page"`. Screen readers love it.
 */
export const AccessiblePagination: Story = {
  render: () => (
    <Pagination aria-label="Recipe list pagination">
      <PaginationPrevious href="#prev" />
      <PaginationList>
        <PaginationPage href="#1">1</PaginationPage>
        <PaginationPage href="#2" current>
          2
        </PaginationPage>
        <PaginationPage href="#3">3</PaginationPage>
      </PaginationList>
      <PaginationNext href="#next" />
    </Pagination>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Custom aria-label on the nav. Pages have proper labeling. Screen reader users can navigate with confidence.',
      },
    },
  },
}

// =============================================================================
// INTERACTION TESTS
// =============================================================================

/**
 * Tests clicking the Next button advances the page.
 */
export const NextPageInteraction: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    const totalPages = 5

    return (
      <Pagination>
        <PaginationPrevious
          href={page > 1 ? `#page-${page - 1}` : null}
          onClick={
            page > 1
              ? (e) => {
                  e.preventDefault()
                  setPage(page - 1)
                }
              : undefined
          }
        />
        <PaginationList>
          {[1, 2, 3, 4, 5].map((p) => (
            <PaginationPage
              key={p}
              href={`#page-${p}`}
              current={p === page}
              data-testid={`page-${p}`}
              onClick={(e) => {
                e.preventDefault()
                setPage(p)
              }}
            >
              {p}
            </PaginationPage>
          ))}
        </PaginationList>
        <PaginationNext
          href={page < totalPages ? `#page-${page + 1}` : null}
          onClick={
            page < totalPages
              ? (e) => {
                  e.preventDefault()
                  setPage(page + 1)
                }
              : undefined
          }
        />
      </Pagination>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify we start on page 1
    const page1 = canvas.getByTestId('page-1')
    await expect(page1).toHaveAttribute('aria-current', 'page')

    // Click Next
    const nextButton = canvas.getByLabelText('Next page')
    await userEvent.click(nextButton)

    // Verify page 2 is now current
    const page2 = canvas.getByTestId('page-2')
    await expect(page2).toHaveAttribute('aria-current', 'page')

    // Page 1 should no longer be current
    await expect(page1).not.toHaveAttribute('aria-current')
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests clicking Next advances to the next page.',
      },
    },
  },
}

/**
 * Tests clicking the Previous button goes back a page.
 */
export const PreviousPageInteraction: Story = {
  render: () => {
    const [page, setPage] = useState(3)
    const totalPages = 5

    return (
      <Pagination>
        <PaginationPrevious
          href={page > 1 ? `#page-${page - 1}` : null}
          onClick={
            page > 1
              ? (e) => {
                  e.preventDefault()
                  setPage(page - 1)
                }
              : undefined
          }
        />
        <PaginationList>
          {[1, 2, 3, 4, 5].map((p) => (
            <PaginationPage
              key={p}
              href={`#page-${p}`}
              current={p === page}
              data-testid={`page-${p}`}
              onClick={(e) => {
                e.preventDefault()
                setPage(p)
              }}
            >
              {p}
            </PaginationPage>
          ))}
        </PaginationList>
        <PaginationNext
          href={page < totalPages ? `#page-${page + 1}` : null}
          onClick={
            page < totalPages
              ? (e) => {
                  e.preventDefault()
                  setPage(page + 1)
                }
              : undefined
          }
        />
      </Pagination>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify we start on page 3
    const page3 = canvas.getByTestId('page-3')
    await expect(page3).toHaveAttribute('aria-current', 'page')

    // Click Previous
    const prevButton = canvas.getByLabelText('Previous page')
    await userEvent.click(prevButton)

    // Verify page 2 is now current
    const page2 = canvas.getByTestId('page-2')
    await expect(page2).toHaveAttribute('aria-current', 'page')

    // Page 3 should no longer be current
    await expect(page3).not.toHaveAttribute('aria-current')
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests clicking Previous goes back a page.',
      },
    },
  },
}

/**
 * Tests clicking a specific page number jumps directly to that page.
 */
export const DirectPageNavigation: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    const totalPages = 5

    return (
      <Pagination>
        <PaginationPrevious
          href={page > 1 ? `#page-${page - 1}` : null}
          onClick={
            page > 1
              ? (e) => {
                  e.preventDefault()
                  setPage(page - 1)
                }
              : undefined
          }
        />
        <PaginationList>
          {[1, 2, 3, 4, 5].map((p) => (
            <PaginationPage
              key={p}
              href={`#page-${p}`}
              current={p === page}
              data-testid={`page-${p}`}
              onClick={(e) => {
                e.preventDefault()
                setPage(p)
              }}
            >
              {p}
            </PaginationPage>
          ))}
        </PaginationList>
        <PaginationNext
          href={page < totalPages ? `#page-${page + 1}` : null}
          onClick={
            page < totalPages
              ? (e) => {
                  e.preventDefault()
                  setPage(page + 1)
                }
              : undefined
          }
        />
      </Pagination>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify we start on page 1
    const page1 = canvas.getByTestId('page-1')
    await expect(page1).toHaveAttribute('aria-current', 'page')

    // Click directly on page 4
    const page4 = canvas.getByTestId('page-4')
    await userEvent.click(page4)

    // Verify page 4 is now current
    await expect(page4).toHaveAttribute('aria-current', 'page')

    // Page 1 should no longer be current
    await expect(page1).not.toHaveAttribute('aria-current')

    // Jump back to page 2
    const page2 = canvas.getByTestId('page-2')
    await userEvent.click(page2)

    // Verify page 2 is current
    await expect(page2).toHaveAttribute('aria-current', 'page')
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests clicking page numbers directly jumps to that page.',
      },
    },
  },
}

/**
 * Tests keyboard navigation through pagination.
 */
export const KeyboardNavigation: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    const totalPages = 5

    return (
      <Pagination>
        <PaginationPrevious
          href={page > 1 ? `#page-${page - 1}` : null}
          onClick={
            page > 1
              ? (e) => {
                  e.preventDefault()
                  setPage(page - 1)
                }
              : undefined
          }
          data-testid="prev-button"
        />
        <PaginationList>
          {[1, 2, 3, 4, 5].map((p) => (
            <PaginationPage
              key={p}
              href={`#page-${p}`}
              current={p === page}
              data-testid={`page-${p}`}
              onClick={(e) => {
                e.preventDefault()
                setPage(p)
              }}
            >
              {p}
            </PaginationPage>
          ))}
        </PaginationList>
        <PaginationNext
          href={page < totalPages ? `#page-${page + 1}` : null}
          onClick={
            page < totalPages
              ? (e) => {
                  e.preventDefault()
                  setPage(page + 1)
                }
              : undefined
          }
          data-testid="next-button"
        />
      </Pagination>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Tab to the first focusable element (Previous button, which is disabled)
    await userEvent.tab()

    // Tab to page 1
    await userEvent.tab()
    const page1 = canvas.getByTestId('page-1')
    await expect(page1.closest('a, button')).toHaveFocus()

    // Press Enter to activate
    await userEvent.keyboard('{Enter}')

    // Tab to page 2 and activate
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')

    // Verify page 2 is current
    const page2 = canvas.getByTestId('page-2')
    await expect(page2).toHaveAttribute('aria-current', 'page')
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests keyboard navigation: Tab to move between elements, Enter to activate.',
      },
    },
  },
}

/**
 * Tests that Previous is disabled on the first page.
 */
export const DisabledPreviousInteraction: Story = {
  render: () => (
    <Pagination>
      <PaginationPrevious href={null} data-testid="prev-button" />
      <PaginationList>
        <PaginationPage href="#1" current data-testid="page-1">
          1
        </PaginationPage>
        <PaginationPage href="#2" data-testid="page-2">
          2
        </PaginationPage>
        <PaginationPage href="#3" data-testid="page-3">
          3
        </PaginationPage>
      </PaginationList>
      <PaginationNext href="#2" data-testid="next-button" />
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find the Previous button (it's wrapped in a span, button is inside)
    const prevButton = canvas.getByLabelText('Previous page')

    // Verify it's disabled
    await expect(prevButton).toBeDisabled()

    // Verify page 1 is current
    const page1 = canvas.getByTestId('page-1')
    await expect(page1).toHaveAttribute('aria-current', 'page')
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests that the Previous button is disabled when on the first page.',
      },
    },
  },
}

/**
 * Tests that Next is disabled on the last page.
 */
export const DisabledNextInteraction: Story = {
  render: () => (
    <Pagination>
      <PaginationPrevious href="#2" data-testid="prev-button" />
      <PaginationList>
        <PaginationPage href="#1" data-testid="page-1">
          1
        </PaginationPage>
        <PaginationPage href="#2" data-testid="page-2">
          2
        </PaginationPage>
        <PaginationPage href="#3" current data-testid="page-3">
          3
        </PaginationPage>
      </PaginationList>
      <PaginationNext href={null} data-testid="next-button" />
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find the Next button
    const nextButton = canvas.getByLabelText('Next page')

    // Verify it's disabled
    await expect(nextButton).toBeDisabled()

    // Verify page 3 is current
    const page3 = canvas.getByTestId('page-3')
    await expect(page3).toHaveAttribute('aria-current', 'page')
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests that the Next button is disabled when on the last page.',
      },
    },
  },
}

/**
 * Tests navigating through multiple pages in sequence.
 */
export const SequentialNavigation: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    const totalPages = 5

    return (
      <Pagination>
        <PaginationPrevious
          href={page > 1 ? `#page-${page - 1}` : null}
          onClick={
            page > 1
              ? (e) => {
                  e.preventDefault()
                  setPage(page - 1)
                }
              : undefined
          }
        />
        <PaginationList>
          {[1, 2, 3, 4, 5].map((p) => (
            <PaginationPage
              key={p}
              href={`#page-${p}`}
              current={p === page}
              data-testid={`page-${p}`}
              onClick={(e) => {
                e.preventDefault()
                setPage(p)
              }}
            >
              {p}
            </PaginationPage>
          ))}
        </PaginationList>
        <PaginationNext
          href={page < totalPages ? `#page-${page + 1}` : null}
          onClick={
            page < totalPages
              ? (e) => {
                  e.preventDefault()
                  setPage(page + 1)
                }
              : undefined
          }
        />
      </Pagination>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Start on page 1
    const page1 = canvas.getByTestId('page-1')
    await expect(page1).toHaveAttribute('aria-current', 'page')

    const nextButton = canvas.getByLabelText('Next page')
    const prevButton = canvas.getByLabelText('Previous page')

    // Navigate through all pages using Next
    await userEvent.click(nextButton) // -> page 2
    await expect(canvas.getByTestId('page-2')).toHaveAttribute('aria-current', 'page')

    await userEvent.click(nextButton) // -> page 3
    await expect(canvas.getByTestId('page-3')).toHaveAttribute('aria-current', 'page')

    await userEvent.click(nextButton) // -> page 4
    await expect(canvas.getByTestId('page-4')).toHaveAttribute('aria-current', 'page')

    await userEvent.click(nextButton) // -> page 5
    await expect(canvas.getByTestId('page-5')).toHaveAttribute('aria-current', 'page')

    // Navigate back using Previous
    await userEvent.click(prevButton) // -> page 4
    await expect(canvas.getByTestId('page-4')).toHaveAttribute('aria-current', 'page')

    await userEvent.click(prevButton) // -> page 3
    await expect(canvas.getByTestId('page-3')).toHaveAttribute('aria-current', 'page')
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests navigating through multiple pages in sequence using Next and Previous.',
      },
    },
  },
}
