import type { ReactNode } from 'react'

interface TableProps {
  children: ReactNode
}

interface DataTableColumn<TRecord extends object> {
  key: keyof TRecord
  header: string
  render?: (row: TRecord) => ReactNode
  className?: string
}

interface DataTableProps<TRecord extends object> {
  columns: Array<DataTableColumn<TRecord>>
  data: TRecord[]
  getRowKey: (row: TRecord) => string
  emptyMessage?: string
}

export function Table({ children }: TableProps) {
  return <table className="w-full min-w-[680px] border-collapse text-left text-sm text-ink">{children}</table>
}

export function TableHeader({ children }: TableProps) {
  return <thead className="bg-sand-50 text-xs uppercase tracking-wider text-ink-30">{children}</thead>
}

export function DataTable<TRecord extends object>({
  columns,
  data,
  getRowKey,
  emptyMessage = 'No records found',
}: DataTableProps<TRecord>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-ink-10 bg-white">
      <Table>
        <TableHeader>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className={`px-4 py-3 font-medium ${column.className ?? ''}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </TableHeader>
        <tbody className="divide-y divide-ink-10">
          {data.length > 0 ? (
            data.map((row) => (
              <tr key={getRowKey(row)} className="bg-white">
                {columns.map((column) => (
                  <td key={String(column.key)} className={`px-4 py-3 align-middle ${column.className ?? ''}`}>
                    {column.render ? column.render(row) : String(row[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-6 text-center text-sm text-ink-60" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  )
}
