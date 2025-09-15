import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg 
        className={cn(sizeClasses[size])} 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* SignalSync Logo - Stylized S with smooth interlocking curves */}
        {/* Upper curve (purple) */}
        <path 
          d="M8 6C8 4.89543 8.89543 4 10 4H20C21.1046 4 22 4.89543 22 6C22 7.10457 21.1046 8 20 8H12C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12H18C19.1046 12 20 12.8954 20 14C20 15.1046 19.1046 16 18 16H10C8.89543 16 8 15.1046 8 14V6Z" 
          fill="#6E56CF"
        />
        
        {/* Lower curve (white) */}
        <path 
          d="M24 6C24 4.89543 23.1046 4 22 4H12C10.8954 4 10 4.89543 10 6C10 7.10457 10.8954 8 12 8H20C21.1046 8 22 8.89543 22 10C22 11.1046 21.1046 12 20 12H14C12.8954 12 12 12.8954 12 14C12 15.1046 12.8954 16 14 16H22C23.1046 16 24 15.1046 24 14V6Z" 
          fill="white"
        />
      </svg>
      
      {showText && (
        <span className={cn("font-bold", textSizeClasses[size])}>
          SignalSync
        </span>
      )}
    </div>
  )
}
