const ResponsiveCard = ({ 
  children, 
  title,
  subtitle,
  actions,
  className = '',
  padding = 'p-4 lg:p-6',
  ...props 
}) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md responsive-card ${padding} ${className}`}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <div>
            {title && (
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2 mobile-button-stack">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export default ResponsiveCard