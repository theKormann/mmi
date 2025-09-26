'use client';
import React from 'react';
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionDescription } from "@/components/ui/SectionDescription";
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Phone } from 'lucide-react';
import Link from 'next/link';

export default function Location() {
    return (
        <section
            id='location'
            className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24 bg-white"
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left">
                    <SectionTitle className="mb-6">
                        <span className="text-slate-900">Estamos </span>
                        <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                            Perto de Você
                        </span>
                    </SectionTitle>
                    <SectionDescription className="mb-8 text-center lg:text-left mx-0 max-w-none">
                        Nossa sede está localizada em uma região de fácil acesso para melhor atender você. Venha tomar um café e conhecer as melhores oportunidades com a <span className="text-slate-800 font-semibold">MMI Imobiliária</span>!
                    </SectionDescription>
                    <div className="space-y-6 text-left">
                        <div className="flex items-start gap-4">
                            <MapPin className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-slate-800">Endereço</h3>
                                <p className="text-slate-600">Estrada Dom João Nery, 223 - Itaim Paulista, São Paulo - SP, 08110-000</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Clock className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-slate-800">Horário de Funcionamento</h3>
                                <p className="text-slate-600">Segunda a Sexta: 9:00 - 18:00</p>
                                <p className="text-slate-600">Sábado: 9:00 - 13:00</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Phone className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-slate-800">Telefone</h3>
                                <p className="text-slate-600">(11) 98272-4430</p>
                            </div>
                        </div>
                    </div>
                    <Button asChild size="lg" className="mt-8 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                        <a href="https://maps.app.goo.gl/YxRMn2gxrmYmF6KY7" target="_blank" rel="noopener noreferrer">
                            Ver no Google Maps
                        </a>
                    </Button>
                </div>

                {/* Coluna do Mapa */}
                <div className="w-full h-[400px] md:h-[550px] rounded-2xl overflow-hidden shadow-xl border border-slate-200 transition-transform duration-300 hover:scale-105">
                    <iframe
                        title="Mapa MMI Imobiliária - Itaim Paulista"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3658.9837581756237!2d-46.40524789999999!3d-23.497094500000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce639cacfa0281%3A0x8bda8646ab46202e!2sMoraes%20Mendes%20Imoveis!5e0!3m2!1spt-BR!2sbr!4v1758479785069!5m2!1spt-BR!2sbr"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                </div>
            </div>
        </section>
    );
}