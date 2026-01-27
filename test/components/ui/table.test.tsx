import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '~/components/ui/table'

describe('Table', () => {
  describe('Table component', () => {
    it('renders as a table element', () => {
      render(
        <Table data-testid="table-wrapper">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const wrapper = screen.getByTestId('table-wrapper')
      const table = wrapper.querySelector('table')
      expect(table).toBeInTheDocument()
    })

    it('renders children', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      expect(screen.getByText('Cell Content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Table className="custom-table" data-testid="table-wrapper">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const wrapper = screen.getByTestId('table-wrapper')
      expect(wrapper).toHaveClass('custom-table')
    })

    it('applies overflow and whitespace classes', () => {
      render(
        <Table data-testid="table-wrapper">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const wrapper = screen.getByTestId('table-wrapper')
      expect(wrapper.className).toContain('overflow-x-auto')
      expect(wrapper.className).toContain('whitespace-nowrap')
    })

    it('passes additional props to wrapper div', () => {
      render(
        <Table data-testid="table-wrapper" id="my-table" aria-label="Data table">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const wrapper = screen.getByTestId('table-wrapper')
      expect(wrapper).toHaveAttribute('id', 'my-table')
      expect(wrapper).toHaveAttribute('aria-label', 'Data table')
    })

    it('renders table with text styling', () => {
      render(
        <Table data-testid="table-wrapper">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const wrapper = screen.getByTestId('table-wrapper')
      const table = wrapper.querySelector('table')
      expect(table?.className).toContain('text-left')
      expect(table?.className).toContain('text-sm/6')
    })
  })

  describe('TableHead component', () => {
    it('renders as a thead element', () => {
      render(
        <table>
          <TableHead data-testid="thead">
            <tr>
              <th>Header</th>
            </tr>
          </TableHead>
        </table>
      )
      const thead = screen.getByTestId('thead')
      expect(thead.tagName).toBe('THEAD')
    })

    it('renders children', () => {
      render(
        <table>
          <TableHead>
            <tr>
              <th>Header Text</th>
            </tr>
          </TableHead>
        </table>
      )
      expect(screen.getByText('Header Text')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <table>
          <TableHead className="custom-head" data-testid="thead">
            <tr>
              <th>Header</th>
            </tr>
          </TableHead>
        </table>
      )
      const thead = screen.getByTestId('thead')
      expect(thead).toHaveClass('custom-head')
    })

    it('applies default text color classes', () => {
      render(
        <table>
          <TableHead data-testid="thead">
            <tr>
              <th>Header</th>
            </tr>
          </TableHead>
        </table>
      )
      const thead = screen.getByTestId('thead')
      expect(thead.className).toContain('text-zinc-500')
    })

    it('passes additional props to thead element', () => {
      render(
        <table>
          <TableHead data-testid="thead" id="my-thead">
            <tr>
              <th>Header</th>
            </tr>
          </TableHead>
        </table>
      )
      const thead = screen.getByTestId('thead')
      expect(thead).toHaveAttribute('id', 'my-thead')
    })
  })

  describe('TableBody component', () => {
    it('renders as a tbody element', () => {
      render(
        <table>
          <TableBody data-testid="tbody">
            <tr>
              <td>Cell</td>
            </tr>
          </TableBody>
        </table>
      )
      const tbody = screen.getByTestId('tbody')
      expect(tbody.tagName).toBe('TBODY')
    })

    it('renders children', () => {
      render(
        <table>
          <TableBody>
            <tr>
              <td>Body Content</td>
            </tr>
          </TableBody>
        </table>
      )
      expect(screen.getByText('Body Content')).toBeInTheDocument()
    })

    it('passes additional props to tbody element', () => {
      render(
        <table>
          <TableBody data-testid="tbody" id="my-tbody" className="custom-body">
            <tr>
              <td>Cell</td>
            </tr>
          </TableBody>
        </table>
      )
      const tbody = screen.getByTestId('tbody')
      expect(tbody).toHaveAttribute('id', 'my-tbody')
      expect(tbody).toHaveClass('custom-body')
    })
  })

  describe('TableRow component', () => {
    it('renders as a tr element', () => {
      render(
        <table>
          <tbody>
            <TableRow data-testid="tr">
              <td>Cell</td>
            </TableRow>
          </tbody>
        </table>
      )
      const tr = screen.getByTestId('tr')
      expect(tr.tagName).toBe('TR')
    })

    it('renders children', () => {
      render(
        <table>
          <tbody>
            <TableRow>
              <td>Row Content</td>
            </TableRow>
          </tbody>
        </table>
      )
      expect(screen.getByText('Row Content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <table>
          <tbody>
            <TableRow className="custom-row" data-testid="tr">
              <td>Cell</td>
            </TableRow>
          </tbody>
        </table>
      )
      const tr = screen.getByTestId('tr')
      expect(tr).toHaveClass('custom-row')
    })

    it('passes additional props to tr element', () => {
      render(
        <table>
          <tbody>
            <TableRow data-testid="tr" id="my-tr">
              <td>Cell</td>
            </TableRow>
          </tbody>
        </table>
      )
      const tr = screen.getByTestId('tr')
      expect(tr).toHaveAttribute('id', 'my-tr')
    })

    it('applies striped styling when striped prop is true', () => {
      render(
        <Table striped>
          <TableBody>
            <TableRow data-testid="tr1">
              <TableCell>Row 1</TableCell>
            </TableRow>
            <TableRow data-testid="tr2">
              <TableCell>Row 2</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const tr1 = screen.getByTestId('tr1')
      expect(tr1.className).toContain('even:bg-zinc-950/2.5')
    })

    it('applies hover styling when href is provided', () => {
      render(
        <Table>
          <TableBody>
            <TableRow href="/details" data-testid="tr">
              <TableCell>Clickable Row</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const tr = screen.getByTestId('tr')
      expect(tr.className).toContain('hover:bg-zinc-950/2.5')
    })

    it('applies hover styling for striped rows with href', () => {
      render(
        <Table striped>
          <TableBody>
            <TableRow href="/details" data-testid="tr">
              <TableCell>Clickable Row</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const tr = screen.getByTestId('tr')
      expect(tr.className).toContain('hover:bg-zinc-950/5')
    })
  })

  describe('TableHeader component', () => {
    it('renders as a th element', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHeader data-testid="th">Header</TableHeader>
            </tr>
          </thead>
        </table>
      )
      const th = screen.getByTestId('th')
      expect(th.tagName).toBe('TH')
    })

    it('renders children', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHeader>Column Name</TableHeader>
            </tr>
          </thead>
        </table>
      )
      expect(screen.getByText('Column Name')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHeader className="custom-header" data-testid="th">
                Header
              </TableHeader>
            </tr>
          </thead>
        </table>
      )
      const th = screen.getByTestId('th')
      expect(th).toHaveClass('custom-header')
    })

    it('applies default border and padding classes', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHeader data-testid="th">Header</TableHeader>
            </tr>
          </thead>
        </table>
      )
      const th = screen.getByTestId('th')
      expect(th.className).toContain('border-b')
      expect(th.className).toContain('px-4')
      expect(th.className).toContain('py-2')
      expect(th.className).toContain('font-medium')
    })

    it('passes additional props to th element', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHeader data-testid="th" id="my-th" scope="col">
                Header
              </TableHeader>
            </tr>
          </thead>
        </table>
      )
      const th = screen.getByTestId('th')
      expect(th).toHaveAttribute('id', 'my-th')
      expect(th).toHaveAttribute('scope', 'col')
    })

    it('applies grid border when grid prop is true', () => {
      render(
        <Table grid>
          <TableHead>
            <TableRow>
              <TableHeader data-testid="th1">Header 1</TableHeader>
              <TableHeader data-testid="th2">Header 2</TableHeader>
            </TableRow>
          </TableHead>
        </Table>
      )
      const th2 = screen.getByTestId('th2')
      expect(th2.className).toContain('border-l')
    })
  })

  describe('TableCell component', () => {
    it('renders as a td element', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell data-testid="td">Cell</TableCell>
            </tr>
          </tbody>
        </table>
      )
      const td = screen.getByTestId('td')
      expect(td.tagName).toBe('TD')
    })

    it('renders children', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell>Cell Content</TableCell>
            </tr>
          </tbody>
        </table>
      )
      expect(screen.getByText('Cell Content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell className="custom-cell" data-testid="td">
                Cell
              </TableCell>
            </tr>
          </tbody>
        </table>
      )
      const td = screen.getByTestId('td')
      expect(td).toHaveClass('custom-cell')
    })

    it('applies default padding classes', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell data-testid="td">Cell</TableCell>
            </tr>
          </tbody>
        </table>
      )
      const td = screen.getByTestId('td')
      expect(td.className).toContain('px-4')
      expect(td.className).toContain('py-4')
    })

    it('passes additional props to td element', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell data-testid="td" id="my-td" colSpan={2}>
                Cell
              </TableCell>
            </tr>
          </tbody>
        </table>
      )
      const td = screen.getByTestId('td')
      expect(td).toHaveAttribute('id', 'my-td')
      expect(td).toHaveAttribute('colspan', '2')
    })

    it('applies dense padding when dense prop is true', () => {
      render(
        <Table dense>
          <TableBody>
            <TableRow>
              <TableCell data-testid="td">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const td = screen.getByTestId('td')
      expect(td.className).toContain('py-2.5')
      expect(td.className).not.toContain('py-4')
    })

    it('removes bottom border when striped prop is true', () => {
      render(
        <Table striped>
          <TableBody>
            <TableRow>
              <TableCell data-testid="td">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const td = screen.getByTestId('td')
      expect(td.className).not.toContain('border-b border-zinc-950/5')
    })

    it('applies bottom border when striped is false', () => {
      render(
        <Table striped={false}>
          <TableBody>
            <TableRow>
              <TableCell data-testid="td">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const td = screen.getByTestId('td')
      expect(td.className).toContain('border-b')
    })

    it('applies grid border when grid prop is true', () => {
      render(
        <Table grid>
          <TableBody>
            <TableRow>
              <TableCell data-testid="td1">Cell 1</TableCell>
              <TableCell data-testid="td2">Cell 2</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const td2 = screen.getByTestId('td2')
      expect(td2.className).toContain('border-l')
    })

    it('renders link when row has href', () => {
      render(
        <Table>
          <TableBody>
            <TableRow href="/details">
              <TableCell data-testid="td">Clickable Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const td = screen.getByTestId('td')
      const link = td.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/details')
    })

    it('renders link with target when provided', () => {
      render(
        <Table>
          <TableBody>
            <TableRow href="/external" target="_blank">
              <TableCell data-testid="td">External Link</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const td = screen.getByTestId('td')
      const link = td.querySelector('a')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('renders link with aria-label when title is provided', () => {
      render(
        <Table>
          <TableBody>
            <TableRow href="/details" title="View details">
              <TableCell data-testid="td">Row</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const td = screen.getByTestId('td')
      const link = td.querySelector('a')
      expect(link).toHaveAttribute('aria-label', 'View details')
    })

    it('sets tabIndex correctly for first cell with href', () => {
      render(
        <Table>
          <TableBody>
            <TableRow href="/details">
              <TableCell data-testid="td1">First Cell</TableCell>
              <TableCell data-testid="td2">Second Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const td1 = screen.getByTestId('td1')
      const td2 = screen.getByTestId('td2')
      const link1 = td1.querySelector('a')
      const link2 = td2.querySelector('a')
      expect(link1).toHaveAttribute('tabindex', '0')
      expect(link2).toHaveAttribute('tabindex', '-1')
    })

    it('does not render link when row has no href', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell data-testid="td">No Link Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const td = screen.getByTestId('td')
      const link = td.querySelector('a')
      expect(link).not.toBeInTheDocument()
    })

    it('renders complex content', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <span data-testid="complex-content">Complex Content</span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      expect(screen.getByTestId('complex-content')).toHaveTextContent('Complex Content')
    })
  })

  describe('Table bleed prop', () => {
    it('applies bleed styling when bleed prop is true', () => {
      render(
        <Table bleed data-testid="table-wrapper">
          <TableHead>
            <TableRow>
              <TableHeader data-testid="th">Header</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell data-testid="td">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const th = screen.getByTestId('th')
      const td = screen.getByTestId('td')
      expect(th.className).not.toContain('sm:first:pl-1')
      expect(td.className).not.toContain('sm:first:pl-1')
    })

    it('applies non-bleed styling when bleed prop is false', () => {
      render(
        <Table bleed={false} data-testid="table-wrapper">
          <TableHead>
            <TableRow>
              <TableHeader data-testid="th">Header</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell data-testid="td">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      const th = screen.getByTestId('th')
      const td = screen.getByTestId('td')
      expect(th.className).toContain('sm:first:pl-1')
      expect(td.className).toContain('sm:first:pl-1')
    })
  })

  describe('Full table composition', () => {
    it('renders a complete table with header and body', () => {
      render(
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Role</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
              <TableCell>Admin</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>jane@example.com</TableCell>
              <TableCell>User</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      expect(screen.getByText('User')).toBeInTheDocument()
    })

    it('renders a table with all styling options', () => {
      render(
        <Table bleed dense grid striped data-testid="table-wrapper">
          <TableHead>
            <TableRow>
              <TableHeader data-testid="th1">Col 1</TableHeader>
              <TableHeader data-testid="th2">Col 2</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow data-testid="tr1">
              <TableCell data-testid="td1">A</TableCell>
              <TableCell data-testid="td2">B</TableCell>
            </TableRow>
            <TableRow data-testid="tr2">
              <TableCell data-testid="td3">C</TableCell>
              <TableCell data-testid="td4">D</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      // Check dense styling
      const td1 = screen.getByTestId('td1')
      expect(td1.className).toContain('py-2.5')

      // Check grid styling
      const th2 = screen.getByTestId('th2')
      const td2 = screen.getByTestId('td2')
      expect(th2.className).toContain('border-l')
      expect(td2.className).toContain('border-l')

      // Check striped styling
      const tr1 = screen.getByTestId('tr1')
      expect(tr1.className).toContain('even:bg-zinc-950/2.5')
    })

    it('renders a table with clickable rows', () => {
      render(
        <Table>
          <TableBody>
            <TableRow href="/user/1" title="View John">
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
            <TableRow href="/user/2" title="View Jane">
              <TableCell>Jane Smith</TableCell>
              <TableCell>jane@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(2)

      // Check that links are rendered in cells
      const johnCell = screen.getByText('John Doe').closest('td')
      const johnLink = johnCell?.querySelector('a')
      expect(johnLink).toHaveAttribute('href', '/user/1')
      expect(johnLink).toHaveAttribute('aria-label', 'View John')
    })

    it('renders a table with mixed content types', () => {
      render(
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>User</TableHeader>
              <TableHeader>Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <div data-testid="user-info">
                  <strong>John Doe</strong>
                  <span>Admin</span>
                </div>
              </TableCell>
              <TableCell>
                <span data-testid="status-badge">Active</span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      const userInfo = screen.getByTestId('user-info')
      expect(within(userInfo).getByText('John Doe')).toBeInTheDocument()
      expect(within(userInfo).getByText('Admin')).toBeInTheDocument()
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Active')
    })
  })
})
