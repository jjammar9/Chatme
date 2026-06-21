interface CardProps {
  padding?: "none" | "sm" | "md" | "lg"
  hover?: boolean
  onClick?: () => void
  className?: string
  children: React.ReactNode
}

const paddingStyles = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
}

export default function Card({
  padding = "md",
  hover = false,
  onClick,
  className = "",
  children,
}: CardProps) {
  const Component = onClick ? "button" : "div"
  return (
    <Component
      className={`
        bg-light-gray rounded-xl border border-gray/20
        ${paddingStyles[padding]}
        ${hover || onClick ? "hover:bg-gray/10 active:bg-gray/20 transition-colors duration-150" : ""}
        ${onClick ? "cursor-pointer text-left w-full" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </Component>
  )
}
