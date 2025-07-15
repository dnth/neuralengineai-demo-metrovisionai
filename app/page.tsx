"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, MessageCircle, Sparkles, ShoppingCart, Star, ArrowLeft, ArrowRight } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import VTOWidget with no SSR to prevent server-side rendering issues
const VTOWidget = dynamic(() => import("@/components/VTOWidget"), {
  ssr: false,
  loading: () => (
    <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Virtual Try-On...</p>
      </div>
    </div>
  )
})

// MOG Malaysia frame data
const mockFrames = [
  {
    id: 1,
    name: "Gucci Glasses",
    price: 1680,
    image: "/placeholder.svg?brand=gucci",
    description: "Ultra-chic, iconic double G logo. Vintage aviators, cat-eye, rimless. Titanium & plant-based acetate. Non-slip temples, ergonomic nose pads.",
    style: "luxury, vintage, cat-eye, aviator, rimless",
    match: 98,
    features: ["Titanium/acetate", "Non-slip temples", "Ergonomic nose pads"],
  },
  {
    id: 2,
    name: "Burberry Glasses",
    price: 1350,
    image: "/placeholder.svg?brand=burberry",
    description: "British heritage, tartan & trench details. Rectangular, butterfly, cat-eye. Premium acetate & metal. Hard case included.",
    style: "rectangular, butterfly, cat-eye, tartan",
    match: 94,
    features: ["Premium acetate/metal", "Heritage design", "Hard case included"],
  },
  {
    id: 3,
    name: "Tom Ford Glasses",
    price: 1580,
    image: "/placeholder.svg?brand=tomford",
    description: "Sleek, statement styles. Bold acetates, elegant metals. Signature 'T' logo, flexible hinges. Retro-modern flair.",
    style: "wayfarer, cat-eye, bold, minimal",
    match: 92,
    features: ["T logo temples", "Flexible hinges", "Retro-modern"],
  },
  {
    id: 4,
    name: "DITA Glasses",
    price: 2200,
    image: "/placeholder.svg?brand=dita",
    description: "Japanese luxury. Titanium frames, diamond-pressed details. Custom nose pads. Lightweight, durable, hand-finished.",
    style: "aviator, rectangle, luxury, titanium",
    match: 90,
    features: ["Titanium", "Hand-finished", "Custom nose pads"],
  },
  {
    id: 5,
    name: "YSL (Yves Saint Laurent) Glasses",
    price: 1450,
    image: "/placeholder.svg?brand=ysl",
    description: "Modern, bold, avant-garde. Classic rectangles to oversized. Unique color combos, iconic YSL branding. Made in Italy.",
    style: "modern, bold, oversized, rectangle",
    match: 88,
    features: ["Italian made", "Avant-garde", "Iconic branding"],
  },
  {
    id: 6,
    name: "Nikon Lenses",
    price: 980,
    image: "/placeholder.svg?brand=nikon",
    description: "Advanced optics for eyewear. High light capture, minimal distortion, sharp vision. Single-vision, bifocal, progressive. Anti-reflective coatings.",
    style: "single-vision, bifocal, progressive",
    match: 86,
    features: ["High clarity", "Anti-reflective", "Durable"],
  },
  {
    id: 7,
    name: "Varilux Lenses",
    price: 1200,
    image: "/placeholder.svg?brand=varilux",
    description: "Premium progressive lenses. Seamless vision, W.A.V.E Technology, no 'fishbowl' effect. X Series, Comfort Max, Physio W3+.",
    style: "progressive, premium, seamless",
    match: 85,
    features: ["W.A.V.E tech", "Wide vision zone", "Natural transitions"],
  },
  {
    id: 8,
    name: "MOG Own Brand Glasses",
    price: 480,
    image: "/placeholder.svg?brand=mog",
    description: "Lightweight, durable titanium. Designer-inspired, intricate temple details. Affordable, stylish, with after-sales care.",
    style: "titanium, everyday, affordable, designer-inspired",
    match: 83,
    features: ["Lightweight titanium", "Affordable", "After-sales care"],
  },
]

type Step = "selfie" | "chat" | "processing" | "results" | "tryOn" | "checkout" | "feedback"

interface UserPreferences {
  budget: string
  style: string
  faceShape: string
  inspirationPhoto?: string
}

export default function FrameFinderDemo() {
  const [currentStep, setCurrentStep] = useState<Step>("selfie")
  const [selfieImage, setSelfieImage] = useState<string>("")
  const [preferences, setPreferences] = useState<UserPreferences>({
    budget: "",
    style: "",
    faceShape: "heart-shaped",
  })
  const [selectedFrame, setSelectedFrame] = useState<(typeof mockFrames)[0] | null>(null)
  const [cartItems, setCartItems] = useState<typeof mockFrames>([])
  const [rating, setRating] = useState(0)
  const [chatStep, setChatStep] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [extendedPreferences, setExtendedPreferences] = useState({
    environment: "",
    screenTime: "",
    driving: "",
    specificNeeds: "",
  })

  useEffect(() => {
    // Cleanup camera when step changes or component unmounts
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        setIsCameraActive(false)
      }
    }
  }, [currentStep])

  const chatQuestions = [
    {
      question: "What's your budget range?",
      options: ["Under RM200", "RM200-350", "Premium (RM350+)"],
      type: "choice",
    },
    {
      question: "What's your style preference?",
      options: ["Classic", "Bold", "Vintage", "Modern", "Surprise me"],
      type: "choice",
    },
    {
      question: "Got an inspiration photo?",
      options: ["Add Photo", "Skip"],
      type: "choice",
    },
    {
      question: "Where do you spend most of your time?",
      options: ["Office/Indoor", "Outdoors", "Mixed environments", "Home/Remote work"],
      type: "choice",
    },
    {
      question: "How many hours daily do you spend on digital screens?",
      options: ["Less than 2 hours", "2-6 hours", "6-10 hours", "More than 10 hours"],
      type: "choice",
    },
    {
      question: "Do you drive regularly?",
      options: ["Daily commuter", "Weekend driver", "Occasional", "Rarely/Never"],
      type: "choice",
    },
    {
      question: "Any specific needs or preferences? (e.g., reading glasses, sports, fashion)",
      placeholder: "Tell us about your lifestyle, work, hobbies, or any specific requirements...",
      type: "text",
    },
  ]

  const startCamera = async () => {
    try {
      console.log("Requesting camera access...")
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } 
      })
      console.log("Camera access granted, setting up video stream...")
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Force video element to update
        videoRef.current.style.display = 'block'
        
        // Wait for metadata and play
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, attempting to play...")
          const playPromise = videoRef.current?.play()
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Video playing successfully")
                setIsCameraActive(true)
              })
              .catch(error => {
                console.error("Error playing video:", error)
              })
          }
        }

        // Add error handler
        videoRef.current.onerror = (error) => {
          console.error("Video element error:", error)
        }
      } else {
        console.error("Video ref is not available")
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      alert("Could not access camera. Please ensure you have granted camera permissions.")
      // Use placeholder for demo
      setSelfieImage("/placeholder.svg?height=400&width=300")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL("image/jpeg")
      setSelfieImage(imageData)
      stopCamera()
    } else {
      // Demo fallback
      setSelfieImage("/placeholder.svg?height=400&width=300")
    }
    setCurrentStep("chat")
  }

  const handleChatResponse = (option: string) => {
    const newPreferences = { ...preferences }
    const newExtendedPreferences = { ...extendedPreferences }

    if (chatStep === 0) {
      newPreferences.budget = option
    } else if (chatStep === 1) {
      newPreferences.style = option.toLowerCase()
    } else if (chatStep === 3) {
      newExtendedPreferences.environment = option
    } else if (chatStep === 4) {
      newExtendedPreferences.screenTime = option
    } else if (chatStep === 5) {
      newExtendedPreferences.driving = option
    }

    setPreferences(newPreferences)
    setExtendedPreferences(newExtendedPreferences)

    if (chatStep < chatQuestions.length - 1) {
      setChatStep(chatStep + 1)
    } else {
      setCurrentStep("processing")
      setTimeout(() => {
        setCurrentStep("results")
      }, 3000)
    }
  }

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      setExtendedPreferences({
        ...extendedPreferences,
        specificNeeds: textInput,
      })
      setTextInput("")
      setCurrentStep("processing")
      setTimeout(() => {
        setCurrentStep("results")
      }, 3000)
    }
  }

  const selectFrame = (frame: (typeof mockFrames)[0]) => {
    setSelectedFrame(frame)
    setCurrentStep("tryOn")
  }

  const addToCart = () => {
    if (selectedFrame) {
      setCartItems([...cartItems, selectedFrame])
      setCurrentStep("checkout")
    }
  }

  const submitRating = (stars: number) => {
    setRating(stars)
    setCurrentStep("feedback")
  }

  const resetDemo = () => {
    setCurrentStep("selfie")
    setSelfieImage("")
    setPreferences({ budget: "", style: "", faceShape: "heart-shaped" })
    setSelectedFrame(null)
    setCartItems([])
    setRating(0)
    setChatStep(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">🕶️ Metro Vision AI</h1>
          <p className="text-sm text-gray-600">AI-powered frame recommendations</p>
          <div className="flex justify-center mt-4">
            {["selfie", "chat", "processing", "results", "tryOn", "checkout"].map((step, index) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full mx-1 ${
                  ["selfie", "chat", "processing", "results", "tryOn", "checkout"].indexOf(currentStep) >= index
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Selfie Capture */}
        {currentStep === "selfie" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Let's find your perfect frames
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                {selfieImage ? (
                  <img src={selfieImage || "/placeholder.svg"} alt="Selfie" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline
                      muted
                      className={`absolute inset-0 w-full h-full object-cover mirror-mode ${isCameraActive ? 'block' : 'hidden'}`}
                      style={{ 
                        transform: 'scaleX(-1)',
                        backgroundColor: 'black'
                      }}
                    />
                    {isCameraActive ? (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center bg-black/30 p-4 rounded-lg text-white">
                          <Camera className="w-12 h-12 mx-auto mb-2" />
                          <p>Center your face in the frame</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500 mb-4">Click below to start camera</p>
                        <Button 
                          onClick={startCamera} 
                          variant="secondary"
                          className="min-w-[150px]"
                        >
                          Start Camera
                        </Button>
                      </div>
                    )}
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={capturePhoto} 
                  className="flex-1"
                  disabled={!isCameraActive && !selfieImage}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Snap It
                </Button>
                <Button variant="outline" onClick={capturePhoto} className="flex-1 bg-transparent">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                💡 Demo tip: Click either button to continue with a sample selfie
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Chat Preferences */}
        {currentStep === "chat" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Let's find your perfect match...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="font-medium mb-3">{chatQuestions[chatStep].question}</p>

                {chatQuestions[chatStep].type === "choice" ? (
                  <div className="space-y-2">
                    {chatQuestions[chatStep].options?.map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        onClick={() => handleChatResponse(option)}
                        className="w-full justify-start"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={chatQuestions[chatStep].placeholder}
                      className="w-full p-3 border rounded-lg resize-none h-24 text-sm"
                    />
                    <Button onClick={handleTextSubmit} disabled={!textInput.trim()} className="w-full">
                      Continue
                    </Button>
                  </div>
                )}
              </div>

              {/* Progress indicators */}
              <div className="space-y-1 text-xs text-gray-600">
                {preferences.budget && <div>✓ Budget: {preferences.budget}</div>}
                {preferences.style && <div>✓ Style: {preferences.style}</div>}
                {extendedPreferences.environment && <div>✓ Environment: {extendedPreferences.environment}</div>}
                {extendedPreferences.screenTime && <div>✓ Screen time: {extendedPreferences.screenTime}</div>}
                {extendedPreferences.driving && <div>✓ Driving: {extendedPreferences.driving}</div>}
                {extendedPreferences.specificNeeds && <div>✓ Special needs noted</div>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Processing */}
        {currentStep === "processing" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin" />
                Analyzing your perfect match...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>✓ Heart-shaped face detected</p>
                  <p>✓ {preferences.style} style preference noted</p>
                  <p>✓ Budget range: {preferences.budget}</p>
                  {extendedPreferences.environment && <p>✓ Environment: {extendedPreferences.environment}</p>}
                  {extendedPreferences.screenTime && <p>✓ Screen usage: {extendedPreferences.screenTime}</p>}
                  {extendedPreferences.driving && <p>✓ Driving habits: {extendedPreferences.driving}</p>}
                  <p className="animate-pulse">🧠 Running multimodal retrieval...</p>
                  <p className="animate-pulse">🔍 Matching MOG Malaysia catalog...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Results */}
        {currentStep === "results" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🏆 Your Top Frames</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {mockFrames.slice(0, 6).map((frame, index) => (
                  <div
                    key={frame.id}
                    className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => selectFrame(frame)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={frame.image || "/placeholder.svg"}
                        alt={frame.name}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {index + 1}. {frame.name}
                          </h3>
                          <Badge variant="secondary">{frame.match}% match</Badge>
                        </div>
                        <p className="text-sm text-gray-600">RM{frame.price}</p>
                        <p className="text-xs text-gray-500">{frame.description}</p>
                        <div className="flex gap-1 mt-1">
                          {frame.features.slice(0, 2).map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: AR Try-On */}
        {currentStep === "tryOn" && selectedFrame && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">👓 Live Virtual Try-On: {selectedFrame.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <VTOWidget 
                selectedFrame={selectedFrame}
                onBack={() => setCurrentStep("results")}
                onAddToCart={addToCart}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 6: Checkout */}
        {currentStep === "checkout" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Your Cart
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.style}</p>
                  </div>
                  <p className="font-medium">RM{item.price}</p>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span>Subtotal:</span>
                  <span>RM{cartItems.reduce((sum, item) => sum + item.price, 0)}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span>Shipping:</span>
                  <span className="text-green-600">Free 2-day</span>
                </div>
                <Button className="w-full mb-3">
                  Buy Now - RM{cartItems.reduce((sum, item) => sum + item.price, 0)}
                </Button>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Rate this recommendation:</p>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 cursor-pointer ${
                          star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                        onClick={() => submitRating(star)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 7: Feedback */}
        {currentStep === "feedback" && (
          <Card>
            <CardHeader>
              <CardTitle>🎉 Thanks for your feedback!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Your feedback improved our AI:</h3>
                <ul className="text-sm space-y-1">
                  <li>• "{selectedFrame?.name}" + heart-shaped ↑ 3%</li>
                  <li>• {preferences.style} preference ↑ 5%</li>
                  <li>• Budget accuracy ↑ 2%</li>
                </ul>
              </div>
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">📬 Get notified when new frames arrive that match your style</p>
                <Button onClick={resetDemo} className="w-full">
                  Try Another Style
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demo Controls */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-2">
            💡 This is a 100% client-side demo. Click blue buttons to navigate.
          </p>
          <Button variant="outline" size="sm" onClick={resetDemo}>
            Reset Demo
          </Button>
        </div>
      </div>
    </div>
  )
}
