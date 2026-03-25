"use client";

/**
 * Props:
 *  - loading  {boolean}
 *  - disabled {boolean}
 *  - children {ReactNode}
 */
export default function LoginButton({ loading, disabled, children }) {
  return (
    <button
      type="submit"
      className="login-btn"
      disabled={loading || disabled}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <span className="login-btn-spinner" aria-hidden="true" />
          Ingresando...
        </>
      ) : (
        children
      )}
    </button>
  );
}