// Type declarations for @google/model-viewer

declare module '@google/model-viewer' {
    export { }
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': ModelViewerJSX & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
        }
    }

    interface ModelViewerJSX {
        src?: string
        alt?: string
        poster?: string
        loading?: 'auto' | 'lazy' | 'eager'
        reveal?: 'auto' | 'interaction' | 'manual'
        'auto-rotate'?: boolean
        'auto-rotate-delay'?: number | string
        'rotation-per-second'?: string
        'camera-controls'?: boolean
        'camera-orbit'?: string
        'camera-target'?: string
        'field-of-view'?: string
        'min-camera-orbit'?: string
        'max-camera-orbit'?: string
        'min-field-of-view'?: string
        'max-field-of-view'?: string
        'interaction-prompt'?: 'auto' | 'when-focused' | 'none'
        'interaction-prompt-style'?: 'basic' | 'wiggle'
        'interaction-prompt-threshold'?: number | string
        ar?: boolean
        'ar-modes'?: string
        'ar-scale'?: 'auto' | 'fixed'
        'ar-placement'?: 'floor' | 'wall'
        'ios-src'?: string
        xr?: boolean
        'quick-look-browsers'?: string
        'environment-image'?: string
        'skybox-image'?: string
        exposure?: string | number
        'shadow-intensity'?: string | number
        'shadow-softness'?: string | number
        'animation-name'?: string
        'animation-crossfade-duration'?: number | string
        autoplay?: boolean
        'variant-name'?: string
        orientation?: string
        scale?: string
        'touch-action'?: string
        'disable-zoom'?: boolean
        'disable-pan'?: boolean
        'disable-tap'?: boolean
        bounds?: 'tight' | 'legacy'
        'interpolation-decay'?: number | string
        ref?: any
        style?: React.CSSProperties
        className?: string
    }
}

export { }
