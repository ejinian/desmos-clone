import { useRef, useEffect, useState } from 'react'

function evaluateEquation(equation, x) {
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
      .replace(/(\d)x/g, '$1*x')
      .replace(/x(\d)/g, 'x*$1')
      .replace(/\)x/g, ')*x')
      .replace(/x\(/g, 'x*(')
      .replace(/x/g, `(${x})`)

    const func = new Function('return ' + expr)
    const result = func()

    return isFinite(result) ? result : null
  } catch (error) {
    return null
  }
}

function GraphCanvas({ equation }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [scale, setScale] = useState(40)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  const MIN_SCALE = 5
  const MAX_SCALE = 200

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const container = containerRef.current
        const rect = container.getBoundingClientRect()
        setCanvasSize({
          width: rect.width - 40,
          height: rect.height - 40
        })
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  const handleWheel = (event) => {
    event.preventDefault()
    
    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    
    const zoomFactor = event.deltaY > 0 ? 0.95 : 1.05
    
    setScale(prevScale => {
      const newScale = prevScale * zoomFactor
      const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale))
      
      const actualZoomFactor = clampedScale / prevScale
      
      const originX = canvasSize.width / 2 + offsetX
      const originY = canvasSize.height / 2 + offsetY
      
      const mouseGraphX = (mouseX - originX) / prevScale
      const mouseGraphY = (originY - mouseY) / prevScale
      
      const newMousePixelX = mouseGraphX * clampedScale
      const newMousePixelY = mouseGraphY * clampedScale
      
      const newOriginX = mouseX - newMousePixelX
      const newOriginY = mouseY + newMousePixelY
      
      setOffsetX(newOriginX - canvasSize.width / 2)
      setOffsetY(newOriginY - canvasSize.height / 2)
      
      return clampedScale
    })
  }

  const handleMouseDown = (event) => {
    setIsDragging(true)
    const rect = canvasRef.current.getBoundingClientRect()
    setLastMousePos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    })
  }

  const handleMouseMove = (event) => {
    if (!isDragging) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const currentMousePos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    
    const deltaX = currentMousePos.x - lastMousePos.x
    const deltaY = currentMousePos.y - lastMousePos.y
    
    setOffsetX(prev => prev + deltaX)
    setOffsetY(prev => prev + deltaY)
    setLastMousePos(currentMousePos)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const zoomIn = () => {
    const centerX = canvasSize.width / 2
    const centerY = canvasSize.height / 2
    
    setScale(prevScale => {
      const newScale = Math.min(MAX_SCALE, prevScale * 1.2)
      const actualZoomFactor = newScale / prevScale
      
      const originX = canvasSize.width / 2 + offsetX
      const originY = canvasSize.height / 2 + offsetY
      
      const centerGraphX = (centerX - originX) / prevScale
      const centerGraphY = (originY - centerY) / prevScale
      
      const newCenterPixelX = centerGraphX * newScale
      const newCenterPixelY = centerGraphY * newScale
      
      const newOriginX = centerX - newCenterPixelX
      const newOriginY = centerY + newCenterPixelY
      
      setOffsetX(newOriginX - canvasSize.width / 2)
      setOffsetY(newOriginY - canvasSize.height / 2)
      
      return newScale
    })
  }

  const zoomOut = () => {
    const centerX = canvasSize.width / 2
    const centerY = canvasSize.height / 2
    
    setScale(prevScale => {
      const newScale = Math.max(MIN_SCALE, prevScale / 1.2)
      const actualZoomFactor = newScale / prevScale
      
      const originX = canvasSize.width / 2 + offsetX
      const originY = canvasSize.height / 2 + offsetY
      
      const centerGraphX = (centerX - originX) / prevScale
      const centerGraphY = (originY - centerY) / prevScale
      
      const newCenterPixelX = centerGraphX * newScale
      const newCenterPixelY = centerGraphY * newScale
      
      const newOriginX = centerX - newCenterPixelX
      const newOriginY = centerY + newCenterPixelY
      
      setOffsetX(newOriginX - canvasSize.width / 2)
      setOffsetY(newOriginY - canvasSize.height / 2)
      
      return newScale
    })
  }

  const resetView = () => {
    setScale(40)
    setOffsetX(0)
    setOffsetY(0)
  }

  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)

    const originX = canvasSize.width / 2 + offsetX
    const originY = canvasSize.height / 2 + offsetY

    const gridSpacing = scale < 20 ? scale * 2 : scale

    ctx.strokeStyle = scale < 15 ? '#f0efef' : '#e0e0e0'
    ctx.lineWidth = scale < 10 ? 0.5 : 1

    const firstVerticalLine = Math.floor(-originX / gridSpacing) * gridSpacing + originX
    for (let x = firstVerticalLine; x <= canvasSize.width + gridSpacing; x += gridSpacing) {
      if (x >= -gridSpacing && x <= canvasSize.width + gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvasSize.height)
        ctx.stroke()
      }
    }

    const firstHorizontalLine = Math.floor(-originY / gridSpacing) * gridSpacing + originY
    for (let y = firstHorizontalLine; y <= canvasSize.height + gridSpacing; y += gridSpacing) {
      if (y >= -gridSpacing && y <= canvasSize.height + gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvasSize.width, y)
        ctx.stroke()
      }
    }

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2

    if (originY >= 0 && originY <= canvasSize.height) {
      ctx.beginPath()
      ctx.moveTo(0, originY)
      ctx.lineTo(canvasSize.width, originY)
      ctx.stroke()
    }

    if (originX >= 0 && originX <= canvasSize.width) {
      ctx.beginPath()
      ctx.moveTo(originX, 0)
      ctx.lineTo(originX, canvasSize.height)
      ctx.stroke()
    }

    if (scale > 10) {
      ctx.fillStyle = '#666'
      ctx.font = `${Math.min(12, scale / 3)}px Arial`
      ctx.textAlign = 'center'

      const labelSpacing = gridSpacing
      const firstXLabel = Math.floor(-originX / labelSpacing)
      const lastXLabel = Math.ceil((canvasSize.width - originX) / labelSpacing)
      
      for (let i = firstXLabel; i <= lastXLabel; i++) {
        if (i !== 0) {
          const x = originX + i * labelSpacing
          if (x >= -20 && x <= canvasSize.width + 20 && originY >= 0 && originY <= canvasSize.height) {
            const value = (i * gridSpacing / scale).toFixed(gridSpacing / scale < 1 ? 1 : 0)
            ctx.fillText(value, x, originY + 15)
          }
        }
      }

      ctx.textAlign = 'right'
      const firstYLabel = Math.floor(-originY / labelSpacing)
      const lastYLabel = Math.ceil((canvasSize.height - originY) / labelSpacing)
      
      for (let i = -lastYLabel; i <= -firstYLabel; i++) {
        if (i !== 0) {
          const y = originY - i * labelSpacing
          if (y >= -20 && y <= canvasSize.height + 20 && originX >= 0 && originX <= canvasSize.width) {
            const value = (i * gridSpacing / scale).toFixed(gridSpacing / scale < 1 ? 1 : 0)
            ctx.fillText(value, originX - 10, y + 4)
          }
        }
      }
    }

    if (equation) {
      ctx.strokeStyle = '#0066cc'
      ctx.lineWidth = Math.max(1, Math.min(3, scale / 20))
      ctx.beginPath()

      let firstPoint = true
      const step = Math.max(1, Math.floor(40 / scale))
      
      for (let pixelX = 0; pixelX <= canvasSize.width; pixelX += step) {
        const x = (pixelX - originX) / scale
        const y = evaluateEquation(equation, x)

        if (y !== null && isFinite(y)) {
          const pixelY = originY - y * scale
          
          if (firstPoint) {
            ctx.moveTo(pixelX, pixelY)
            firstPoint = false
          } else {
            ctx.lineTo(pixelX, pixelY)
          }
        } else {
          if (!firstPoint) {
            ctx.stroke()
            ctx.beginPath()
          }
          firstPoint = true
        }
      }

      if (!firstPoint) {
        ctx.stroke()
      }
    }
  }

  useEffect(() => {
    drawGraph()
  }, [equation, scale, offsetX, offsetY, canvasSize])

  useEffect(() => {
    const handleGlobalMouseMove = (event) => handleMouseMove(event)
    const handleGlobalMouseUp = () => handleMouseUp()

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, lastMousePos])

  return (
    <div className="graph-container" ref={containerRef}>
      <div className="graph-header">
        <div className="graph-controls">
          <span className="zoom-indicator">
            Zoom: {Math.round(scale / 40 * 100)}%
          </span>
          <button onClick={zoomOut} className="control-button">Zoom Out</button>
          <button onClick={resetView} className="control-button">Reset View</button>
          <button onClick={zoomIn} className="control-button">Zoom In</button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        className={`graph-canvas ${isDragging ? 'dragging' : ''}`}
      />
      <div className="graph-instructions">
        Use mouse wheel to zoom • Click and drag to pan • Reset View to return to origin
      </div>
    </div>
  )
}

export default GraphCanvas