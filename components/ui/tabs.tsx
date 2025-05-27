"use client"

import * as React from "react"

const Tabs = ({ defaultValue, className, children, ...props }: any) => {
  const [value, setValue] = React.useState(defaultValue)
  
  return (
    <div className={className} {...props}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { value, setValue })
      )}
    </div>
  )
}

const TabsList = ({ className, children, ...props }: any) => (
  <div
    className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className || ''}`}
    {...props}
  >
    {children}
  </div>
)

const TabsTrigger = ({ className, value: triggerValue, children, setValue, value, ...props }: any) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 ${
      value === triggerValue ? 'bg-white text-gray-900 shadow-sm' : ''
    } ${className || ''}`}
    onClick={() => setValue(triggerValue)}
    {...props}
  >
    {children}
  </button>
)

const TabsContent = ({ className, value: contentValue, value, children, ...props }: any) => {
  if (value !== contentValue) return null
  
  return (
    <div
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
