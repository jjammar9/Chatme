interface SeparatorProps {
  className?: string
}

export default function Separator({ className = "" }: SeparatorProps) {
  return (
    <hr className={`border-t border-gray/30 w-full ${className}`} />
  )
}
