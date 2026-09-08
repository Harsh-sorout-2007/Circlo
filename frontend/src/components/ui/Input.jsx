import './Input.css';
export const Input = ({ className = '', error, ...props }) => {
  return (
    <div className="input-wrapper">
      <input className={`input ${error ? 'input-error' : ''} ${className}`} {...props} />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};