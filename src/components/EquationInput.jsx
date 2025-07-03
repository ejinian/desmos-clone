function EquationInput({ value, onChange }) {
    return (
      <div>
        <label htmlFor="equation">y = </label>
        <input
          id="equation"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter equation (e.g., x^2, sin(x), x + 2)"
          style={{
            width: '200px',
            padding: '8px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>
    )
  }
  
  export default EquationInput