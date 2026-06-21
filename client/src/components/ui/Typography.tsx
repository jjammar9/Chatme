type TypographyAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"
type TypographyVariant = "title" | "subtitle" | "body" | "caption" | "label"

interface TypographyProps {
  as?: TypographyAs
  variant?: TypographyVariant
  color?: string
  className?: string
  children: React.ReactNode
}

const variantMap: Record<TypographyVariant, TypographyAs> = {
  title: "h1",
  subtitle: "h2",
  body: "p",
  caption: "span",
  label: "span",
}

const variantStyles: Record<TypographyVariant, string> = {
  title: "text-3xl md:text-4xl font-bold tracking-tight",
  subtitle: "text-xl md:text-2xl font-semibold tracking-tight",
  body: "text-base leading-relaxed",
  caption: "text-sm leading-normal",
  label: "text-sm font-medium leading-none",
}

export default function Typography({
  as,
  variant = "body",
  color,
  className = "",
  children,
}: TypographyProps) {
  const Component = as || variantMap[variant]
  return (
    <Component
      className={`${variantStyles[variant]} ${color ? "" : "text-deep-purple"} ${className}`}
      style={color ? { color } : undefined}
    >
      {children}
    </Component>
  )
}
