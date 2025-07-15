declare module 'jeelizvtowidget' {
  export interface VTOCallbacks {
    ADJUST_START?: (() => void) | null
    ADJUST_END?: (() => void) | null
    LOADING_START?: (() => void) | null
    LOADING_END?: (() => void) | null
  }

  export interface VTOConfig {
    placeHolder: HTMLElement
    canvas: HTMLCanvasElement
    callbacks?: VTOCallbacks
    sku?: string
    searchImageMask?: string
    searchImageColor?: number
    searchImageRotationSpeed?: number
    callbackReady?: () => void
    onError?: (errorLabel: string) => void
  }

  export interface JEELIZVTO {
    // Add JEELIZVTO methods as needed
  }

  export interface JEELIZVTOWidget {
    start: (config: VTOConfig) => void
    destroy: () => void
    load: (sku: string) => void
    enter_adjustMode: () => void
    exit_adjustMode: () => void
  }

  export const JEELIZVTO: JEELIZVTO
  export const JEELIZVTOWIDGET: JEELIZVTOWidget
} 