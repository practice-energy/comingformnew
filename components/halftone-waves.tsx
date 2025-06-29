"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

export default function Component() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [displayText, setDisplayText] = useState("Новый опыт взаимодействия близко")
  const [textOpacity, setTextOpacity] = useState(1)
  const [formOpacity, setFormOpacity] = useState(1)

  const originalText = "Новый опыт взаимодействия близко"
  const newText = "Вскоре вы получите приглашение: адрес принят"

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let time = 0
    let iterationCount = 0
    let violetCircles = new Set<string>()
    let nextVioletCircles = new Set<string>()
    let transitionProgress = 0

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const generateVioletCircles = (rows: number, cols: number) => {
      const totalCircles = rows * cols
      const violetCount = Math.floor(totalCircles * 0.04) // 4% кругов
      const circles = new Set<string>()

      while (circles.size < violetCount) {
        const x = Math.floor(Math.random() * cols)
        const y = Math.floor(Math.random() * rows)
        circles.add(`${x}-${y}`)
      }

      return circles
    }

    const drawHalftoneWave = () => {
      // Адаптивный размер сетки - меньше на мобильных для большей области анимации
      const isMobile = window.innerWidth < 768
      const gridSize = isMobile ? 15 : 20
      const rows = Math.ceil(canvas.height / gridSize)
      const cols = Math.ceil(canvas.width / gridSize)

      // Обновляем фиолетовые круги каждую четвертую итерацию
      if (iterationCount % 4 === 0) {
        nextVioletCircles = generateVioletCircles(rows, cols)
        transitionProgress = 0
      }

      // Плавный переход между наборами фиолетовых кругов
      if (iterationCount % 4 === 1) {
        transitionProgress = Math.min(transitionProgress + 0.1, 1)
        if (transitionProgress >= 1) {
          violetCircles = new Set(nextVioletCircles)
        }
      }

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const centerX = x * gridSize
          const centerY = y * gridSize
          const distanceFromCenter = Math.sqrt(
            Math.pow(centerX - canvas.width / 2, 2) + Math.pow(centerY - canvas.height / 2, 2),
          )
          const maxDistance = Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2))
          const normalizedDistance = distanceFromCenter / maxDistance

          // Уменьшенная интенсивность волн на 50%
          const waveIntensity = isMobile ? 6 : 5
          const waveOffset = Math.sin(normalizedDistance * waveIntensity - time) * 0.5 + 0.5
          const size = gridSize * waveOffset * (isMobile ? 0.45 : 0.4)

          const circleKey = `${x}-${y}`
          const isCurrentViolet = violetCircles.has(circleKey)
          const isNextViolet = nextVioletCircles.has(circleKey)

          // Определяем, должен ли круг быть фиолетовым с учетом перехода
          let isViolet = false
          if (iterationCount % 4 === 1 && transitionProgress < 1) {
            // Во время перехода
            if (isCurrentViolet && !isNextViolet) {
              // Исчезающий фиолетовый круг
              isViolet = Math.random() > transitionProgress
            } else if (!isCurrentViolet && isNextViolet) {
              // Появляющийся фиолетовый круг
              isViolet = Math.random() < transitionProgress
            } else if (isCurrentViolet && isNextViolet) {
              // Остается фиолетовым
              isViolet = true
            }
          } else {
            isViolet = violetCircles.has(circleKey)
          }

          ctx.beginPath()
          ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2)

          if (isViolet) {
            // Фиолетовый цвет кнопки (violet-600: #7c3aed)
            ctx.fillStyle = `rgba(124, 58, 237, ${waveOffset * (isMobile ? 0.3 : 0.25)})`
          } else {
            // Обычный белый цвет
            ctx.fillStyle = `rgba(255, 255, 255, ${waveOffset * (isMobile ? 0.125 : 0.1)})`
          }

          ctx.fill()
        }
      }

      iterationCount++
    }

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      drawHalftoneWave()

      time += 0.03
      animationFrameId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  useEffect(() => {
    if (isSubmitted) {
      // Text animation: fade out -> change text -> fade in (3 seconds total)
      const fadeOutDuration = 1500 // 1.5 seconds fade out
      const fadeInDuration = 1500 // 1.5 seconds fade in

      // Fade out
      let fadeOutStep = 0
      const fadeOutSteps = 30
      const fadeOutTimer = setInterval(() => {
        const progress = fadeOutStep / fadeOutSteps
        setTextOpacity(1 - progress)
        fadeOutStep++

        if (fadeOutStep >= fadeOutSteps) {
          clearInterval(fadeOutTimer)
          // Change text
          setDisplayText(newText)

          // Fade in
          let fadeInStep = 0
          const fadeInTimer = setInterval(() => {
            const progress = fadeInStep / fadeOutSteps
            setTextOpacity(progress)
            fadeInStep++

            if (fadeInStep >= fadeOutSteps) {
              clearInterval(fadeInTimer)
              setTextOpacity(1)

              // Start form fade out after text animation completes (3 seconds)
              setTimeout(() => {
                let formFadeStep = 0
                const formFadeSteps = 60
                const formFadeTimer = setInterval(() => {
                  const progress = formFadeStep / formFadeSteps
                  setFormOpacity(1 - progress)
                  formFadeStep++

                  if (formFadeStep >= formFadeSteps) {
                    clearInterval(formFadeTimer)
                    setFormOpacity(0)
                  }
                }, 50) // 3 seconds total (60 * 50ms)
              }, 0)
            }
          }, fadeInDuration / fadeOutSteps)
        }
      }, fadeOutDuration / fadeOutSteps)
    }
  }, [isSubmitted, newText])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError("")

    if (!email) {
      setEmailError("Введите email адрес")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Введите корректный email адрес")
      return
    }

    setIsSubmitted(true)
    console.log("Email submitted:", email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (emailError) {
      setEmailError("")
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-screen bg-black" />

      {/* Logo - Centered with black color */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[251px] h-[225px] relative">
          <Image src="/logo_coming.svg" alt="Coming Logo" width={251} height={225} className="w-full h-full" />
        </div>
      </div>

      {/* Text - Same width as form, no padding (отступ от блока до текста = 0) */}
      <div className="absolute top-8 sm:top-12 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div
          className="text-center pointer-events-none w-[90vw] sm:w-[720px] max-w-[720px]"
          style={{ opacity: textOpacity }}
        >
          <p
            className="font-semibold tracking-normal"
            style={{
              color: "rgba(255, 255, 255, 0.95)",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
              fontSize: "clamp(1.575rem, 4vw, 2.52rem)", // Увеличено на 5% от text-2xl/3xl/4xl
              textShadow:
                "1px 1px 0 rgba(0, 0, 0, 0.8), -1px -1px 0 rgba(0, 0, 0, 0.8), 1px -1px 0 rgba(0, 0, 0, 0.8), -1px 1px 0 rgba(0, 0, 0, 0.8)", // Обводка
            }}
          >
            {displayText}
          </p>
        </div>
      </div>

      {/* Form - Exact same width as text block */}
      <div
        className="absolute bottom-5 sm:bottom-7 left-1/2 transform -translate-x-1/2 pointer-events-auto"
        style={{ opacity: formOpacity }}
      >
        <div className="w-[90vw] sm:w-[720px] max-w-[720px] h-[102px] sm:h-[130px] bg-white/10 border border-white/20 rounded backdrop-blur-sm p-2.5 sm:p-3.5 relative">
          {/* Email input */}
          <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 right-2.5 sm:right-3.5">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Введите ваш email"
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/20 border ${emailError ? "border-red-400" : "border-white/30"} rounded text-white placeholder-white/70 focus:outline-none focus:ring-2 ${emailError ? "focus:ring-red-400" : "focus:ring-white/50"} focus:border-transparent text-sm sm:text-base`}
              required
            />
          </div>

          {/* Submit button with arrow icon - Bottom right corner with proper spacing */}
          <button
            onClick={handleSubmit}
            className="absolute bottom-2.5 sm:bottom-3.5 right-2.5 sm:right-3.5 bg-violet-600 text-white p-2 sm:p-2.5 rounded font-medium hover:bg-violet-700 transition-colors duration-200 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>

          {/* Error message */}
          {emailError && (
            <div className="absolute top-[42px] sm:top-[51px] left-2.5 sm:left-3.5 text-red-400 text-xs sm:text-sm mt-1">
              {emailError}
            </div>
          )}

          {/* Buttons section - Bottom left corner */}
          <div className="absolute bottom-2.5 sm:bottom-3.5 left-2.5 sm:left-3.5 flex gap-2">
            <div className="bg-violet-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm flex items-center gap-1">
              <svg width="10" height="10" className="sm:w-3 sm:h-3" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 1a.5.5 0 0 1 .5.5v4h4a.5.5 0 0 1 0 1h-4v4a.5.5 0 0 1-1 0v-4h-4a.5.5 0 0 1 0-1h4v-4A.5.5 0 0 1 6 1z" />
              </svg>
              <svg width="10" height="10" className="sm:w-3 sm:h-3" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2 2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2zm1 0v8h6V2H3z" />
              </svg>
            </div>
            <div className="bg-violet-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded text-xs sm:text-sm flex items-center justify-center">
              Практис
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
