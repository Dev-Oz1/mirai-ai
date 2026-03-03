import React from 'react'
import { Link } from 'react-router-dom'
interface LogoProps {
  className?: string
  collapsed?: boolean
}
export function Logo({ className = '', collapsed = false }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`}>
      <div className="relative flex-shrink-0">
        <img
          src="../../logo.png"
          alt="Mirai AI Logo"
          className="h-14 w-30 object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight text-tech-text leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-tech-cyan group-hover:to-tech-blue transition-all">

          </span>
        </div>
      )}
    </Link>
  )
}
