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
  X
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
  
  const heroImages = [
    "/images/martins-fleet-real.webp",
    "/images/martins-van-white-real.webp",
    "/images/martins-bus-real-4.webp",
    "/images/martins-bus-real-5.webp",
    "/images/martins-van-real-1.webp",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header Mobile-First */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-border/20 shadow-lg"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <img src="/images/logo-martins-real.png" alt="Martins Viagens e Turismo" className="h-10 md:h-14 w-auto" />
            
            {/* Desktop Menu */}
            <nav className="hidden lg:flex items-center gap-8">
              {["Início", "Serviços", "Frota", "Depoimentos", "Contato"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {item}
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
                {["Início", "Serviços", "Frota", "Depoimentos", "Contato"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium hover:text-primary transition-colors py-2"
                  >
                    {item}
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-0">
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-orange-400 to-blue-400">
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
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>
              Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">Serviços</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                image: "/images/martins-van-white-real.webp",
                title: "Transporte Corporativo",
                description: "Transporte de funcionários com rotas personalizadas.",
                features: ["Rotas customizadas", "Rastreamento GPS", "Motoristas certificados"]
              },
              {
                image: "/images/martins-bus-real-5.webp",
                title: "Viagens e Turismo",
                description: "Excursões e viagens organizadas com excelência.",
                features: ["Roteiros personalizados", "Guia bilíngue", "Veículos de luxo"]
              },
              {
                image: "/images/martins-fleet-real.webp",
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
              <img src="/images/logo-martins-real.png" alt="Martins Viagens e Turismo" className="h-10 mb-4" />
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
