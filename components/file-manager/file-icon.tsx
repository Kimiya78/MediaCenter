// import Image from "next/image"

// interface FileIconProps {
//   type: string
//   className?: string
// }

// export function FileIcon({ type, className }: FileIconProps) {
//   const supportedTypes = ["pptx", "pdf", "docx", "xlsx", "png", "jpg", "jpeg", "txt", "mp4", "mov", "avi" , "json"]
//   const fileType = supportedTypes.includes(type.toLowerCase()) ? type.toLowerCase() : "unknown"
//   const iconPath = `/icons/${fileType}.svg`

//   return (
//     <div className={`relative file-icon ${className || ""}`}>
//       <Image 
//         src={iconPath} 
//         alt={`${type} file`} 
//         width={24}
//         height={24}
//         className="object-contain" 
//         onError={(e) => {
//           // If the icon fails to load, fall back to unknown icon
//           const imgElement = e.target as HTMLImageElement;
//           imgElement.src = "/icons/unknown.svg";
//         }}
//       />
//     </div>
//   )
// }

import Image from "next/image"

interface FileIconProps {
  type: string
  className?: string
}

export function FileIcon({ type, className }: FileIconProps) {
  //const iconPath = `/icons/${type.toLowerCase()}.svg`
  const supportedTypes = ["pptx", "pdf", "docx", "xlsx", "png", "jpg", "jpeg", "txt", "mp4", "mov", "avi"]
  const fileType = supportedTypes.includes(type.toLowerCase()) ? type.toLowerCase() : "unknown"
  //debugger
  const iconPath = `/icons/${fileType}.svg`


  return (
    <div className={`relative file-icon ${className || ""}`}>
      <Image src={iconPath || "/placeholder.svg"} alt={`${type} file`} fill className="object-contain" />
    </div>
  )
}

