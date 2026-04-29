import React from 'react'
import Icon from '../../../components/AppIcon'
import Image from '../../../components/AppImage'

const PostPreview = ({ content, images = [], metadata, author = null }) => {
  // API Function to strip HTML and get plain text
  const stripHtml = (html) => {
    if (!html) return ''

    // Create temporary element
    const tmp = document.createElement('div')
    tmp.innerHTML = html

    // Remove style and script tags
    const scripts = tmp.getElementsByTagName('script')
    const styles = tmp.getElementsByTagName('style')

    Array.from(scripts).forEach((script) => script.remove())
    Array.from(styles).forEach((style) => style.remove())

    return tmp.textContent || tmp.innerText || ''
  }

  // Get preview text (first 200 characters)
  const getPreviewText = () => {
    const text = stripHtml(content || '')
    if (text.length === 0) {
      return 'Your travel story will appear here...'
    }
    return text.length > 200 ? text.substring(0, 200) + '...' : text
  }

  // Get formatted date
  const getFormattedDate = () => {
    const now = new Date()
    return now.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Get trip type badges
  const getTripTypeBadges = () => {
    if (!metadata?.tripType || metadata.tripType.length === 0) {
      return null
    }

    return metadata.tripType.map((type, index) => {
      const colors = [
        'from-saffron/10 to-orange/10 text-saffron-dark border-saffron/20',
        'from-brand-orange/10 to-saffron/10 text-brand-orange-dark border-brand-orange/20',
        'from-orange/10 to-saffron-dark/10 text-orange border-orange/20',
      ]
      const colorClass = colors[index % colors.length]

      return (
        <span key={type} className={`px-3 py-1.5 text-xs font-medium rounded-full border bg-gradient-to-r ${colorClass}`}>
          {type}
        </span>
      )
    })
  }

  // Get privacy icon
  const getPrivacyIcon = () => {
    switch (metadata?.privacy) {
      case 'public':
        return <Icon name='Globe' size={14} className='text-text-muted' />
      case 'friends':
        return <Icon name='Users' size={14} className='text-text-muted' />
      case 'private':
        return <Icon name='Lock' size={14} className='text-text-muted' />
      default:
        return <Icon name='Globe' size={14} className='text-text-muted' />
    }
  }

  return (
    <div className='glass-card rounded-2xl border-2 border-border-soft overflow-hidden animate-fade-in-up'>
      {/* Header */}
      <div className='p-5 border-b border-border-soft bg-gradient-to-r from-white to-bg-cream/50'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg md:text-xl font-heading font-semibold text-text-dark mb-1'>Post Preview</h3>
            <p className='text-sm text-text-muted flex items-center gap-2'>
              <Icon name='Eye' size={14} className='text-saffron' />
              How your post will appear in the community
            </p>
          </div>
          <div className='flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-saffron/10 to-orange/10 rounded-full'>
            <Icon name='Clock' size={14} className='text-saffron' />
            <span className='text-sm font-medium text-saffron-dark'>Live Preview</span>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className='p-5 md:p-6'>
        {/* Author Info */}
        <div className='flex items-start gap-4 mb-5'>
          <div className='w-12 h-12 rounded-full bg-gradient-to-r from-saffron to-orange flex items-center justify-center text-white font-semibold text-lg shadow-lg flex-shrink-0'>
            {author?.initials || 'AT'}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 flex-wrap mb-1'>
              <h4 className='font-heading font-semibold text-text-dark text-base'>{author?.name || 'Alex Traveler'}</h4>
              {metadata?.city && (
                <>
                  <span className='text-text-muted'>•</span>
                  <div className='flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-saffron/5 to-orange/5 rounded-full border border-saffron/20'>
                    <Icon name='MapPin' size={14} className='text-saffron' />
                    <span className='text-sm font-medium text-saffron-dark'>{metadata.city}</span>
                  </div>
                </>
              )}
            </div>
            <div className='flex items-center gap-3 text-xs text-text-muted'>
              <span className='flex items-center gap-1'>
                <Icon name='Calendar' size={12} />
                {getFormattedDate()}
              </span>
              <span className='flex items-center gap-1'>
                {getPrivacyIcon()}
                {metadata?.privacy === 'public' ? 'Public' : metadata?.privacy === 'friends' ? 'Friends Only' : 'Private'}
              </span>
              {metadata?.travelDate && (
                <span className='flex items-center gap-1'>
                  <Icon name='Plane' size={12} />
                  Visited on{' '}
                  {new Date(metadata.travelDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className='mb-5'>
          <div className='prose prose-lg max-w-none text-text-dark font-sans leading-relaxed'>
            <div
              dangerouslySetInnerHTML={{
                __html: content || '<p class="text-text-muted italic">Your travel story will appear here...</p>',
              }}
            />
          </div>

          {/* Read More if content is long */}
          {content && stripHtml(content).length > 200 && (
            <button className='text-sm text-saffron hover:text-saffron-dark font-medium mt-2 transition-colors'>Read more...</button>
          )}
        </div>

        {/* ================================================
           IMAGES SECTION - COMMENTED OUT
           Uncomment when you want to enable image uploads
        ================================================ */}
        {/*
        {images?.length > 0 && (
          <div className={`grid gap-3 mb-5 ${
            images?.length === 1 ? 'grid-cols-1' : 
            images?.length === 2 ? 'grid-cols-2': 'grid-cols-2 md:grid-cols-3'
          }`}>
            {images?.slice(0, 6)?.map((image, index) => (
              <div 
                key={image?.id || index} 
                className="relative aspect-square rounded-xl overflow-hidden group/image"
              >
                <Image
                  src={image?.preview || image?.url}
                  alt={image?.previewAlt || image?.alt || 'Travel photo'}
                  className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-300"
                />
                {index === 5 && images?.length > 6 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-xl font-semibold text-white">
                      +{images?.length - 6}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {images?.length > 0 && (
          <div className="text-center mb-5">
            <p className="text-sm text-text-muted">
              🖼️ {images.length} {images.length === 1 ? 'photo' : 'photos'} attached
            </p>
          </div>
        )}
        */}

        {/* Trip Type Badges */}
        {metadata?.tripType && metadata.tripType.length > 0 && <div className='flex flex-wrap gap-2 mb-5'>{getTripTypeBadges()}</div>}

        {/* Engagement Stats */}
        <div className='flex items-center gap-6 pt-4 border-t border-border-soft'>
          <div className='flex items-center gap-2 group cursor-pointer'>
            <div className='p-2 rounded-full bg-gradient-to-r from-pink-500/10 to-rose-500/10 group-hover:from-pink-500/20 group-hover:to-rose-500/20 transition-all'>
              <Icon name='Heart' size={18} className='text-text-muted group-hover:text-pink-500 transition-colors' />
            </div>
            <span className='text-sm font-medium text-text-muted group-hover:text-text-dark transition-colors'>0 likes</span>
          </div>

          <div className='flex items-center gap-2 group cursor-pointer'>
            <div className='p-2 rounded-full bg-gradient-to-r from-saffron/10 to-orange/10 group-hover:from-saffron/20 group-hover:to-orange/20 transition-all'>
              <Icon name='MessageCircle' size={18} className='text-text-muted group-hover:text-saffron transition-colors' />
            </div>
            <span className='text-sm font-medium text-text-muted group-hover:text-text-dark transition-colors'>0 comments</span>
          </div>

          <div className='flex items-center gap-2 group cursor-pointer'>
            <div className='p-2 rounded-full bg-gradient-to-r from-brand-orange/10 to-saffron-dark/10 group-hover:from-brand-orange/20 group-hover:to-saffron-dark/20 transition-all'>
              <Icon name='Share2' size={18} className='text-text-muted group-hover:text-brand-orange transition-colors' />
            </div>
            <span className='text-sm font-medium text-text-muted group-hover:text-text-dark transition-colors'>0 shares</span>
          </div>

          <div className='ml-auto'>
            <div className='p-2 rounded-full bg-bg-soft hover:bg-saffron/10 transition-colors cursor-pointer'>
              <Icon name='Bookmark' size={18} className='text-text-muted' />
            </div>
          </div>
        </div>

        {/* Comments Preview (if enabled) */}
        {metadata?.allowComments !== false && (
          <div className='mt-5 pt-4 border-t border-border-soft'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-full bg-gradient-to-r from-saffron/10 to-orange/10 flex items-center justify-center text-saffron-dark text-xs font-semibold'>
                RV
              </div>
              <div className='flex-1'>
                <p className='text-sm text-text-muted italic'>Comments will appear here when people engage with your post</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostPreview
