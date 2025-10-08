import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PopularSearchesProps = {
  onSearchClick: (term: string) => void;
};

export function PopularSearches({ onSearchClick }: PopularSearchesProps) {
  const popularTags = ["Piscina", "Churrasqueira", "Condomínio Fechado", "Perto do Metrô", "Varanda Gourmet"];

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/80 mb-8">
      <h3 className="font-medium text-[#0C2D5A] mb-3 flex items-center">
        <Search className="mr-2 h-4 w-4" />
        BUSCAS POPULARES
      </h3>
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag, index) => (
          <Badge
            key={index}
            className="bg-gray-200 text-[#4D4D4D] hover:bg-[#0C2D5A] hover:text-white transition-colors duration-300 cursor-pointer"
            onClick={() => onSearchClick(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}