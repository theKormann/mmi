"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, User, Menu } from "lucide-react"
import { useState } from "react"
import { getStoreName } from "@/lib/store-name"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const storeName = getStoreName() // "MMI Imobiliária"

  const scrollToCategories = () => {
    const categoriesSection = document.getElementById("categories-section")
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-blue-50 border-b border-blue-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-blue-900 hover:text-blue-700 transition-colors">
              {storeName}
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">
              Home
            </a>
            <a href="/properties" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">
              Imóveis
            </a>
            <button
              onClick={scrollToCategories}
              className="text-blue-900 hover:text-blue-700 font-medium transition-colors"
            >
              Categorias
            </button>
            <a href="/about" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">
              Sobre Nós
            </a>
            <a href="/contact" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">
              Contato
            </a>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
              <Input
                type="search"
                placeholder="Buscar imóveis..."
                className="pl-10 pr-4 py-2 w-full border-blue-300 focus:border-blue-600"
              />
            </div>
          </div>

          {/* User / Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <User className="w-5 h-5 text-blue-900" />
            </Button>

            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-5 h-5 text-blue-900" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-blue-200 py-4 bg-blue-50">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <Input type="search" placeholder="Buscar imóveis..." className="pl-10 pr-4 py-2 w-full" />
              </div>
              <a href="/" className="text-blue-900 hover:text-blue-700 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                Home
              </a>
              <a href="/properties" className="text-blue-900 hover:text-blue-700 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                Imóveis
              </a>
              <button
                onClick={scrollToCategories}
                className="text-blue-900 hover:text-blue-700 font-medium py-2 text-left"
              >
                Categorias
              </button>
              <a href="/about" className="text-blue-900 hover:text-blue-700 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                Sobre Nós
              </a>
              <a href="/contact" className="text-blue-900 hover:text-blue-700 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                Contato
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
