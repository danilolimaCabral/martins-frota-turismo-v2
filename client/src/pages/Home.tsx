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
  TrendingUp,
  Briefcase,
  Sparkles,
  Target,
  Heart
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  
  const heroImages = [
    "/images/van-1.jpg",
    "/images/van-2.jpg",
    "/images/van-3.png",
    "/images/bus-luxury.jpg",
    "/images/van-fleet.png",
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header Premium com Glassmorphism */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-border/30"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-24">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <img 
                src="/images/logo-original.webp" 
                alt="Martins Viagens e Turismo" 
                className="h-14 w-auto"
              />
            </motion.div>
            
            <nav className="hidden lg:flex items-center gap-10">
              {["Início", "Serviços", "Frota", "Parceiros", "Contato"].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="text-sm font-medium hover:text-primary transition-colors relative group"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                </motion.a>
              ))}
              <Link href="/dashboard">
                <Button className="gradient-primary text-white border-0 shadow-lg hover:shadow-xl transition-all">
                  Acesso ao Sistema
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section Fullscreen Ultra Premium */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background com Parallax */}
        <div 
          className="absolute inset-0 z-0"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
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
                className="w-full h-full object-cover scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
            </div>
          ))}
        </div>

        {/* Conteúdo Hero */}
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/20"
            >
              <Sparkles className="h-5 w-5 text-secondary" />
              <span className="text-sm font-medium">19+ anos transformando viagens em experiências</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-6xl lg:text-8xl font-bold leading-tight mb-8" 
              style={{fontFamily: 'Poppins', letterSpacing: '-0.02em'}}
            >
              TRANSPORTE
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-orange-400 to-blue-400">
                INTELIGENTE
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl lg:text-2xl text-gray-200 leading-relaxed mb-12 max-w-3xl mx-auto"
            >
              Soluções premium em transporte corporativo com tecnologia de ponta,
              segurança absoluta e conforto incomparável
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <Button size="lg" className="gradient-primary text-white border-0 h-16 px-10 text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all">
                Solicitar Orçamento
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 text-lg bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20">
                <Phone className="mr-3 h-6 w-6" />
                (41) 99102-1445
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-2 text-white/70">
              <span className="text-sm">Role para descobrir</span>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
              >
                <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Indicadores do Carrossel */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentImageIndex
                  ? "bg-white w-16"
                  : "bg-white/40 hover:bg-white/60 w-8"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Estatísticas Animadas */}
      <motion.section 
        {...fadeInUp}
        className="py-24 bg-gradient-to-br from-primary/5 to-secondary/5"
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            {[
              { number: "100+", label: "Empresas Parceiras", icon: Briefcase },
              { number: "250+", label: "Pessoas Transportadas/Mês", icon: Users },
              { number: "19+", label: "Anos de Experiência", icon: Award },
              { number: "24/7", label: "Suporte Disponível", icon: Clock }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-6">
                  <stat.icon className="h-10 w-10 text-primary" />
                </div>
                <div className="text-5xl font-bold text-primary mb-3" style={{fontFamily: 'Poppins'}}>
                  {stat.number}
                </div>
                <div className="text-lg text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Seção Sobre - Storytelling */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div {...fadeInUp}>
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary/10 rounded-full mb-8">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary">Nossa Missão</span>
              </div>
              
              <h2 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight" style={{fontFamily: 'Poppins'}}>
                Redefinindo o
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Transporte Corporativo
                </span>
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Há mais de 19 anos, a Martins Viagens e Turismo tem sido sinônimo de excelência 
                em transporte. Nossa missão é proporcionar experiências de viagem que vão além 
                do deslocamento, combinando tecnologia de ponta, segurança incomparável e 
                conforto premium.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Shield, title: "Segurança Certificada", desc: "Frota com manutenção preventiva rigorosa" },
                  { icon: Heart, title: "Atendimento Humanizado", desc: "Equipe dedicada ao seu bem-estar" },
                  { icon: TrendingUp, title: "Inovação Constante", desc: "Tecnologia aplicada em cada viagem" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-start gap-4"
                  >
                    <div className="bg-primary/10 p-4 rounded-xl">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/images/van-2.jpg"
                  alt="Frota Martins"
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-10 -left-10 bg-white p-8 rounded-2xl shadow-2xl"
              >
                <div className="flex items-center gap-5">
                  <div className="bg-primary/10 p-5 rounded-xl">
                    <Star className="h-10 w-10 text-primary fill-primary" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-1">4.9/5</div>
                    <div className="text-sm text-muted-foreground">Avaliação Google</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Serviços Premium com Cards Interativos */}
      <motion.section 
        id="servicos"
        {...staggerContainer}
        className="py-32 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden"
      >
        {/* Padrão de fundo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md rounded-full mb-8">
              <Briefcase className="h-5 w-5 text-secondary" />
              <span className="text-sm font-semibold">Soluções Completas</span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-bold mb-8" style={{fontFamily: 'Poppins'}}>
              Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">Serviços</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Atendemos todas as necessidades de transporte com qualidade e profissionalismo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                image: "/images/van-2.jpg",
                title: "Transporte Corporativo",
                description: "Transporte de funcionários com rotas personalizadas e rastreamento em tempo real.",
                features: ["Rotas customizadas", "Rastreamento GPS", "Motoristas certificados", "Relatórios mensais"]
              },
              {
                image: "/images/bus-luxury.jpg",
                title: "Viagens e Turismo",
                description: "Excursões, congressos e viagens comerciais organizadas com excelência.",
                features: ["Roteiros personalizados", "Guia bilíngue", "Veículos de luxo", "Convênios comerciais"]
              },
              {
                image: "/images/van-3.png",
                title: "Locação de Veículos",
                description: "Aluguel de vans e micro-ônibus com ou sem motorista para eventos especiais.",
                features: ["Diversos modelos", "Com ou sem motorista", "Contratos flexíveis", "Suporte 24/7"]
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="border-0 bg-white/5 backdrop-blur-md overflow-hidden hover:bg-white/10 transition-all duration-500">
                  <div className="relative h-72 overflow-hidden">
                    <img 
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  </div>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>
                      {service.title}
                    </h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                      Saiba Mais
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Frota com Grid Moderno */}
      <motion.section 
        id="frota"
        {...staggerContainer}
        className="py-32"
      >
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold mb-8" style={{fontFamily: 'Poppins'}}>
              Nossa <span className="text-gradient">Frota</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Veículos modernos e equipados com tecnologia de ponta
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                image: "/images/van-fleet.png",
                title: "Vans Executivas",
                capacity: "10 a 20 passageiros",
                features: ["Ar-condicionado", "Poltronas reclináveis", "Sistema de som", "Porta-malas amplo"]
              },
              {
                image: "/images/bus-interior.jpg",
                title: "Ônibus de Turismo",
                capacity: "40 a 60 passageiros",
                features: ["Poltronas leito", "Banheiro", "Wi-Fi", "Sistema multimídia"]
              },
              {
                image: "/images/van-1.jpg",
                title: "Micro-ônibus",
                capacity: "20 a 30 passageiros",
                features: ["Conforto premium", "Climatização", "Bagageiro", "USB em cada poltrona"]
              }
            ].map((vehicle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="border-0 shadow-2xl overflow-hidden group">
                  <div className="relative h-72 overflow-hidden">
                    <img 
                      src={vehicle.image}
                      alt={vehicle.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-bold text-white mb-2" style={{fontFamily: 'Poppins'}}>
                        {vehicle.title}
                      </h3>
                      <p className="text-secondary font-semibold">{vehicle.capacity}</p>
                    </div>
                  </div>
                  <CardContent className="p-8 bg-gradient-to-br from-white to-gray-50">
                    <ul className="space-y-3 mb-6">
                      {vehicle.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Parceiros com Logo Grid */}
      <motion.section 
        id="parceiros"
        {...fadeInUp}
        className="py-32 bg-muted/30"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold mb-8" style={{fontFamily: 'Poppins'}}>
              Nossos <span className="text-gradient">Parceiros</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Empresas que confiam na Martins para transporte de seus colaboradores
            </p>
          </div>

          <motion.div 
            {...staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-16"
          >
            {[
              "Efit", "Grupo Itaeté", "Demia Zenza", "Círculo Militar",
              "VR Controls", "Estrutora LTC", "COA Rodas", "Nitport",
              "Empório Dipulo", "Hanser", "Mistral II", "MKS Soluções"
            ].map((partner, index) => (
              <motion.div
                key={partner}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="border-0 shadow-elegant hover:shadow-elegant-lg transition-all group">
                  <CardContent className="p-6 flex items-center justify-center h-32">
                    <p className="text-center font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                      {partner}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            {...fadeInUp}
            className="text-center"
          >
            <p className="text-2xl text-muted-foreground mb-8">
              Mais de <span className="font-bold text-primary text-3xl">100 empresas</span> confiam em nossos serviços
            </p>
            <Button size="lg" className="gradient-primary text-white border-0 h-16 px-10 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              Seja Nosso Parceiro
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Contato Premium */}
      <motion.section 
        id="contato"
        {...fadeInUp}
        className="py-32 bg-gradient-to-br from-primary/5 to-secondary/5"
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-5xl lg:text-6xl font-bold mb-8" style={{fontFamily: 'Poppins'}}>
                Vamos <span className="text-gradient">Conversar</span>?
              </h2>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                Solicite um orçamento personalizado ou tire suas dúvidas. 
                Nossa equipe está pronta para atendê-lo!
              </p>

              <div className="space-y-8">
                {[
                  {
                    icon: MapPin,
                    title: "Endereço",
                    content: "Rua Arcione Cantador Grabowski, 252\nCEP 83707-582 - Araucária - PR"
                  },
                  {
                    icon: Phone,
                    title: "Telefones",
                    content: "(41) 3643-1427 | (41) 99102-1445\n(41) 99743-6655"
                  },
                  {
                    icon: Mail,
                    title: "E-mail",
                    content: "contato@martinsviagens.com.br"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-start gap-6 group"
                  >
                    <div className="bg-primary/10 p-5 rounded-2xl group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                      <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{item.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Card className="border-0 shadow-2xl overflow-hidden">
                <CardContent className="p-12 bg-gradient-to-br from-white to-gray-50">
                  <h3 className="text-3xl font-bold mb-8" style={{fontFamily: 'Poppins'}}>
                    Solicite um Orçamento
                  </h3>
                  <form className="space-y-6">
                    <Input placeholder="Nome completo" className="h-14 text-base" />
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input placeholder="E-mail" type="email" className="h-14 text-base" />
                      <Input placeholder="Telefone" type="tel" className="h-14 text-base" />
                    </div>
                    <Input placeholder="Empresa" className="h-14 text-base" />
                    <Textarea 
                      placeholder="Descreva suas necessidades de transporte..." 
                      className="min-h-48 text-base"
                    />
                    <Button className="w-full h-16 text-lg gradient-primary text-white border-0 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                      Enviar Solicitação
                      <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer Premium */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-16 mb-16">
            <div>
              <img 
                src="/images/logo-original.webp" 
                alt="Martins" 
                className="h-14 w-auto mb-6 brightness-0 invert"
              />
              <p className="text-gray-400 leading-relaxed mb-6">
                Mais de 19 anos oferecendo soluções em transporte com excelência, 
                segurança e inovação.
              </p>
              <div className="flex gap-4">
                {/* Redes sociais podem ser adicionadas aqui */}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-xl mb-6" style={{fontFamily: 'Poppins'}}>Serviços</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#servicos" className="hover:text-white transition-colors">Transporte Corporativo</a></li>
                <li><a href="#servicos" className="hover:text-white transition-colors">Viagens e Turismo</a></li>
                <li><a href="#servicos" className="hover:text-white transition-colors">Locação de Veículos</a></li>
                <li><a href="#servicos" className="hover:text-white transition-colors">Transporte Escolar</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-xl mb-6" style={{fontFamily: 'Poppins'}}>Empresa</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#frota" className="hover:text-white transition-colors">Nossa Frota</a></li>
                <li><a href="#parceiros" className="hover:text-white transition-colors">Parceiros</a></li>
                <li><a href="#contato" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-xl mb-6" style={{fontFamily: 'Poppins'}}>Horário</h4>
              <ul className="space-y-4 text-gray-400">
                <li>Segunda a Sexta: 8h às 18h</li>
                <li>Sábado: 8h às 12h</li>
                <li>Domingo: Fechado</li>
                <li className="pt-4">
                  <span className="text-secondary font-semibold text-lg">Emergências 24/7</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-700 text-center text-gray-400">
            <p className="text-lg">© 2026 Martins Viagens e Turismo. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
