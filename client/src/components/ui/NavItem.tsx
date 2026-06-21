interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  variant?: "dark" | "light"
  onClick?: () => void
  className?: string
}

const variantStyles = {
  dark: {
    active: "bg-off-white/10 text-off-white",
    inactive: "text-off-white/60 hover:text-off-white hover:bg-off-white/5",
  },
  light: {
    active: "bg-dark-purple/10 text-dark-purple",
    inactive: "text-dark-purple/60 hover:text-dark-purple hover:bg-dark-purple/5",
  },
}

export default function NavItem({
  icon,
  label,
  active = false,
  variant = "dark",
  onClick,
  className = "",
}: NavItemProps) {
  const styles = variantStyles[variant]
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
        transition-colors duration-150 cursor-pointer
        ${active ? styles.active : styles.inactive}
        ${className}
      `}
    >
      {icon}
      {label}
    </button>
  )
}
