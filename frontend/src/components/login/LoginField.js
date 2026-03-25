"use client";

/**
 * Reusable labelled input for the login form.
 *
 * Props:
 *  - id        {string}
 *  - label     {string}
 *  - type      {string}  default "text"
 *  - value     {string}
 *  - onChange  {function}
 *  - placeholder {string}
 *  - disabled  {boolean}
 *  - autoComplete {string}
 *  - children  — optional icon slot rendered inside the input wrapper (right side)
 */
export default function LoginField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete,
  children,
}) {
  return (
    <div className="login-field">
      <label htmlFor={id} className="login-label">
        {label}
      </label>
      <div className="login-input-wrap">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          required
          className="login-input"
        />
        {children && <div className="login-input-icon">{children}</div>}
      </div>
    </div>
  );
}