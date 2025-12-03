"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Menu, X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about-section")
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-[#FFFFFF] border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20"> 
          <Link href="/" className="flex items-center">
    <Image
      src="/mmi-logo.png"
      alt="MMI Logo"
      width={240}  
      height={78}
      className="
        h-16
        md:h-30
        w-auto     
        transition-all 
        duration-300
      "
      style={{ height: 'auto', width: '150px' }}
    />
          </Link>

          <div className="flex items-center space-x-2 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#000000] hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          <div className="hidden md:flex flex-1 justify-center items-center">
            <div className="hidden lg:flex items-center space-x-8 mr-8">
              <Link href="/" className="text-[#4D4D4D] hover:text-[#1F4F91] font-medium transition-colors">
                Home
              </Link>
              <Link href="/properties" className="text-[#4D4D4D] hover:text-[#1F4F91] font-medium transition-colors">
                Imóveis
              </Link>
              <button
                onClick={scrollToAbout}
                className="text-[#4D4D4D] hover:text-[#1F4F91] font-medium transition-colors"
              >
                Quem Somos
              </button>
              <Link
                href="https://wa.me/5511982724430?text=ol%C3%A1%20gostaria%20de%20conhecer%20algum%20im%C3%B3vel%20ideal%20para%20mim"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4D4D4D] hover:text-[#1F4F91] font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
            </div>

            <div className="hidden lg:flex items-center max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4D4D4D]/80" />
                <Input
                  type="search"
                  placeholder="Buscar imóveis..."
                  className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-[#0C2D5A] transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100 py-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4D4D4D]/80" />
              <Input
                type="search"
                placeholder="Buscar imóveis..."
                className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-[#0C2D5A] transition-all"
              />
            </div>
            <Link href="/" className="text-[#4D4D4D] hover:text-[#1F4F91] font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link href="/properties" className="text-[#4D4D4D] hover:text-[#1F4F91] font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Imóveis
            </Link>
            <button
              onClick={scrollToAbout}
              className="text-[#4D4D4D] hover:text-[#1F4F91] font-medium py-2 text-left transition-colors"
            >
              Quem Somos
            </button>
            <Link
              href="https://wa.me/5511982724430?text=ol%C3%A1%20gostaria%20de%20conhecer%20algum%20im%C3%B3vel%20ideal%20para%20mim"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4D4D4D] hover:text-[#1F4F91] font-medium py-2 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}