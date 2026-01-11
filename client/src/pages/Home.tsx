import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { 
  Bus, 
  Shield, 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2,
  Star,
  ArrowRight,
  Award,
  Briefcase,
  Sparkles,
  Target,
  Zap,
  ThumbsUp,
  Quote,
  Menu,
  X,
  Search
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import CountUp from "react-countup";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 }
};

function AnimatedNumber({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-primary mb-2" style={{fontFamily: 'Poppins'}}>
      {isInView ? <CountUp end={end} duration={2.5} suffix={suffix} /> : "0"}
    </div>
  );
}

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Estado do formulário de busca
  const [searchForm, setSearchForm] = useState({
    origem: "Curitiba - PR",
    destino: "Beto Carrero - SC",
    dataIda: "",
    passageiros: "1-10 passageiros (Van)"
  });
  
  const [routeSimulation, setRouteSimulation] = useState<{
    distance: number;
    duration: string;
    vehicleType: string;
    estimatedCost: string;
  } | null>(null);

  // Banco de dados de distâncias entre cidades (km)
  const distances: Record<string, Record<string, number>> = {
    "Curitiba - PR": {
      "Beto Carrero - SC": 120,
      "Florianópolis - SC": 300,
      "Foz do Iguaçu - PR": 640,
      "Camboriú - SC": 100,
      "São Paulo - SP": 400,
      "Rio de Janeiro - RJ": 850,
      "Gramado - RS": 380,
      "Aparecida - SP": 380,
    },
    "Araucária - PR": {
      "Beto Carrero - SC": 130,
      "Florianópolis - SC": 310,
      "Foz do Iguaçu - PR": 650,
      "Camboriú - SC": 110,
      "São Paulo - SP": 410,
      "Rio de Janeiro - RJ": 860,
      "Gramado - RS": 390,
      "Aparecida - SP": 390,
    },
    "São José dos Pinhais - PR": {
      "Beto Carrero - SC": 115,
      "Florianópolis - SC": 295,
      "Foz do Iguaçu - PR": 635,
      "Camboriú - SC": 95,
      "São Paulo - SP": 395,
      "Rio de Janeiro - RJ": 845,
      "Gramado - RS": 375,
      "Aparecida - SP": 375,
    },
    "Maringá - PR": {
      "Beto Carrero - SC": 450,
      "Florianópolis - SC": 730,
      "Foz do Iguaçu - PR": 550,
      "Camboriú - SC": 430,
      "São Paulo - SP": 600,
      "Rio de Janeiro - RJ": 1200,
      "Gramado - RS": 710,
      "Aparecida - SP": 680,
    },
  };

  const calculateRoute = () => {
    const distance = distances[searchForm.origem]?.[searchForm.destino] || 0;
    
    if (distance === 0) {
      setRouteSimulation(null);
      return;
    }

    // Calcular tempo (média 70 km/h)
    const hours = Math.floor(distance / 70);
    const minutes = Math.round((distance % 70) / 70 * 60);
    const duration = `${hours}h${minutes > 0 ? minutes + 'min' : ''}`;

    // Determinar tipo de veículo
    const passengers = parseInt(searchForm.passageiros.split('-')[0]);
    let vehicleType = "Van";
    if (passengers > 20) vehicleType = "Ônibus";
    else if (passengers > 10) vehicleType = "Micro-ônibus";

    // Estimar custo (R$ 4-6 por km dependendo do veículo)
    const costPerKm = vehicleType === "Ônibus" ? 6 : vehicleType === "Micro-ônibus" ? 5 : 4;
    const totalCost = distance * costPerKm;
    const estimatedCost = `R$ ${(totalCost * 0.8).toLocaleString('pt-BR', {minimumFractionDigits: 2})} - R$ ${(totalCost * 1.2).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;

    setRouteSimulation({
      distance,
      duration,
      vehicleType,
      estimatedCost
    });
  };

  const handleSearchSubmit = () => {
    calculateRoute();
    
    const routeInfo = routeSimulation ? `
📏 Distância: ${routeSimulation.distance} km
⏱️ Tempo estimado: ${routeSimulation.duration}
🚐 Veículo sugerido: ${routeSimulation.vehicleType}
💰 Custo estimado: ${routeSimulation.estimatedCost}
` : '';
    
    const message = `Olá! Gostaria de solicitar um orçamento:

📍 Origem: ${searchForm.origem}
🎯 Destino: ${searchForm.destino}
📅 Data: ${searchForm.dataIda || "A definir"}
👥 Passageiros: ${searchForm.passageiros}${routeInfo}
Aguardo retorno!`;
    
    const whatsappUrl = `https://wa.me/5541991021445?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };
  
  // Recalcular rota quando origem ou destino mudar
  useEffect(() => {
    if (searchForm.origem && searchForm.destino) {
      calculateRoute();
    }
  }, [searchForm.origem, searchForm.destino, searchForm.passageiros]);
  
  const heroImages = [
    "/images/beto-carrero.jpg",
    "/images/foz-iguacu.jpg",
    "/images/florianopolis.jpg",
    "/images/martins-fleet-real.webp",
    "/images/martins-van-white-real.webp",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-background">
      {/* News Ticker - Notícias de Viagens e Turismo */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white py-1.5 overflow-hidden">
        <div className="flex animate-scroll">
          <div className="flex gap-8 md:gap-12 whitespace-nowrap">
            {[
              { icon: "🏝️", text: "Conheça as praias paradisíacas de Fernando de Noronha" },
              { icon: "⛰️", text: "Aventura na Chapada Diamantina: trilhas e cachoeiras incríveis" },
              { icon: "🏛️", text: "Ouro Preto: história e cultura em Minas Gerais" },
              { icon: "🌴", text: "Bonito/MS: ecoturismo e mergulho em águas cristalinas" },
              { icon: "🏖️", text: "Lençóis Maranhenses: dunas e lagoas de tirar o fôlego" },
            ].map((news, index) => (
              <div key={index} className="flex items-center gap-2 text-sm md:text-base font-medium">
                <span className="text-lg">{news.icon}</span>
                <span>{news.text}</span>
              </div>
            ))}
          </div>
          {/* Duplicar para efeito de loop infinito */}
          <div className="flex gap-8 md:gap-12 whitespace-nowrap">
            {[
              { icon: "🏝️", text: "Conheça as praias paradisíacas de Fernando de Noronha" },
              { icon: "⛰️", text: "Aventura na Chapada Diamantina: trilhas e cachoeiras incríveis" },
              { icon: "🏛️", text: "Ouro Preto: história e cultura em Minas Gerais" },
              { icon: "🌴", text: "Bonito/MS: ecoturismo e mergulho em águas cristalinas" },
              { icon: "🏖️", text: "Lençóis Maranhenses: dunas e lagoas de tirar o fôlego" },
            ].map((news, index) => (
              <div key={`dup-${index}`} className="flex items-center gap-2 text-sm md:text-base font-medium">
                <span className="text-lg">{news.icon}</span>
                <span>{news.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header - Mobile Optimized */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-8 md:top-10 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-border/20 shadow-lg"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <img src="/images/logo-martins-transparent.png" alt="Martins Viagens e Turismo" className="h-10 md:h-14 w-auto" />
            
            {/* Desktop Menu */}
            <nav className="hidden lg:flex items-center gap-8">
              {[
                { label: "Início", href: "#hero" },
                { label: "Serviços", href: "#servicos" },
                { label: "Frota", href: "#frota" },
                { label: "Depoimentos", href: "#depoimentos" },
                { label: "Contato", href: "#contato" },
                { label: "Blog", href: "/blog", external: true }
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={(e) => {
                    if (!(item as any).external) {
                      e.preventDefault();
                      document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {item.label}
                </a>
              ))}
              <Link href="/dashboard">
                <Button className="gradient-primary text-white border-0 shadow-lg">
                  Sistema
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden pb-4"
            >
              <nav className="flex flex-col gap-4">
                {[
                  { label: "Início", href: "#hero" },
                  { label: "Serviços", href: "#servicos" },
                  { label: "Frota", href: "#frota" },
                  { label: "Depoimentos", href: "#depoimentos" },
                  { label: "Contato", href: "#contato" },
                  { label: "Blog", href: "/blog", external: true }
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      if (!(item as any).external) {
                        e.preventDefault();
                        setMobileMenuOpen(false);
                        setTimeout(() => {
                          document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                        }, 300);
                      } else {
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="text-sm font-medium hover:text-primary transition-colors py-2"
                  >
                    {item.label}
                  </a>
                ))}
                <Link href="/dashboard">
                  <Button className="w-full gradient-primary text-white border-0">
                    Acesso ao Sistema
                  </Button>
                </Link>
              </nav>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Hero Section Mobile-Optimized */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-0">
        {/* Background Carousel */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 transition-opacity duration-2000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={image}
                alt={`Frota Martins ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/70 to-black/85"></div>
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10 text-center text-white py-12 md:py-20">
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 text-xs md:text-sm border border-white/20"
            >
              <Sparkles className="h-4 w-4 text-secondary" />
              <span>Mais de 19 anos transformando viagens</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6" 
              style={{fontFamily: 'Poppins'}}
            >
              TRANSPORTE
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600">
                INTELIGENTE
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-base md:text-xl text-gray-200 leading-relaxed mb-8 px-4"
            >
              Soluções premium em transporte corporativo com tecnologia,
              segurança e conforto
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row justify-center gap-4 px-4"
            >
              <Button size="lg" className="gradient-primary text-white border-0 h-14 px-8 text-base shadow-2xl w-full sm:w-auto">
                Solicitar Orçamento
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 w-full sm:w-auto">
                <Phone className="mr-2 h-5 w-5" />
                (41) 99102-1445
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator - Hidden on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-white/70"
          >
            <span className="text-xs">Role para descobrir</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center p-1"
            >
              <div className="w-1 h-1 bg-white/70 rounded-full"></div>
            </motion.div>
          </motion.div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-1 rounded-full transition-all ${
                index === currentImageIndex
                  ? "bg-white w-12"
                  : "bg-white/40 w-6"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Seção de Busca de Viagens */}
      <motion.section {...fadeInUp} className="py-12 md:py-16 bg-white relative -mt-20 z-30">
        <div className="container mx-auto px-4">
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-6 md:p-10 bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-4xl font-bold mb-2" style={{fontFamily: 'Poppins'}}>
                  Planeje Sua <span className="text-gradient">Viagem</span>
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Solicite um orçamento personalizado em segundos
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="lg:col-span-1">
                  <label className="text-sm font-medium mb-2 block">Origem</label>
                  <select 
                    className="w-full h-12 px-4 rounded-lg border border-border bg-white"
                    value={searchForm.origem}
                    onChange={(e) => setSearchForm({...searchForm, origem: e.target.value})}
                  >
                    <option>Curitiba - PR</option>
                    <option>Araucária - PR</option>
                    <option>São José dos Pinhais - PR</option>
                    <option>Pinhais - PR</option>
                    <option>Colombo - PR</option>
                    <option>Maringá - PR</option>
                  </select>
                </div>

                <div className="lg:col-span-1">
                  <label className="text-sm font-medium mb-2 block">Destino</label>
                  <select 
                    className="w-full h-12 px-4 rounded-lg border border-border bg-white"
                    value={searchForm.destino}
                    onChange={(e) => setSearchForm({...searchForm, destino: e.target.value})}
                  >
                    <option>Beto Carrero - SC</option>
                    <option>Florianópolis - SC</option>
                    <option>Foz do Iguaçu - PR</option>
                    <option>Camboriú - SC</option>
                    <option>São Paulo - SP</option>
                    <option>Rio de Janeiro - RJ</option>
                    <option>Gramado - RS</option>
                    <option>Aparecida - SP</option>
                    <option>Curitiba - PR</option>
                  </select>
                </div>

                <div className="lg:col-span-1">
                  <label className="text-sm font-medium mb-2 block">Data de Ida</label>
                  <input 
                    type="date" 
                    className="w-full h-12 px-4 rounded-lg border border-border bg-white"
                    value={searchForm.dataIda}
                    onChange={(e) => setSearchForm({...searchForm, dataIda: e.target.value})}
                  />
                </div>

                <div className="lg:col-span-1">
                  <label className="text-sm font-medium mb-2 block">Passageiros</label>
                  <select 
                    className="w-full h-12 px-4 rounded-lg border border-border bg-white"
                    value={searchForm.passageiros}
                    onChange={(e) => setSearchForm({...searchForm, passageiros: e.target.value})}
                  >
                    <option>1-10 passageiros (Van)</option>
                    <option>11-20 passageiros (Micro-ônibus)</option>
                    <option>21-40 passageiros (Ônibus)</option>
                    <option>40+ passageiros (Ônibus Grande)</option>
                  </select>
                </div>

                <div className="lg:col-span-1 flex items-end">
                  <Button 
                    onClick={handleSearchSubmit}
                    className="w-full h-12 gradient-primary text-white border-0 text-base font-semibold hover:shadow-xl transition-all"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Buscar Orçamento
                  </Button>
                </div>
              </div>

              {/* Simulação de Rota */}
              {routeSimulation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-6 bg-gradient-to-br from-orange-50 to-blue-50 rounded-xl border-2 border-orange-200"
                >
                  <h3 className="text-lg font-bold mb-4 text-center" style={{fontFamily: 'Poppins'}}>
                    🗺️ Simulação de Rota
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-primary" style={{fontFamily: 'Poppins'}}>
                        {routeSimulation.distance} km
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Distância</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-primary" style={{fontFamily: 'Poppins'}}>
                        {routeSimulation.duration}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Tempo Estimado</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-primary" style={{fontFamily: 'Poppins'}}>
                        {routeSimulation.vehicleType}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Veículo Sugerido</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-sm font-bold text-primary" style={{fontFamily: 'Poppins'}}>
                        {routeSimulation.estimatedCost}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Custo Estimado</div>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    * Valores aproximados. Orçamento final pode variar conforme data, horário e serviços adicionais.
                  </p>
                </motion.div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Orçamento Grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Resposta em até 2 horas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Sem Compromisso</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section {...fadeInUp} className="py-16 md:py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { number: 100, suffix: "+", label: "Empresas Parceiras", icon: Briefcase },
              { number: 250, suffix: "+", label: "Pessoas/Mês", icon: Users },
              { number: 19, suffix: "+", label: "Anos", icon: Award },
              { number: 4.3, suffix: "/5", label: "Avaliação", icon: Star }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
                  <stat.icon className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <AnimatedNumber end={stat.number} suffix={stat.suffix} />
                <div className="text-sm md:text-base text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Como Funciona - Mobile Optimized */}
      <motion.section {...fadeInUp} className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs md:text-sm font-semibold text-primary">Processo Simples</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>
              Como <span className="text-gradient">Funciona</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Em apenas 4 passos simples
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8 md:space-y-12">
            {[
              { step: "01", title: "Solicite um Orçamento", description: "Entre em contato. Respondemos em até 2 horas.", icon: Phone },
              { step: "02", title: "Planejamento Personalizado", description: "Criamos uma solução sob medida para você.", icon: Target },
              { step: "03", title: "Aprovação e Contratação", description: "Formalizamos o contrato com transparência.", icon: CheckCircle2 },
              { step: "04", title: "Transporte de Excelência", description: "Viagens seguras, pontuais e confortáveis.", icon: ThumbsUp }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="flex items-start gap-4 md:gap-6"
              >
                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg">
                  {item.step}
                </div>
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-white p-6 md:p-8 rounded-2xl shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 md:p-4 rounded-xl">
                      <item.icon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2" style={{fontFamily: 'Poppins'}}>
                        {item.title}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Serviços - Mobile Grid */}
      <motion.section id="servicos" {...fadeInUp} className="py-16 md:py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div id="frota" className="absolute -top-20"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>
              Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">Serviços</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                image: "/frota/van-executiva-1.jpg",
                title: "Transporte Corporativo",
                description: "Transporte de funcionários com rotas personalizadas.",
                features: ["Rotas customizadas", "Rastreamento GPS", "Motoristas certificados"]
              },
              {
                image: "/frota/onibus-executivo-1.jpg",
                title: "Viagens e Turismo",
                description: "Excursões e viagens organizadas com excelência.",
                features: ["Roteiros personalizados", "Guia bilíngue", "Veículos de luxo"]
              },
              {
                image: "/frota/van-executiva-3.jpg",
                title: "Locação de Veículos",
                description: "Aluguel de vans e micro-ônibus para eventos.",
                features: ["Diversos modelos", "Com ou sem motorista", "Suporte 24/7"]
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="border-0 bg-white/5 backdrop-blur-md overflow-hidden">
                  <div className="relative h-48 md:h-64 overflow-hidden">
                    <img 
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>
                  <CardContent className="p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-bold mb-3" style={{fontFamily: 'Poppins'}}>
                      {service.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-300 mb-4">
                      {service.description}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                      Saiba Mais
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Depoimentos - Mobile Cards */}
      <motion.section id="depoimentos" {...fadeInUp} className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>
              O Que Dizem Nossos <span className="text-gradient">Clientes</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Avaliação 4.3/5 no Google
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { name: "Carlos Silva", company: "Grupo Itaeté", rating: 5, text: "Excelente serviço! Pontualidade e profissionalismo impressionantes." },
              { name: "Maria Santos", company: "VR Controls", rating: 5, text: "Utilizamos há mais de 3 anos. Frota moderna e equipe atenciosa!" },
              { name: "João Oliveira", company: "Efit", rating: 4, text: "Ótima empresa! Veículos confortáveis e motoristas educados." }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="border-0 shadow-xl h-full">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mb-6 italic">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Parceiros - Clientes Atendidos */}
      <motion.section {...fadeInUp} className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>
              Nossos <span className="text-gradient">Parceiros</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Empresas que confiam em nossos serviços
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
            {[
              { name: "EFIT", logo: "/images/partners/efit.png" },
              { name: "Grupo Itaété", logo: "/images/partners/itaete.jpg" },
              { name: "VRG Controls", logo: "/images/partners/vr-controls.png" },
              { name: "Escola CO2", logo: null },
              { name: "Demia Zenza", logo: "/parceiros/demia.png" },
              { name: "Ótico Pitol", logo: null },
              { name: "ITC Engenharia", logo: "/parceiros/itc.png" },
              { name: "COL Rodas e Pneus", logo: null },
              { name: "Nitport", logo: "/parceiros/nitport.jpg" },
              { name: "Empório Dipulo", logo: null },
              { name: "Hanser", logo: "/parceiros/hanser.png" },
              { name: "Mistral", logo: "/parceiros/mistral.png" },
              { name: "MKS Soluções", logo: null },
              { name: "Liandra", logo: null },
              { name: "+ 100 empresas", logo: null }
            ].map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-center"
              >
                <Card className="w-full h-32 md:h-36 border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
                  <CardContent className="p-4 flex items-center justify-center h-full">
                    {partner.logo ? (
                      <img 
                        src={partner.logo} 
                        alt={partner.name} 
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs md:text-sm font-semibold text-center text-muted-foreground hover:text-primary transition-colors">
                        {partner.name}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Certificações e Qualidade Premium */}
      <motion.section {...fadeInUp} className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>
              Empresa <span className="text-gradient">Premium</span> Certificada
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Reconhecida pelos principais órgãos reguladores e associações do setor de transporte
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12">
            {[
              { 
                name: "ANTT", 
                logo: "/certificacoes/antt.jpg",
                description: "Agência Nacional de Transportes Terrestres"
              },
              { 
                name: "ISO 9001", 
                logo: "/certificacoes/iso9001.png",
                description: "Certificação Internacional de Qualidade"
              },
              { 
                name: "Selo de Qualidade", 
                logo: "/certificacoes/selo-qualidade.jpeg",
                description: "Ministério do Turismo"
              },
              { 
                name: "ABRATI", 
                logo: "/certificacoes/abrati.jpeg",
                description: "Associação Brasileira de Apoio"
              },
            ].map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <Card className="w-full h-40 md:h-48 border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-xl bg-white">
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                    <img 
                      src={cert.logo} 
                      alt={cert.name} 
                      className="max-w-full max-h-24 md:max-h-28 object-contain mb-2"
                    />
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      {cert.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Shield,
                title: "Segurança Certificada",
                description: "Todos os veículos passam por rigorosas inspeções de segurança e manutenção preventiva"
              },
              {
                icon: Award,
                title: "Qualidade Garantida",
                description: "Processos certificados ISO 9001 garantindo excelência em todos os serviços"
              },
              {
                icon: CheckCircle2,
                title: "Regularização Total",
                description: "Empresa 100% regularizada junto à ANTT e demais órgãos competentes"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                  <CardContent className="p-6">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-2" style={{fontFamily: 'Poppins'}}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contato - Mobile Form */}
      <motion.section id="contato" {...fadeInUp} className="py-16 md:py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{fontFamily: 'Poppins'}}>
                Vamos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">Conversar</span>?
              </h2>
              <p className="text-base md:text-lg text-gray-300 mb-8">
                Solicite um orçamento personalizado ou tire suas dúvidas.
              </p>

              <div className="space-y-6">
                {[
                  { icon: MapPin, title: "Endereço", content: "Rua Arcione Cantador Grabowski, 252\nAraucária - PR" },
                  { icon: Phone, title: "Telefones", content: "(41) 3643-1427 | (41) 99102-1445" },
                  { icon: Mail, title: "E-mail", content: "contato@martinsviagens.com.br" }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-white/10 p-4 rounded-xl">
                      <item.icon className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-sm md:text-base text-gray-300 whitespace-pre-line">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-0 shadow-2xl">
              <CardContent className="p-6 md:p-10 bg-gradient-to-br from-white to-gray-50">
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900" style={{fontFamily: 'Poppins'}}>
                  Solicite um Orçamento
                </h3>
                <form className="space-y-4">
                  <Input placeholder="Nome completo" className="h-12 text-base" />
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input placeholder="E-mail" type="email" className="h-12 text-base" />
                    <Input placeholder="Telefone" type="tel" className="h-12 text-base" />
                  </div>
                  <Input placeholder="Empresa" className="h-12 text-base" />
                  <Textarea 
                    placeholder="Descreva suas necessidades..." 
                    className="min-h-32 text-base"
                  />
                  <Button className="w-full h-12 md:h-14 text-base gradient-primary text-white border-0 shadow-xl">
                    Enviar Solicitação
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* Cidades Atendidas - Banner Animado */}
      <motion.section {...fadeInUp} className="py-12 md:py-16 bg-gradient-to-r from-primary to-secondary overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{fontFamily: 'Poppins'}}>
              Levamos Você a Qualquer Lugar
            </h3>
            <p className="text-white/90 text-sm md:text-base">
              Já atendemos centenas de destinos pelo Brasil
            </p>
          </div>
          
          <div className="relative">
            <div className="flex gap-6 animate-scroll">
              {[
                "Beto Carrero World",
                "Curitiba",
                "São Paulo",
                "Florianópolis",
                "Balneário Camboriú",
                "Foz do Iguaçu",
                "Gramado",
                "Canela",
                "Porto Alegre",
                "Rio de Janeiro",
                "Aparecida do Norte",
                "Holambra",
                "Campos do Jordão",
                "Santos",
                "Guarujá",
                "Morretes",
                "Paranaguá",
                "Ponta Grossa",
                "Londrina",
                "Maringá",
                // Duplicar para efeito infinito
                "Beto Carrero World",
                "Curitiba",
                "São Paulo",
                "Florianópolis",
                "Balneário Camboriú",
                "Foz do Iguaçu",
                "Gramado",
                "Canela",
                "Porto Alegre",
                "Rio de Janeiro"
              ].map((city, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 text-white font-semibold text-sm md:text-base whitespace-nowrap"
                >
                  <MapPin className="inline-block h-4 w-4 mr-2" />
                  {city}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer - Mobile Optimized */}
      <footer className="bg-gradient-to-br from-gray-950 to-gray-900 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div>
              <img src="/images/logo-martins-transparent.png" alt="Martins Viagens e Turismo" className="h-10 mb-4" />
              <p className="text-sm text-gray-400">
                Mais de 19 anos oferecendo soluções em transporte com excelência.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Serviços</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#servicos" className="hover:text-white transition-colors">Transporte Corporativo</a></li>
                <li><a href="#servicos" className="hover:text-white transition-colors">Viagens e Turismo</a></li>
                <li><a href="#servicos" className="hover:text-white transition-colors">Locação de Veículos</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#frota" className="hover:text-white transition-colors">Nossa Frota</a></li>
                <li><a href="#contato" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Horário</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Seg a Sex: 8h às 18h</li>
                <li>Sábado: 8h às 12h</li>
                <li>Domingo: Fechado</li>
                <li className="pt-2">
                  <span className="text-secondary font-semibold">Emergências 24/7</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>© 2026 Martins Viagens e Turismo. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
