import { useRef, useEffect } from 'react'

function GraphCanvas({ equation }) {
  const canvasRef = useRef(null)

  const CANVAS_WIDTH = 600
  const CANVAS_HEIGHT = 400
  const SCALE = 40
  const ORIGIN_X = CANVAS_WIDTH / 2
  const ORIGIN_Y = CANVAS_HEIGHT / 2

  const evaluateEquation = (equation, x) => {
    try {
      let expr = equation
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt') 
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/x/g, `(${x})`)

      const func = new Function('return ' + expr)
      const result = func()
      
      return isFinite(result) ? result : null
    } catch (error) {
      return null
    }
  }

  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    
    for (let x = 0; x < CANVAS_WIDTH; x += SCALE) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, CANVAS_HEIGHT)
      ctx.stroke()
    }
    
    for (let y = 0; y < CANVAS_HEIGHT; y += SCALE) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(CANVAS_WIDTH, y)
      ctx.stroke()
    }
    
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    
    ctx.beginPath()
    ctx.moveTo(0, ORIGIN_Y)
    ctx.lineTo(CANVAS_WIDTH, ORIGIN_Y)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(ORIGIN_X, 0)
    ctx.lineTo(ORIGIN_X, CANVAS_HEIGHT)
    ctx.stroke()
    
    ctx.fillStyle = '#666'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    
    for (let i = -Math.floor(ORIGIN_X / SCALE); i <= Math.floor((CANVAS_WIDTH - ORIGIN_X) / SCALE); i++) {
      if (i !== 0) {
        const x = ORIGIN_X + i * SCALE
        ctx.fillText(i.toString(), x, ORIGIN_Y + 15)
      }
    }
    
    ctx.textAlign = 'right'
    for (let i = -Math.floor(ORIGIN_Y / SCALE); i <= Math.floor((CANVAS_HEIGHT - ORIGIN_Y) / SCALE); i++) {
      if (i !== 0) {
        const y = ORIGIN_Y - i * SCALE
        ctx.fillText(i.toString(), ORIGIN_X - 10, y + 4)
      }
    }
    
    if (equation) {
      ctx.strokeStyle = '#0066cc'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      let firstPoint = true
      const step = 0.1
      
      for (let pixelX = 0; pixelX <= CANVAS_WIDTH; pixelX += 2) {
        const x = (pixelX - ORIGIN_X) / SCALE
        const y = evaluateEquation(equation, x)
        
        if (y !== null) {
          const pixelY = ORIGIN_Y - y * SCALE
          
          if (pixelY >= 0 && pixelY <= CANVAS_HEIGHT) {
            if (firstPoint) {
              ctx.moveTo(pixelX, pixelY)
              firstPoint = false
            } else {
              ctx.lineTo(pixelX, pixelY)
            }
          } else {
            firstPoint = true
          }
        } else {
          firstPoint = true
        }
      }
      
      ctx.stroke()
    }
  }

  useEffect(() => {
    drawGraph()
  }, [equation])

  return (
    <div>
      <h2>Graph</h2>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />
    </div>
  )
}

export default GraphCanvas