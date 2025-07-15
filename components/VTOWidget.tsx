"use client"

import React, { useRef, useEffect, useState } from 'react'
import { JEELIZVTOWIDGET } from 'jeelizvtowidget'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

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
      JEELIZVTOWIDGET.enter_adjustMode()
      if (refAdjustEnter.current) refAdjustEnter.current.style.display = 'none'
      if (refAdjust.current) refAdjust.current.style.display = 'block'
      if (refChangeModel.current) refChangeModel.current.style.display = 'none'
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
      JEELIZVTOWIDGET.exit_adjustMode()
      if (refAdjustEnter.current) refAdjustEnter.current.style.display = 'block'
      if (refAdjust.current) refAdjust.current.style.display = 'none'
      if (refChangeModel.current) refChangeModel.current.style.display = 'block'
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
      JEELIZVTOWIDGET.load(sku)
    } catch (error) {
      console.error('Error loading glasses model:', error)
    }
  }

  const init_VTOWidget = (placeHolder: HTMLDivElement, canvas: HTMLCanvasElement) => {
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
        switch(errorLabel) {
          case 'WEBCAM_UNAVAILABLE':
            alert('Camera access is required for virtual try-on. Please allow camera access and refresh.')
            break
          case 'INVALID_SKU':
            console.error('Invalid glasses model')
            break
          case 'PLACEHOLDER_NULL_WIDTH':
          case 'PLACEHOLDER_NULL_HEIGHT':
            console.error('VTO widget container issue')
            break
          default:
            alert('An error occurred with the virtual try-on. Please try again.')
            break
        }
      }
    })
  }

  useEffect(() => {
    // Only initialize if we're in the browser environment
    if (typeof window !== 'undefined' && refPlaceHolder.current && refCanvas.current) {
      init_VTOWidget(refPlaceHolder.current, refCanvas.current)
    }

    return () => {
      // Cleanup when component unmounts
      try {
        if (typeof window !== 'undefined') {
          JEELIZVTOWIDGET.destroy()
        }
      } catch (e) {
        console.log('VTO widget cleanup:', e)
      }
    }
  }, [])

  return (
    <div className="relative">
      {/* Main VTO Widget Container */}
      <div ref={refPlaceHolder} className="JeelizVTOWidget relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden">
        <canvas ref={refCanvas} className="JeelizVTOWidgetCanvas absolute inset-0 w-full h-full"></canvas>
        
        {/* Initialization Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
            <div className="text-white text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm">Initializing Virtual Try-On...</p>
              <p className="text-xs text-gray-300 mt-2">Please allow camera access</p>
            </div>
          </div>
        )}
        
        {/* Adjust Button */}
        <div ref={refAdjustEnter} className="JeelizVTOWidgetControls absolute top-4 right-4 z-10">
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
        <div ref={refChangeModel} className="JeelizVTOWidgetControls absolute bottom-4 left-4 right-4 z-10">
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
        <Button onClick={onAddToCart} className="flex-1" disabled={!isInitialized}>
          Add to Cart - RM{selectedFrame?.price || 0}
        </Button>
      </div>

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