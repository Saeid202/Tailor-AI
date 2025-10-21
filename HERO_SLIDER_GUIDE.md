# Hero Slider Customization Guide

## Adding Your Own Images and Videos

### 1. Adding Images

To add your own images to the hero slider, update the `media` property in the slide configuration:

```tsx
{
  id: 'your-slide',
  type: 'image',
  title: 'Your Title',
  subtitle: 'Your Subtitle',
  description: 'Your description...',
  media: {
    src: '/path/to/your-image.jpg', // Place in public folder
    alt: 'Descriptive alt text'
  },
  // ... rest of configuration
}
```

### 2. Adding Videos

For video slides, use the following configuration:

```tsx
{
  id: 'video-slide',
  type: 'video',
  title: 'Your Video Title',
  subtitle: 'Your Subtitle',
  description: 'Your description...',
  media: {
    src: '/path/to/your-video.mp4', // Place in public folder
    poster: '/path/to/thumbnail.jpg', // Optional thumbnail
    alt: 'Video description'
  },
  // ... rest of configuration
}
```

### 3. File Organization

Place your media files in the `public` folder:

```
public/
├── images/
│   ├── hero-slide-1.jpg
│   ├── hero-slide-2.jpg
│   └── app-screenshot.png
├── videos/
│   ├── app-demo.mp4
│   └── features-showcase.mp4
└── thumbnails/
    ├── demo-thumb.jpg
    └── features-thumb.jpg
```

### 4. Recommended Specifications

**Images:**
- Format: JPG, PNG, WebP
- Dimensions: 1200x900px (4:3 aspect ratio)
- File size: < 500KB for optimal loading
- Quality: 80-90% compression

**Videos:**
- Format: MP4 (H.264 codec)
- Dimensions: 1280x720px (16:9) or 1200x900px (4:3)
- Duration: 10-30 seconds for hero videos
- File size: < 5MB for web optimization
- Settings: Autoplay, muted, loop enabled

### 5. Example Configuration

```tsx
const heroSlides = [
  {
    id: 'app-demo',
    type: 'video',
  title: 'See Tailor AI in Action',
    subtitle: 'Live App Demonstration',
    description: 'Watch how easy it is to get precise measurements using just your camera.',
    badge: 'Live Demo',
    media: {
      src: '/videos/framefit-demo.mp4',
      poster: '/thumbnails/demo-thumbnail.jpg',
  alt: 'Tailor AI app demonstration video'
    },
    cta: {
      primary: 'Try It Now',
      secondary: 'Learn More'
    },
    gradient: 'bg-gradient-to-br from-primary/10 via-background to-secondary/10'
  },
  {
    id: 'results',
    type: 'image',
    title: 'Accurate Results',
    subtitle: 'Professional Grade Measurements',
    description: 'Get detailed body measurements with confidence scores and recommendations.',
    badge: 'High Precision',
    media: {
      src: '/images/measurement-results.jpg',
  alt: 'Tailor AI measurement results interface'
    },
    cta: {
      primary: 'Get Started',
      secondary: 'View Features'
    },
    gradient: 'bg-gradient-to-br from-green-500/10 via-background to-teal-500/10'
  }
];
```

### 6. Performance Tips

1. **Optimize Images**: Use tools like TinyPNG or ImageOptim
2. **Compress Videos**: Use FFmpeg or online compression tools
3. **Lazy Loading**: Images/videos load as needed
4. **Preload**: Critical slides are preloaded for smooth transitions
5. **Responsive**: Media automatically adapts to screen sizes

### 7. Accessibility

- Always provide meaningful `alt` text for images
- Include captions for videos when possible
- Ensure good color contrast for text overlays
- Test with screen readers

### 8. Advanced Customization

You can also customize animations, transitions, and layout by modifying the `HeroSlider` component in:
`src/components/ui/hero-slider.tsx`