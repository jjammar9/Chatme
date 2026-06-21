type AvatarSize = "sm" | "md" | "lg" | "xl"

interface AvatarProps {
  src?: string
  alt?: string
  size?: AvatarSize
  status?: "online" | "offline" | "away"
  className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
}

const statusDotStyles: Record<string, string> = {
  online: "bg-green",
  offline: "bg-gray",
  away: "bg-rose",
}

export default function Avatar({
  src,
  alt = "",
  size = "md",
  status,
  className = "",
}: AvatarProps) {
  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeStyles[size]} rounded-full object-cover bg-light-gray`}
        />
      ) : (
        <div
          className={`${sizeStyles[size]} rounded-full bg-rose text-deep-purple font-semibold flex items-center justify-center`}
        >
          {alt.charAt(0).toUpperCase() || "?"}
        </div>
      )}
      {status && (
        <span
          className={`
            absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-off-white
            ${statusDotStyles[status]}
          `}
        />
      )}
    </div>
  )
}
