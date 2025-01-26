import Image from "next/image"

interface FileIconProps {
  type: string
  className?: string
}

export function FileIcon({ type, className }: FileIconProps) {
  const iconPath = `/icons/${type.toLowerCase()}.svg`
  return (
    <div className={`relative file-icon ${className || ""}`}>
      <Image src={iconPath || "/placeholder.svg"} alt={`${type} file`} fill className="object-contain" />
    </div>
  )
}

