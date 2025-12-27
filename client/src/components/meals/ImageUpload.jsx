import { useState, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

const ImageUpload = ({ currentImage, onImageChange, onImageRemove, disabled = false }) => {
  const [preview, setPreview] = useState(currentImage?.url || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  // Update preview when currentImage prop changes
  useEffect(() => {
    setPreview(currentImage?.url || null)
  }, [currentImage])

  const handleFileSelect = (file) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
    }
    reader.readAsDataURL(file)

    // Pass file to parent
    onImageChange(file)
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    handleFileSelect(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled) return

    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleRemoveImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onImageRemove()
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Meal Image
      </label>
      
      {preview ? (
        <div className="relative">
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <img
              src={preview}
              alt="Meal preview"
              className="w-full h-full object-cover"
            />
          </div>
          
          {!disabled && (
            <>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={handleClick}
                className="absolute bottom-2 right-2 p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors"
                title="Change image"
              >
                <Upload className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              {isDragging ? (
                <Upload className="h-8 w-8 text-primary-500" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-500">
              JPEG, PNG, or WebP (max 5MB)
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  )
}

export default ImageUpload