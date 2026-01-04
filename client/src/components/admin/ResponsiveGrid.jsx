const ResponsiveGrid = ({ 
  children, 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'gap-4 lg:gap-6',
  className = '',
  ...props 
}) => {
  const getGridCols = () => {
    const colClasses = []
    
    if (cols.sm) colClasses.push(`grid-cols-${cols.sm}`)
    if (cols.md) colClasses.push(`md:grid-cols-${cols.md}`)
    if (cols.lg) colClasses.push(`lg:grid-cols-${cols.lg}`)
    if (cols.xl) colClasses.push(`xl:grid-cols-${cols.xl}`)
    if (cols['2xl']) colClasses.push(`2xl:grid-cols-${cols['2xl']}`)
    
    return colClasses.join(' ')
  }

  return (
    <div 
      className={`grid ${getGridCols()} ${gap} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default ResponsiveGrid