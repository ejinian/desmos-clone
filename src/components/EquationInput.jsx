function EquationInput({ value, onChange }) {
  return (
    <div className="equation-input-container">
      <label htmlFor="equation">y = </label>
      <input
        id="equation"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter equation"
        className="equation-input"
      />
    </div>
  )
}

export default EquationInput