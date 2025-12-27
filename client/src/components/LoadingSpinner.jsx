import { motion } from 'framer-motion'

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} border-4 border-primary-200 border-t-primary-600 rounded-full`}
      />
      {message && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  )
}

export default LoadingSpinner
