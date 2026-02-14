interface IndexBadgeProps {
  index: number
  type?: 'annotation' | 'detected'
  size?: 'sm' | 'md'
}

export function IndexBadge({ index, type = 'annotation', size = 'md' }: IndexBadgeProps) {
  const bgColor = type === 'annotation' ? 'bg-orange-500' : 'bg-blue-500'
  const sizeClasses = size === 'sm' ? 'min-w-5 h-5 text-xs' : 'min-w-6 h-6 text-sm'

  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClasses} rounded-full ${bgColor} text-white font-bold px-1.5 leading-none`}
    >
      {index}
    </span>
  )
}
