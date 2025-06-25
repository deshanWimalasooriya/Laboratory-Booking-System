import React from "react";
import "../styles/InputField.css"; // Assuming you have a CSS file for styling

function InputField({ label, type, value, onChange, placeholder, required }) {
  return (
    <div className="input-field">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

export default InputField;
