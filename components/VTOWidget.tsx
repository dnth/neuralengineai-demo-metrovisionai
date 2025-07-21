"use client"

import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

// Dynamic import to handle library loading safely
let JEELIZVTOWIDGET: any = null

interface VTOWidgetProps {
  selectedFrame: {
    id: number
    name: string
    price: number
    style: string
    match: number
  } | null
  onBack: () => void
  onAddToCart: () => void
}

export default function VTOWidget({ selectedFrame, onBack, onAddToCart }: VTOWidgetProps) {
  const refPlaceHolder = useRef<HTMLDivElement>(null)
  const refCanvas = useRef<HTMLCanvasElement>(null)
  const refAdjustEnter = useRef<HTMLDivElement>(null)
  const refAdjust = useRef<HTMLDivElement>(null)
  const refChangeModel = useRef<HTMLDivElement>(null)
  const refLoading = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [libraryLoaded, setLibraryLoaded] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [demoMode, setDemoMode] = useState(false)
  const maxRetries = 3

  // Safely load the JEELIZVTOWIDGET library
  const loadVTOLibrary = async (): Promise<boolean> => {
    try {
      if (JEELIZVTOWIDGET) {
        return true
      }
      
      // Dynamic import the library
      const vtoModule = await import('jeelizvtowidget')
      JEELIZVTOWIDGET = vtoModule.JEELIZVTOWIDGET
      setLibraryLoaded(true)
      return true
    } catch (error) {
      console.error('Failed to load VTO library:', error)
      return false
    }
  }

  // Wait for library to be ready with polling
  const waitForLibraryReady = (timeout = 5000): Promise<boolean> => {
    return new Promise((resolve) => {
      const startTime = Date.now()
      
      const checkReady = () => {
        if (JEELIZVTOWIDGET && typeof JEELIZVTOWIDGET.start === 'function') {
          resolve(true)
          return
        }
        
        if (Date.now() - startTime > timeout) {
          resolve(false)
          return
        }
        
        setTimeout(checkReady, 100)
      }
      
      checkReady()
    })
  }

  const toggle_loading = (isLoadingVisible: boolean) => {
    setIsLoading(isLoadingVisible)
    if (refLoading.current) {
      refLoading.current.style.display = isLoadingVisible ? 'block' : 'none'
    }
  }

  const enter_adjustMode = () => {
    if (!isInitialized) {
      console.warn('VTO Widget not ready yet')
      return
    }
    try {
      if (JEELIZVTOWIDGET && typeof JEELIZVTOWIDGET.enter_adjustMode === 'function') {
        JEELIZVTOWIDGET.enter_adjustMode()
        if (refAdjustEnter.current) refAdjustEnter.current.style.display = 'none'
        if (refAdjust.current) refAdjust.current.style.display = 'block'
        if (refChangeModel.current) refChangeModel.current.style.display = 'none'
      }
    } catch (error) {
      console.error('Error entering adjust mode:', error)
    }
  }

  const exit_adjustMode = () => {
    if (!isInitialized) {
      console.warn('VTO Widget not ready yet')
      return
    }
    try {
      if (JEELIZVTOWIDGET && typeof JEELIZVTOWIDGET.exit_adjustMode === 'function') {
        JEELIZVTOWIDGET.exit_adjustMode()
        if (refAdjustEnter.current) refAdjustEnter.current.style.display = 'block'
        if (refAdjust.current) refAdjust.current.style.display = 'none'
        if (refChangeModel.current) refChangeModel.current.style.display = 'block'
      }
    } catch (error) {
      console.error('Error exiting adjust mode:', error)
    }
  }

  const set_glassesModel = (sku: string) => {
    if (!isInitialized) {
      console.warn('VTO Widget not ready yet')
      return
    }
    try {
      if (JEELIZVTOWIDGET && typeof JEELIZVTOWIDGET.load === 'function') {
        JEELIZVTOWIDGET.load(sku)
      }
    } catch (error) {
      console.error('Error loading glasses model:', error)
    }
  }

  const init_VTOWidget = async (placeHolder: HTMLDivElement, canvas: HTMLCanvasElement) => {
    try {
      // First, ensure the library is loaded
      const libraryLoaded = await loadVTOLibrary()
      if (!libraryLoaded) {
        setHasError(true)
        setErrorMessage('Failed to load virtual try-on library. Please refresh the page.')
        setIsLoading(false)
        return
      }

      // Wait for library to be fully ready
      const isReady = await waitForLibraryReady(10000) // 10 second timeout
      if (!isReady) {
        setHasError(true)
        setErrorMessage('Virtual try-on library is taking too long to initialize. Please try again.')
        setIsLoading(false)
        return
      }

      // Additional safety check
      if (!JEELIZVTOWIDGET || typeof JEELIZVTOWIDGET.start !== 'function') {
        setHasError(true)
        setErrorMessage('Virtual try-on library is not properly initialized.')
        setIsLoading(false)
        return
      }
      
      JEELIZVTOWIDGET.start({
      placeHolder,
      canvas,
      callbacks: {
        ADJUST_START: null,
        ADJUST_END: null,
        LOADING_START: toggle_loading.bind(null, true),
        LOADING_END: toggle_loading.bind(null, false)
      },
      sku: 'rayban_aviator_or_vertFlash', // Default SKU
      // Use a base64 encoded target image as fallback
      searchImageMask: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjUwIiBzdHJva2U9IiNlZWVlZWUiIHN0cm9rZS13aWR0aD0iMTIiIGZpbGw9Im5vbmUiLz4KPGV4dCB4PSIyNTYiIHk9IjI3MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZWVlZWVlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb29rIEhlcmU8L3RleHQ+Cjwvc3ZnPgo=',
      searchImageColor: 0xeeeeee,
      searchImageRotationSpeed: -0.001,
      callbackReady: function(){
        console.log('INFO: JEELIZVTOWIDGET is ready')
        // Add a small delay to ensure everything is fully initialized
        setTimeout(() => {
          setIsInitialized(true)
          setIsLoading(false)
        }, 500)
      },
      onError: function(errorLabel: string){
        console.error('VTO Widget Error:', errorLabel)
        let userMessage = ''
        switch(errorLabel) {
          case 'WEBCAM_UNAVAILABLE':
            userMessage = 'Camera access is required for virtual try-on. Please allow camera access and refresh.'
            break
          case 'INVALID_SKU':
            userMessage = 'Invalid glasses model selected.'
            break
          case 'PLACEHOLDER_NULL_WIDTH':
          case 'PLACEHOLDER_NULL_HEIGHT':
            userMessage = 'Display container issue. Please try refreshing the page.'
            break
          case 'NOT_READY':
            userMessage = 'Virtual try-on is still initializing. Please wait a moment and try again.'
            break
          default:
            userMessage = `Virtual try-on error: ${errorLabel}. Please try refreshing the page.`
            break
        }
        setHasError(true)
        setErrorMessage(userMessage)
        setIsLoading(false)
        setIsInitialized(false)
      }
    })
    } catch (error) {
      console.error('Error initializing VTO Widget:', error)
      setHasError(true)
      setErrorMessage('Failed to initialize virtual try-on. Please refresh the page and try again.')
      setIsLoading(false)
      setIsInitialized(false)
    }
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let isMounted = true

    const initWithDelay = async () => {
      // Wait a bit to ensure DOM is fully ready
      timeoutId = setTimeout(async () => {
        if (!isMounted) return
        
        if (typeof window !== 'undefined' && refPlaceHolder.current && refCanvas.current) {
          try {
            await init_VTOWidget(refPlaceHolder.current, refCanvas.current)
          } catch (error) {
            console.error('Failed to initialize VTO widget:', error)
            if (isMounted) {
              setHasError(true)
              setErrorMessage('Failed to start virtual try-on. Please try again.')
              setIsLoading(false)
            }
          }
        }
      }, 500) // Increased delay for better stability
    }

    // Initialize after component mounts
    if (typeof window !== 'undefined') {
      initWithDelay()
    }

    return () => {
      isMounted = false
      
      // Clear timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      // Cleanup when component unmounts
      try {
        if (typeof window !== 'undefined' && JEELIZVTOWIDGET && typeof JEELIZVTOWIDGET.destroy === 'function') {
          JEELIZVTOWIDGET.destroy()
        }
      } catch (e) {
        console.log('VTO widget cleanup:', e)
      }
      
      // Reset states
      setIsInitialized(false)
      setIsLoading(true)
      setHasError(false)
      setErrorMessage('')
      setRetryCount(0)
    }
  }, [])

  return (
    <div className="relative">
      {/* Main VTO Widget Container */}
      <div ref={refPlaceHolder} className="JeelizVTOWidget relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden">
        <canvas ref={refCanvas} className="JeelizVTOWidgetCanvas absolute inset-0 w-full h-full"></canvas>
        
        {/* Error Display */}
        {hasError && (
          <div className="absolute inset-0 bg-red-900/90 flex items-center justify-center z-30">
            <div className="text-white text-center p-6 max-w-sm">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-sm mb-4">{errorMessage}</p>
              <Button 
                onClick={async () => {
                  if (retryCount >= maxRetries) {
                    setErrorMessage('Maximum retries reached. Please refresh the page to try again.')
                    return
                  }
                  
                  setRetryCount(prev => prev + 1)
                  setHasError(false)
                  setErrorMessage('')
                  setIsLoading(true)
                  
                  // Retry initialization with exponential backoff
                  const delay = Math.min(1000 * Math.pow(2, retryCount), 5000)
                  setTimeout(async () => {
                    if (refPlaceHolder.current && refCanvas.current) {
                      try {
                        await init_VTOWidget(refPlaceHolder.current, refCanvas.current)
                      } catch (error) {
                        console.error('Retry failed:', error)
                        setHasError(true)
                        setErrorMessage('Retry failed. Please try again or refresh the page.')
                        setIsLoading(false)
                      }
                    }
                  }, delay)
                }}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                disabled={retryCount >= maxRetries}
              >
                {retryCount >= maxRetries ? 'Max Retries Reached' : `Try Again (${retryCount}/${maxRetries})`}
              </Button>
              {retryCount >= maxRetries && (
                <Button 
                  onClick={() => {
                    setDemoMode(true)
                    setHasError(false)
                    setIsLoading(false)
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-white border-white/20 mt-2"
                >
                  Use Demo Mode Instead
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Demo Mode Display */}
        {demoMode && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-purple-900/90 flex items-center justify-center z-25">
            <div className="text-white text-center p-6 max-w-sm">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👓</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Demo Mode</h3>
              <p className="text-sm mb-4 opacity-90">
                Virtual try-on simulation - Experience how {selectedFrame?.name} would look on you!
              </p>
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <div className="text-xs text-center opacity-75 mb-2">Simulating perfect fit...</div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <Button 
                onClick={() => setDemoMode(false)}
                variant="outline"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Close Demo
              </Button>
            </div>
          </div>
        )}
        
        {/* Initialization Loading Overlay */}
        {isLoading && !hasError && !demoMode && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
            <div className="text-white text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm">Initializing Virtual Try-On...</p>
              <p className="text-xs text-gray-300 mt-2">Please allow camera access when prompted</p>
            </div>
          </div>
        )}
        
        {/* Adjust Button */}
        <div ref={refAdjustEnter} className={`JeelizVTOWidgetControls absolute top-4 right-4 z-10 ${!isInitialized || hasError ? 'hidden' : ''}`}>
          <Button 
            onClick={enter_adjustMode}
            variant="secondary"
            size="sm"
            className="bg-black/50 hover:bg-black/70 text-white border-0"
            disabled={!isInitialized}
          >
            Adjust Fit
          </Button>
        </div>

        {/* Adjust Mode Notice */}
        <div ref={refAdjust} className="JeelizVTOWidgetAdjustNotice absolute inset-0 bg-black/70 text-white flex flex-col items-center justify-center text-center p-4" style={{display: 'none'}}>
          <p className="mb-4">Move the glasses to adjust their position and fit</p>
          <Button 
            onClick={exit_adjustMode}
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            Done Adjusting
          </Button>
        </div>

        {/* Model Selection */}
        <div ref={refChangeModel} className={`JeelizVTOWidgetControls absolute bottom-4 left-4 right-4 z-10 ${!isInitialized || hasError ? 'hidden' : ''}`}>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button 
              onClick={() => set_glassesModel('rayban_aviator_or_vertFlash')}
              variant="secondary"
              size="sm"
              className="bg-black/50 hover:bg-black/70 text-white border-0 text-xs"
              disabled={!isInitialized}
            >
              Classic Aviator
            </Button>
            <Button 
              onClick={() => set_glassesModel('rayban_round_cuivre_pinkBrownDegrade')}
              variant="secondary"
              size="sm"
              className="bg-black/50 hover:bg-black/70 text-white border-0 text-xs"
              disabled={!isInitialized}
            >
              Round Frame
            </Button>
            <Button 
              onClick={() => set_glassesModel('carrera_113S_blue')}
              variant="secondary"
              size="sm"
              className="bg-black/50 hover:bg-black/70 text-white border-0 text-xs"
              disabled={!isInitialized}
            >
              Modern Blue
            </Button>
          </div>
        </div>

        {/* VTO Widget Loading Overlay (for model changes) */}
        <div ref={refLoading} className="JeelizVTOWidgetLoading absolute inset-0 bg-black/70 flex items-center justify-center z-30" style={{display: 'none'}}>
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-lg">Loading Frame Model...</div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Results
        </Button>
        <Button 
          onClick={onAddToCart} 
          className="flex-1" 
          disabled={!isInitialized && !demoMode && hasError}
        >
          {hasError && !demoMode ? 'Try-On Unavailable' : `Add to Cart - RM${selectedFrame?.price || 0}`}
        </Button>
      </div>
      
      {hasError && !demoMode && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ℹ️ Virtual try-on is temporarily unavailable, but you can still purchase this item based on the product details and your preferences.
          </p>
        </div>
      )}

      {demoMode && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            🎭 Demo mode active - This simulates how the frames would look. The actual virtual try-on uses your camera for real-time fitting.
          </p>
        </div>
      )}

      {selectedFrame && (
        <div className="mt-4 text-center">
          <h3 className="font-semibold">{selectedFrame.name}</h3>
          <p className="text-sm text-gray-600">{selectedFrame.style}</p>
          <p className="text-sm font-medium text-green-600">{selectedFrame.match}% Match</p>
        </div>
      )}
    </div>
  )
} 