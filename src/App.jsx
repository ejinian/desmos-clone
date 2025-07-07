import { useState } from 'react'
import EquationInput from './components/EquationInput'
import GraphCanvas from './components/GraphCanvas'
import './App.css'

function App() {
  const [equation, setEquation] = useState('x^2')

  return (
    <div className="app">
      {/* left side */}
      <div className="sidebar">
        <h2>Equations</h2>
        <EquationInput 
          value={equation}
          onChange={setEquation}
        />
      </div>
      
      {/* right side */}
      <div className="graph-area">
        <GraphCanvas equation={equation} />
      </div>
    </div>
  )
}

export default App