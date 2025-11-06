"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import React from "react"

interface PropertyTypeCardProps {
  category: {
    name: string
    icon: React.ReactNode 
    color: string 
  }
}

export default function PropertyTypeCard({ category }: PropertyTypeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="h-full"
    >
      <Link href={`/properties/reall?type=${category.name}`} className="h-full">
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={`flex h-full flex-col items-center justify-center p-6 rounded-xl text-white bg-gradient-to-br ${category.color} transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer`}
        >
          {category.icon}
          <span className="mt-2 text-center font-semibold">{category.name}</span>
        </motion.div>
      </Link>
    </motion.div>
  )
}