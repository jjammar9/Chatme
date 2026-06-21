type BadgeVariant = "default" | "success" | "warning" | "error" | "info"
type BadgeSize = "sm" | "md"

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  className?: string
  children: React.ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray/20 text-deep-purple",
  success: "bg-light-green text-green",
  warning: "bg-rose text-dark-purple",
  error: "bg-rose text-dark-purple",
  info: "bg-dark-purple/10 text-dark-purple",
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
}

export default function Badge({
  variant = "default",
  size = "sm",
  dot = false,
  className = "",
  children,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  )
}
