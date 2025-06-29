/**
 * Cloudflare Worker для деплоя Halftone Waves App
 */

import type { ExecutionContext } from "@cloudflare/workers-types"

export type Env = {}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // Обработка статических файлов
    if (
      url.pathname.startsWith("/public/") ||
      url.pathname.startsWith("/_next/") ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".svg") ||
      url.pathname.endsWith(".ico") ||
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".js")
    ) {
      // Возвращаем статические файлы как есть
      return fetch(request)
    }

    // Основная HTML страница
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(getIndexHTML(), {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "public, max-age=3600",
        },
      })
    }

    // API для обработки email подписки
    if (url.pathname === "/api/subscribe" && request.method === "POST") {
      try {
        const body = (await request.json()) as { email: string }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(body.email)) {
          return new Response(JSON.stringify({ error: "Invalid email format" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          })
        }

        // Здесь можно добавить логику сохранения email
        // Например, в Cloudflare KV или D1 Database
        console.log("Email submitted:", body.email)

        return new Response(JSON.stringify({ success: true, message: "Email submitted successfully" }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        })
      } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid request body" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
    }

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      })
    }

    // 404 для всех остальных маршрутов
    return new Response("Not Found", { status: 404 })
  },
}

function getIndexHTML(): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Halftone Waves</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        .text-outline {
            text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.8), 
                        -1px -1px 0 rgba(0, 0, 0, 0.8), 
                        1px -1px 0 rgba(0, 0, 0, 0.8), 
                        -1px 1px 0 rgba(0, 0, 0, 0.8);
        }
    </style>
</head>
<body class="bg-black">
    <div class="relative w-full h-screen overflow-hidden">
        <canvas id="halftoneCanvas" class="w-full h-screen bg-black"></canvas>
        
        <!-- Logo -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-[251px] h-[225px] relative">
                <svg width="251" height="225" viewBox="0 0 251 225" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M125.5 0L251 225H0L125.5 0Z" fill="white" opacity="0.1"/>
                    <text x="125.5" y="120" text-anchor="middle" fill="white" font-size="24" font-weight="bold">COMING</text>
                </svg>
            </div>
        </div>

        <!-- Text -->
        <div class="absolute top-8 sm:top-12 left-1/2 transform -translate-x-1/2 pointer-events-none">
            <div class="text-center pointer-events-none w-[90vw] sm:w-[720px] max-w-[720px]" id="mainText">
                <p class="font-semibold tracking-normal text-outline" style="color: rgba(255, 255, 255, 0.95); font-size: clamp(1.575rem, 4vw, 2.52rem);">
                    Новый опыт взаимодействия близко
                </p>
            </div>
        </div>

        <!-- Form -->
        <div class="absolute bottom-5 sm:bottom-7 left-1/2 transform -translate-x-1/2 pointer-events-auto" id="emailForm">
            <div class="w-[90vw] sm:w-[720px] max-w-[720px] h-[102px] sm:h-[130px] bg-white/10 border border-white/20 rounded backdrop-blur-sm p-2.5 sm:p-3.5 relative">
                <div class="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 right-2.5 sm:right-3.5">
                    <input
                        type="email"
                        id="emailInput"
                        placeholder="Введите ваш email"
                        class="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/20 border border-white/30 rounded text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm sm:text-base"
                        required
                    />
                </div>

                <button
                    id="submitBtn"
                    class="absolute bottom-2.5 sm:bottom-3.5 right-2.5 sm:right-3.5 bg-violet-600 text-white p-2 sm:p-2.5 rounded font-medium hover:bg-violet-700 transition-colors duration-200 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                </button>

                <div id="errorMessage" class="absolute top-[42px] sm:top-[51px] left-2.5 sm:left-3.5 text-red-400 text-xs sm:text-sm mt-1 hidden"></div>

                <div class="absolute bottom-2.5 sm:bottom-3.5 left-2.5 sm:left-3.5 flex gap-2">
                    <div class="bg-violet-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm flex items-center gap-1">
                        <svg width="10" height="10" class="sm:w-3 sm:h-3" viewBox="0 0 12 12" fill="currentColor">
                            <path d="M6 1a.5.5 0 0 1 .5.5v4h4a.5.5 0 0 1 0 1h-4v4a.5.5 0 0 1-1 0v-4h-4a.5.5 0 0 1 0-1h4v-4A.5.5 0 0 1 6 1z" />
                        </svg>
                        <svg width="10" height="10" class="sm:w-3 sm:h-3" viewBox="0 0 12 12" fill="currentColor">
                            <path d="M2 2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2zm1 0v8h6V2H3z" />
                        </svg>
                    </div>
                    <div class="bg-violet-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded text-xs sm:text-sm flex items-center justify-center">
                        Практис
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Halftone animation
        const canvas = document.getElementById('halftoneCanvas');
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = 0;
        let iterationCount = 0;
        let violetCircles = new Set();
        let nextVioletCircles = new Set();
        let transitionProgress = 0;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function generateVioletCircles(rows, cols) {
            const totalCircles = rows * cols;
            const violetCount = Math.floor(totalCircles * 0.04);
            const circles = new Set();

            while (circles.size < violetCount) {
                const x = Math.floor(Math.random() * cols);
                const y = Math.floor(Math.random() * rows);
                circles.add(\`\${x}-\${y}\`);
            }

            return circles;
        }

        function drawHalftoneWave() {
            const isMobile = window.innerWidth < 768;
            const gridSize = isMobile ? 15 : 20;
            const rows = Math.ceil(canvas.height / gridSize);
            const cols = Math.ceil(canvas.width / gridSize);

            if (iterationCount % 4 === 0) {
                nextVioletCircles = generateVioletCircles(rows, cols);
                transitionProgress = 0;
            }

            if (iterationCount % 4 === 1) {
                transitionProgress = Math.min(transitionProgress + 0.1, 1);
                if (transitionProgress >= 1) {
                    violetCircles = new Set(nextVioletCircles);
                }
            }

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const centerX = x * gridSize;
                    const centerY = y * gridSize;
                    const distanceFromCenter = Math.sqrt(
                        Math.pow(centerX - canvas.width / 2, 2) + Math.pow(centerY - canvas.height / 2, 2)
                    );
                    const maxDistance = Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2));
                    const normalizedDistance = distanceFromCenter / maxDistance;

                    const waveIntensity = isMobile ? 6 : 5;
                    const waveOffset = Math.sin(normalizedDistance * waveIntensity - time) * 0.5 + 0.5;
                    const size = gridSize * waveOffset * (isMobile ? 0.45 : 0.4);

                    const circleKey = \`\${x}-\${y}\`;
                    const isCurrentViolet = violetCircles.has(circleKey);
                    const isNextViolet = nextVioletCircles.has(circleKey);

                    let isViolet = false;
                    if (iterationCount % 4 === 1 && transitionProgress < 1) {
                        if (isCurrentViolet && !isNextViolet) {
                            isViolet = Math.random() > transitionProgress;
                        } else if (!isCurrentViolet && isNextViolet) {
                            isViolet = Math.random() < transitionProgress;
                        } else if (isCurrentViolet && isNextViolet) {
                            isViolet = true;
                        }
                    } else {
                        isViolet = violetCircles.has(circleKey);
                    }

                    ctx.beginPath();
                    ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);

                    if (isViolet) {
                        ctx.fillStyle = \`rgba(124, 58, 237, \${waveOffset * (isMobile ? 0.3 : 0.25)})\`;
                    } else {
                        ctx.fillStyle = \`rgba(255, 255, 255, \${waveOffset * (isMobile ? 0.125 : 0.1)})\`;
                    }

                    ctx.fill();
                }
            }

            iterationCount++;
        }

        function animate() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawHalftoneWave();

            time += 0.03;
            animationFrameId = requestAnimationFrame(animate);
        }

        // Email form handling
        const emailInput = document.getElementById('emailInput');
        const submitBtn = document.getElementById('submitBtn');
        const errorMessage = document.getElementById('errorMessage');
        const mainText = document.getElementById('mainText');
        const emailForm = document.getElementById('emailForm');

        function validateEmail(email) {
            const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            return emailRegex.test(email);
        }

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
            emailInput.classList.add('border-red-400');
        }

        function hideError() {
            errorMessage.classList.add('hidden');
            emailInput.classList.remove('border-red-400');
        }

        async function handleSubmit() {
            const email = emailInput.value.trim();
            hideError();

            if (!email) {
                showError('Введите email адрес');
                return;
            }

            if (!validateEmail(email)) {
                showError('Введите корректный email адрес');
                return;
            }

            try {
                const response = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                if (response.ok) {
                    // Animate text change
                    let opacity = 1;
                    const fadeOut = setInterval(() => {
                        opacity -= 0.033;
                        mainText.style.opacity = opacity;
                        if (opacity <= 0) {
                            clearInterval(fadeOut);
                            mainText.querySelector('p').textContent = 'Вскоре вы получите приглашение: адрес принят';
                            
                            const fadeIn = setInterval(() => {
                                opacity += 0.033;
                                mainText.style.opacity = opacity;
                                if (opacity >= 1) {
                                    clearInterval(fadeIn);
                                    
                                    // Fade out form
                                    setTimeout(() => {
                                        let formOpacity = 1;
                                        const formFadeOut = setInterval(() => {
                                            formOpacity -= 0.017;
                                            emailForm.style.opacity = formOpacity;
                                            if (formOpacity <= 0) {
                                                clearInterval(formFadeOut);
                                                emailForm.style.display = 'none';
                                            }
                                        }, 50);
                                    }, 0);
                                }
                            }, 50);
                        }
                    }, 50);
                } else {
                    showError('Произошла ошибка. Попробуйте еще раз.');
                }
            } catch (error) {
                showError('Произошла ошибка. Попробуйте еще раз.');
            }
        }

        submitBtn.addEventListener('click', handleSubmit);
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        });

        emailInput.addEventListener('input', hideError);

        // Initialize
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animate();
    </script>
</body>
</html>`
}
