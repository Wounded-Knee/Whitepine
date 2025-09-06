'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '@/app/contexts/ThemeContext'
import BaseModal from '../../../components/BaseModal'

interface BaseBrowserProps {
  isAuthorized: boolean
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  endpoint: string
  title: string
  columns: Column[]
  renderRow: (item: any, index: number) => React.ReactNode
  renderForm?: (item: any, onSave: (data: any) => void, onCancel: () => void) => React.ReactNode
  searchFields?: string[]
  filters?: Filter[]
  customFetchData?: (params: any) => Promise<any>
}

interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
}

interface Filter {
  key: string
  label: string
  type: 'select' | 'text' | 'date'
  options?: { value: string; label: string }[]
}

export default function BaseBrowser({
  isAuthorized,
  isLoading,
  setIsLoading,
  endpoint,
  title,
  columns,
  renderRow,
  renderForm,
  searchFields = [],
  filters = [],
  customFetchData
}: BaseBrowserProps) {
  const [data, setData] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(20)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [error, setError] = useState('')
  const { resolvedTheme } = useTheme()

  // Theme-aware class names
  const themeClasses = {
    container: resolvedTheme === 'dark' 
      ? 'bg-surface-dark border-neutral-dark' 
      : 'bg-surface border-neutral-light',
    header: resolvedTheme === 'dark' 
      ? 'text-foreground' 
      : 'text-foreground',
    input: resolvedTheme === 'dark'
      ? 'bg-surface-dark border-neutral text-foreground placeholder-neutral-light focus:border-primary focus:ring-primary'
      : 'bg-surface border-neutral text-foreground placeholder-neutral-dark focus:border-primary focus:ring-primary',
    select: resolvedTheme === 'dark'
      ? 'bg-surface-dark border-neutral text-foreground focus:border-primary focus:ring-primary'
      : 'bg-surface border-neutral text-foreground focus:border-primary focus:ring-primary',
    table: resolvedTheme === 'dark'
      ? 'bg-surface-dark divide-neutral'
      : 'bg-surface divide-neutral-light',
    tableHeader: resolvedTheme === 'dark'
      ? 'bg-neutral-dark text-neutral-light'
      : 'bg-neutral-light text-neutral-dark',
    tableRow: resolvedTheme === 'dark'
      ? 'hover:bg-neutral-dark'
      : 'hover:bg-neutral-light',
    modal: resolvedTheme === 'dark'
      ? 'bg-surface-dark border-neutral'
      : 'bg-surface border-neutral-light',
    modalOverlay: 'bg-black bg-opacity-50',
    button: {
      primary: resolvedTheme === 'dark'
        ? 'bg-primary hover:bg-primary-dark text-white focus:ring-primary-light'
        : 'bg-primary hover:bg-primary-dark text-white focus:ring-primary-light',
      secondary: resolvedTheme === 'dark'
        ? 'bg-neutral hover:bg-neutral-dark text-foreground focus:ring-neutral-light'
        : 'bg-neutral hover:bg-neutral-dark text-foreground focus:ring-neutral-light',
      danger: resolvedTheme === 'dark'
        ? 'bg-error hover:bg-error/80 text-white focus:ring-error/50'
        : 'bg-error hover:bg-error/80 text-white focus:ring-error/50'
    },
    error: resolvedTheme === 'dark'
      ? 'bg-error/10 border-error/20 text-error'
      : 'bg-error/10 border-error/20 text-error'
  }

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const params = {
        limit: pageSize.toString(),
        skip: ((currentPage - 1) * pageSize).toString(),
        ...activeFilters
      }

      let response
      if (customFetchData) {
        // Use custom fetch function if provided
        response = await customFetchData(params)
      } else {
        // Use default fetch with new v1 API structure
        const queryParams = new URLSearchParams(params)
        const axiosResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/${endpoint}?${queryParams}`)
        response = axiosResponse.data
      }
      
      if (response[endpoint] || response.data) {
        const items = response[endpoint] || response.data || response
        setData(items)
        setFilteredData(items)
        setTotalPages(Math.ceil((response.total || items.length) / pageSize))
      } else {
        setData([])
        setFilteredData([])
      }
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.response?.data?.error || 'Failed to fetch data')
      setData([])
      setFilteredData([])
    } finally {
      setIsLoading(false)
    }
  }

  // Create or update item
  const saveItem = async (itemData: any) => {
    setIsLoading(true)
    setError('')
    
    try {
      if (editingItem) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/${endpoint}/${editingItem._id}`, itemData)
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/${endpoint}`, itemData)
      }
      
      setShowForm(false)
      setEditingItem(null)
      fetchData()
    } catch (err: any) {
      console.error('Error saving item:', err)
      setError(err.response?.data?.error || 'Failed to save item')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete item
  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    setIsLoading(true)
    setError('')
    
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/${endpoint}/${id}`)
      fetchData()
    } catch (err: any) {
      console.error('Error deleting item:', err)
      setError(err.response?.data?.error || 'Failed to delete item')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term) {
      setFilteredData(data)
      return
    }

    const filtered = data.filter(item => {
      return searchFields.some(field => {
        const value = item[field]
        return value && value.toString().toLowerCase().includes(term.toLowerCase())
      })
    })
    setFilteredData(filtered)
  }

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Apply filters
  const applyFilters = (filters: Record<string, any>) => {
    setActiveFilters(filters)
    setCurrentPage(1)
  }

  // Initialize and refetch when dependencies change
  useEffect(() => {
    fetchData()
  }, [currentPage, activeFilters, customFetchData])

  // Apply search and sorting
  useEffect(() => {
    let result = [...data]
    
    // Apply search
    if (searchTerm) {
      result = result.filter(item => {
        return searchFields.some(field => {
          const value = item[field]
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })
      })
    }
    
    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }
    
    setFilteredData(result)
  }, [data, searchTerm, sortField, sortDirection])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {isAuthorized && renderForm && (
          <button
            onClick={() => {
              setEditingItem(null)
              setShowForm(true)
            }}
                         className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New
          </button>
        )}
      </div>

             {/* Error Message */}
       {error && (
         <div className="bg-error/10 border border-error/20 rounded-md p-4">
           <div className="flex">
             <div className="flex-shrink-0">
               <svg className="h-5 w-5 text-error" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
               </svg>
             </div>
             <div className="ml-3">
               <h3 className="text-sm font-medium text-error">Error</h3>
               <div className="mt-2 text-sm text-error/80">{error}</div>
             </div>
           </div>
         </div>
       )}

      {/* Search and Filters */}
      <div className="bg-neutral-light rounded-lg p-4 space-y-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={`Search by ${searchFields.join(', ')}...`}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              resolvedTheme === 'dark'
                ? 'bg-surface-dark border-neutral text-foreground placeholder-neutral-light focus:border-primary focus:ring-primary'
                : 'bg-surface border-neutral text-foreground placeholder-neutral focus:border-primary focus:ring-primary'
            }`}
          />
        </div>

        {/* Filters */}
        {filters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label htmlFor={filter.key} className="block text-sm font-medium text-foreground mb-1">
                  {filter.label}
                </label>
                {filter.type === 'select' ? (
                  <select
                    id={filter.key}
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => applyFilters({ ...activeFilters, [filter.key]: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                      resolvedTheme === 'dark'
                        ? 'bg-surface-dark border-neutral text-foreground focus:border-primary focus:ring-primary'
                        : 'bg-surface border-neutral text-foreground focus:border-primary focus:ring-primary'
                    }`}
                  >
                    <option value="">All</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={filter.type}
                    id={filter.key}
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => applyFilters({ ...activeFilters, [filter.key]: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                      resolvedTheme === 'dark'
                        ? 'bg-surface-dark border-neutral text-foreground placeholder-neutral-light focus:border-primary focus:ring-primary'
                        : 'bg-surface border-neutral text-foreground placeholder-neutral focus:border-primary focus:ring-primary'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <BaseModal
        isOpen={showForm && !!renderForm}
        onClose={() => {
          setShowForm(false)
          setEditingItem(null)
        }}
        title={`${editingItem ? 'Edit' : 'Add New'} ${title.slice(0, -1)}`}
        size="lg"
        position="top"
        showCloseButton={true}
      >
        {renderForm && renderForm(editingItem, saveItem, () => {
          setShowForm(false)
          setEditingItem(null)
        })}
      </BaseModal>

      {/* Data Table */}
      <div className="bg-surface shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-neutral-light">
          <thead className="bg-neutral-light">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-neutral uppercase tracking-wider ${column.width || ''}`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="group inline-flex items-center hover:text-foreground"
                    >
                      {column.label}
                      <span className="ml-2 flex-none rounded">
                        {sortField === column.key ? (
                          sortDirection === 'asc' ? (
                                                     <svg className="h-4 w-4 text-neutral" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                         </svg>
                       ) : (
                         <svg className="h-4 w-4 text-neutral" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                         </svg>
                       )
                     ) : (
                       <svg className="h-4 w-4 text-neutral-light group-hover:text-neutral" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                       </svg>
                     )}
                      </span>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              {isAuthorized && (
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-neutral-light">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (isAuthorized ? 1 : 0)} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                                         <svg className="animate-spin h-5 w-5 text-primary mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (isAuthorized ? 1 : 0)} className="px-6 py-4 text-center text-neutral">
                  No data found
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => renderRow(item, index))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
                          <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-neutral text-sm font-medium rounded-md text-foreground bg-surface hover:bg-neutral-light disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-neutral text-sm font-medium rounded-md text-foreground bg-surface hover:bg-neutral-light disabled:opacity-50"
              >
                Next
              </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-foreground">
                Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, filteredData.length)}</span> of{' '}
                <span className="font-medium">{filteredData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                 <button
                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                   disabled={currentPage === 1}
                   className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral bg-surface text-sm font-medium text-neutral hover:bg-neutral-light disabled:opacity-50"
                 >
                   Previous
                 </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                                         className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                       page === currentPage
                         ? 'z-10 bg-primary/10 border-primary text-primary'
                         : 'bg-surface border-neutral text-neutral hover:bg-neutral-light'
                     }`}
                  >
                    {page}
                  </button>
                ))}
                                 <button
                   onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                   disabled={currentPage === totalPages}
                   className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral bg-surface text-sm font-medium text-neutral hover:bg-neutral-light disabled:opacity-50"
                 >
                   Next
                 </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
