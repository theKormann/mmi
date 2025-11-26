interface SectionDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export function SectionDescription({ children, className = "" }: SectionDescriptionProps) {
    return (
        <p
            className={`
        mx-auto max-w-3xl text-center text-base leading-relaxed text-slate-600 
        md:text-lg 
        ${className}
      `}
        >
            {children}
        </p>
    );
}
