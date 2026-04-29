import React, { useState, useRef } from 'react'
import Icon from '../../../components/AppIcon'
import Image from '../../../components/AppImage'
import Button from '../../../components/ui/Button'

const ImageUploadSection = ({ images = [], onImagesChange }) => {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true)
    } else if (e?.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    setDragActive(false)

    const files = Array.from(e?.dataTransfer?.files)?.filter((file) => file?.type?.startsWith('image/'))

    if (files?.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileInput = (e) => {
    const files = Array.from(e?.target?.files)
    if (files?.length > 0) {
      handleFiles(files)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleFiles = (files) => {
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        alert(`❌ ${file.name} is not a supported image type. Please upload JPG, PNG, or WebP.`)
        return false
      }
      if (file.size > MAX_SIZE) {
        alert(`❌ ${file.name} is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max size is 5MB.`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const newImages = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      previewAlt: `Travel photo: ${file.name}`,
      caption: '',
      size: file.size,
      type: file.type,
      name: file.name,
    }))

    const totalImages = images.length + newImages.length
    if (totalImages > 10) {
      alert(`⚠️ Maximum 10 images allowed. You already have ${images.length} images.`)
      return
    }

    onImagesChange([...images, ...newImages])
  }

  const removeImage = (id) => {
    const updatedImages = images?.filter((img) => img?.id !== id)
    const imageToRemove = images?.find((img) => img?.id === id)
    if (imageToRemove?.preview) {
      URL.revokeObjectURL(imageToRemove?.preview)
    }
    onImagesChange(updatedImages)
  }

  const updateCaption = (id, caption) => {
    const updatedImages = images?.map((img) => (img?.id === id ? { ...img, caption } : img))
    onImagesChange(updatedImages)
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const handleClearAll = () => {
    images.forEach((image) => {
      if (image?.preview) {
        URL.revokeObjectURL(image?.preview)
      }
    })
    onImagesChange([])
  }

  return (
    <div className='space-y-5 animate-fade-in-up'>
      <div
        className={`border-2 border-dashed rounded-2xl p-6 md:p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-saffron bg-gradient-to-r from-saffron/5 to-orange/5 shadow-inner'
            : 'border-border-soft hover:border-saffron/50 hover:bg-gradient-to-r from-saffron/2 to-orange/2'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type='file'
          multiple
          accept='image/jpeg, image/jpg, image/png, image/webp, image/gif'
          onChange={handleFileInput}
          className='hidden'
        />

        <div className='flex flex-col items-center gap-4 md:gap-5'>
          <div className='w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-saffron/10 to-orange/10 flex items-center justify-center group animate-fade-in-up'>
            <Icon name='ImagePlus' size={32} className='text-saffron group-hover:scale-110 transition-transform duration-300' />
          </div>

          <div className='space-y-2'>
            <h3 className='text-lg md:text-xl font-heading font-semibold text-text-dark'>Add Travel Photos</h3>
            <p className='text-sm md:text-base text-text-light'>Drag & drop your travel photos here</p>
            <p className='text-xs text-text-muted'>or click the button below to browse</p>
          </div>

          <div className='flex flex-col sm:flex-row gap-3'>
            <Button
              variant='outline'
              size='lg'
              onClick={() => fileInputRef?.current?.click()}
              iconName='Upload'
              iconPosition='left'
              className='group'
            >
              Choose Photos
              <Icon name='FolderOpen' size={16} className='ml-2 group-hover:rotate-12 transition-transform' />
            </Button>

            {images.length > 0 && (
              <Button
                variant='ghost'
                size='lg'
                onClick={handleClearAll}
                iconName='Trash2'
                iconPosition='left'
                className='text-red-500 hover:text-red-600 hover:bg-red-50'
              >
                Clear All
              </Button>
            )}
          </div>

          <div className='mt-4 p-3 bg-gradient-to-r from-saffron/5 to-orange/5 rounded-xl border border-saffron/20'>
            <div className='flex flex-wrap items-center justify-center gap-4 text-xs text-text-muted'>
              <span className='flex items-center gap-1'>
                <Icon name='CheckCircle' size={12} className='text-green-500' />
                Max 10 photos
              </span>
              <span className='flex items-center gap-1'>
                <Icon name='CheckCircle' size={12} className='text-green-500' />
                Max 5MB each
              </span>
              <span className='flex items-center gap-1'>
                <Icon name='CheckCircle' size={12} className='text-green-500' />
                JPG, PNG, WebP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      {images?.length > 0 && (
        <div className='space-y-4'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-gradient-to-r from-saffron/10 to-orange/10'>
                <Icon name='Image' size={20} className='text-saffron' />
              </div>
              <div>
                <h4 className='font-heading font-semibold text-text-dark'>Uploaded Photos</h4>
                <p className='text-sm text-text-muted'>
                  {images.length} {images.length === 1 ? 'photo' : 'photos'} • Drag to reorder
                </p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef?.current?.click()}
              className='text-sm text-saffron hover:text-saffron-dark font-medium flex items-center gap-2'
            >
              <Icon name='Plus' size={16} />
              Add More
            </button>
          </div>

          {/* Image Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {images?.map((image, index) => (
              <div
                key={image?.id}
                className=' rounded-xl overflow-hidden border-2 border-border-soft hover:border-saffron/30 transition-all duration-300 group animate-fade-in-up'
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image Container */}
                <div className='relative aspect-[4/3] overflow-hidden'>
                  <Image
                    src={image?.preview}
                    alt={image?.previewAlt}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                  />

                  {/* Overlay */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                  {/* Remove Button */}
                  <button
                    type='button'
                    onClick={() => removeImage(image?.id)}
                    className='absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-xl group/remove'
                  >
                    <Icon name='X' size={18} className='text-text-dark group-hover/remove:text-red-500 transition-colors' />
                  </button>

                  {/* Image Info */}
                  <div className='absolute bottom-3 left-3 right-3'>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='px-2 py-1 bg-black/60 text-white rounded-full'>{formatFileSize(image.size)}</span>
                      <span className='px-2 py-1 bg-black/60 text-white rounded-full'>#{index + 1}</span>
                    </div>
                  </div>
                </div>

                {/* Caption Input */}
                <div className='p-4'>
                  <div className='relative'>
                    <Icon name='MessageSquare' size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none' />
                    <input
                      type='text'
                      placeholder='Add a caption for this photo...'
                      value={image?.caption}
                      onChange={(e) => updateCaption(image?.id, e.target.value)}
                      className='w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-bg-soft border border-border-soft focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all duration-200 text-text-dark placeholder:text-text-muted'
                      maxLength={150}
                    />
                    {image.caption && (
                      <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted'>{image.caption.length}/150</span>
                    )}
                  </div>

                  {/* File Info */}
                  <div className='mt-2 flex items-center justify-between text-xs text-text-muted'>
                    <span className='truncate'>{image.name}</span>
                    <span className='flex items-center gap-1'>
                      <Icon name='Image' size={12} />
                      {image.type.split('/')[1].toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Tips */}
          <div className='mt-6 p-4 bg-gradient-to-r from-saffron/5 to-orange/5 rounded-xl border border-saffron/20'>
            <div className='flex items-start gap-3'>
              <Icon name='Lightbulb' size={18} className='text-saffron mt-0.5 flex-shrink-0' />
              <div className='space-y-1'>
                <p className='text-sm font-medium text-text-dark'>Tips for great travel photos:</p>
                <ul className='text-xs text-text-muted space-y-1'>
                  <li>• Use landscape orientation for better display</li>
                  <li>• Add captions to tell the story behind each photo</li>
                  <li>• Upload high-quality photos for better viewing</li>
                  <li>• Rearrange photos by dragging to set the perfect order</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State (when no images) */}
      {images.length === 0 && (
        <div className='text-center py-8 animate-fade-in-up'>
          <div className='w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-saffron/5 to-orange/5 flex items-center justify-center'>
            <Icon name='Image' size={32} className='text-text-muted' />
          </div>
          <h4 className='font-heading font-medium text-text-dark mb-2'>No photos added yet</h4>
          <p className='text-sm text-text-muted max-w-md mx-auto'>
            Add photos to make your travel story more engaging and memorable. Photos help others visualize your experience better!
          </p>
        </div>
      )}
    </div>
  )
}

export default ImageUploadSection
