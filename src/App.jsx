import { useState, useRef, useEffect } from 'react'
import EquationInput from './components/EquationInput'
import GraphCanvas from './components/GraphCanvas'

function App() {
  const [equation, setEquation] = useState('x^2')

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* left side */}
      <div style={{ width: '300px', padding: '20px', borderRight: '1px solid #ccc' }}>
        <h2>Equations</h2>
        <EquationInput 
          value={equation}
          onChange={setEquation}
        />
      </div>
      
      {/* right side */}
      <div style={{ flex: 1, padding: '20px' }}>
        <GraphCanvas equation={equation} />
      </div>
    </div>
  )
}

export default App