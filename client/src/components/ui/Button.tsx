export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost"
export type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-dark-purple text-off-white hover:bg-deep-purple active:bg-dark-purple border border-dark-purple",
  secondary:
    "bg-rose text-deep-purple hover:bg-rose/80 active:bg-rose/60 border border-rose",
  outline:
    "bg-transparent text-dark-purple border border-dark-purple hover:bg-dark-purple/5 active:bg-dark-purple/10",
  ghost:
    "bg-transparent text-dark-purple hover:bg-dark-purple/5 active:bg-dark-purple/10 border border-transparent",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-5 py-2.5 text-base gap-2",
  lg: "px-7 py-3.5 text-lg gap-2.5",
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-150 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        cursor-pointer select-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
