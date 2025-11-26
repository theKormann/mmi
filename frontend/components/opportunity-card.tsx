// Arquivo: @/components/opportunity-card.tsx

"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

// Tipagem atualizada para oportunidades imobiliárias
interface OpportunityCardProps {
  opportunity: {
    title: string
    details: string // Mais flexível que 'discount'
    image: string
    endDate: string
    gradient: string
  }
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        scale: 1.03,
        transition: { duration: 0.2 },
      }}
      className="h-full"
    >
      <Card
        className="bg-white/60 backdrop-blur-sm border-slate-200/80 overflow-hidden h-full shadow-sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-[16/9] relative overflow-hidden">
          <Image
            src={opportunity.image || "/placeholder.svg"}
            alt={opportunity.title}
            fill
            className={`object-cover transition-transform duration-700 ${isHovered ? "scale-110" : "scale-100"}`}
          />

          <div
            className={`absolute inset-0 bg-gradient-to-br ${opportunity.gradient} transition-opacity duration-300 ${isHovered ? "opacity-60" : "opacity-40"}`}
          ></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-center p-6"
              animate={{
                scale: isHovered ? 1.1 : 1,
                y: isHovered ? -10 : 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h3 className="font-bold text-2xl mb-3 text-white drop-shadow-md">{opportunity.title}</h3>

              <motion.div
                animate={{
                  rotate: isHovered ? [0, -3, 3, 0] : 0,
                  scale: isHovered ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
                  repeatDelay: 2,
                }}
              >
                <Badge className="bg-white/95 text-slate-800 font-bold text-lg px-4 py-2 shadow-lg">{opportunity.details}</Badge>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <CardContent className="p-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Válido até {opportunity.endDate}</span>

            <Button
              size="sm"
              className={`
                text-white transition-all duration-300
                ${
                  isHovered
                    ? "bg-gradient-to-r from-blue-500 to-sky-500 shadow-lg shadow-blue-500/30"
                    
                    : "bg-slate-800 hover:bg-slate-700" 
                }
              `}
            >
              Saber Mais
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}