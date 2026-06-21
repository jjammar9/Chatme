interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  disabled,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-deep-purple mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          disabled={disabled}
          className={`
            w-full rounded-lg border bg-off-white px-4 py-2.5 text-deep-purple
            placeholder:text-gray/60
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-dark-purple/20 focus:border-dark-purple
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-light-gray
            ${error ? "border-red-500 focus:ring-red-200 focus:border-red-500" : "border-gray/40"}
            ${leftIcon ? "pl-10" : ""}
            ${rightIcon ? "pr-10" : ""}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray">{helperText}</p>
      )}
    </div>
  )
}
