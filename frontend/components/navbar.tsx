"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Menu, X } from "lucide-react"
import { useState } from "react"
import { getStoreName } from "@/lib/store-name"
import Link from "next/link"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const storeName = getStoreName()

  const scrollToCategories = () => {
    const categoriesSection = document.getElementById("categories-section")
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Alinhado à esquerda para manter a hierarquia visual */}
          <Link href="/" className="text-2xl font-bold text-neutral-950 hover:text-blue-600 transition-colors">
            {storeName}
          </Link>

          {/* Botão de Menu para Mobile */}
          <div className="flex items-center space-x-2 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-neutral-950 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Desktop Navigation - Centralizada */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            {/* Links de navegação */}
            <div className="hidden lg:flex items-center space-x-8 mr-8">
              <Link href="/" className="text-neutral-600 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>
              <Link href="/properties" className="text-neutral-600 hover:text-blue-600 font-medium transition-colors">
                Imóveis
              </Link>
              <button
                onClick={scrollToCategories}
                className="text-neutral-600 hover:text-blue-600 font-medium transition-colors"
              >
                Categorias
              </button>
              <Link href="/about" className="text-neutral-600 hover:text-blue-600 font-medium transition-colors">
                Sobre Nós
              </Link>
              <Link href="/contact" className="text-neutral-600 hover:text-blue-600 font-medium transition-colors">
                Contato
              </Link>
            </div>

            {/* Search Bar - Centralizada */}
            <div className="hidden lg:flex items-center max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar imóveis..."
                  className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-100 border-transparent focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100 py-4" : "max-h-0 opacity-0"
            }`}
        >
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar imóveis..."
                className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-100 border-transparent focus:border-blue-600 focus:bg-white"
              />
            </div>
            <Link href="/" className="text-neutral-600 hover:text-blue-600 font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link href="/properties" className="text-neutral-600 hover:text-blue-600 font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Imóveis
            </Link>
            <button
              onClick={scrollToCategories}
              className="text-neutral-600 hover:text-blue-600 font-medium py-2 text-left transition-colors"
            >
              Categorias
            </button>
            <Link href="/about" className="text-neutral-600 hover:text-blue-600 font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Sobre Nós
            </Link>
            <Link href="/contact" className="text-neutral-600 hover:text-blue-600 font-medium py-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Contato
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}