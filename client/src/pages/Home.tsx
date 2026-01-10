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
  Globe,
  Award,
  TrendingUp,
  Briefcase
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const heroImages = [
    "/images/van-1.jpg",
    "/images/van-2.jpg",
    "/images/van-3.png",
    "/images/bus-luxury.jpg",
    "/images/van-fleet.png",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Moderno */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img 
                src="/images/logo-original.webp" 
                alt="Martins Viagens e Turismo" 
                className="h-12 w-auto"
              />
            </div>
            
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#home" className="text-sm font-medium hover:text-primary transition-colors">
                Início
              </a>
              <a href="#servicos" className="text-sm font-medium hover:text-primary transition-colors">
                Serviços
              </a>
              <a href="#frota" className="text-sm font-medium hover:text-primary transition-colors">
                Frota
              </a>
              <a href="#parceiros" className="text-sm font-medium hover:text-primary transition-colors">
                Parceiros
              </a>
              <a href="#contato" className="text-sm font-medium hover:text-primary transition-colors">
                Contato
              </a>
              <Link href="/dashboard">
                <Button className="gradient-primary text-white border-0">
                  Acesso ao Sistema
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section Ultra Moderno */}
      <section id="home" className="relative pt-32 pb-24 overflow-hidden">
        {/* Background com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-orange-50 to-blue-50"></div>
        
        {/* Formas decorativas */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">19+ anos de experiência</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight" style={{fontFamily: 'Poppins'}}>
                Transporte
                <br />
                <span className="text-gradient">Inteligente</span>
                <br />
                para sua Empresa
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Soluções completas em transporte corporativo, viagens turísticas e locação de veículos 
                com tecnologia, segurança e conforto.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gradient-primary text-white border-0 h-14 px-8 text-base">
                  Solicitar Orçamento
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base">
                  <Phone className="mr-2 h-5 w-5" />
                  (41) 99102-1445
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">100+</div>
                  <div className="text-sm text-muted-foreground">Empresas Atendidas</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">250+</div>
                  <div className="text-sm text-muted-foreground">Pessoas/Mês</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">Suporte</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-elegant-lg h-[600px]">
                {heroImages.map((image, index) => (
                  <img
                    key={image}
                    src={image}
                    alt={`Frota Martins ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentImageIndex ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-white w-12"
                          : "bg-white/50 hover:bg-white/75 w-2"
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-2xl shadow-elegant-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-4 rounded-xl">
                    <Star className="h-8 w-8 text-primary fill-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">4.8/5</div>
                    <div className="text-sm text-muted-foreground">Avaliação Google</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais Modernos */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Nossos Diferenciais</span>
            </div>
            <h2 className="text-5xl font-bold mb-6" style={{fontFamily: 'Poppins'}}>
              Por que escolher a <span className="text-gradient">Martins</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Compromisso com excelência, inovação e satisfação do cliente em cada viagem
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Segurança Total",
                description: "Frota moderna com manutenção preventiva rigorosa e motoristas certificados",
                color: "primary"
              },
              {
                icon: Clock,
                title: "Pontualidade",
                description: "Sistema de rastreamento GPS e planejamento inteligente de rotas",
                color: "secondary"
              },
              {
                icon: Users,
                title: "Equipe Qualificada",
                description: "Profissionais treinados e comprometidos com excelência no atendimento",
                color: "primary"
              },
              {
                icon: Bus,
                title: "Frota Premium",
                description: "Veículos equipados com tecnologia de ponta e máximo conforto",
                color: "secondary"
              }
            ].map((item, index) => (
              <Card key={index} className="border-0 shadow-elegant hover:shadow-elegant-lg transition-all group bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-8">
                  <div className={`bg-${item.color}/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <item.icon className={`h-8 w-8 text-${item.color}`} />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4" style={{fontFamily: 'Poppins'}}>
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços Premium */}
      <section id="servicos" className="py-24 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Soluções Completas</span>
            </div>
            <h2 className="text-5xl font-bold mb-6" style={{fontFamily: 'Poppins'}}>
              Nossos <span className="text-gradient">Serviços</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Atendemos todas as necessidades de transporte da sua empresa com qualidade e profissionalismo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                image: "/images/van-2.jpg",
                title: "Transporte Corporativo",
                description: "Transporte de funcionários com rotas personalizadas, rastreamento em tempo real e motoristas qualificados.",
                features: ["Rotas customizadas", "Rastreamento GPS", "Motoristas certificados", "Relatórios mensais"]
              },
              {
                image: "/images/bus-luxury.jpg",
                title: "Viagens e Turismo",
                description: "Excursões, congressos culturais e religiosos, convenções e viagens comerciais organizadas.",
                features: ["Roteiros personalizados", "Guia bilíngue", "Veículos de luxo", "Convênios comerciais"]
              },
              {
                image: "/images/van-3.png",
                title: "Locação de Veículos",
                description: "Aluguel de vans, micro-ônibus e automóveis com ou sem motorista para eventos especiais.",
                features: ["Diversos modelos", "Com ou sem motorista", "Contratos flexíveis", "Suporte 24/7"]
              }
            ].map((service, index) => (
              <Card key={index} className="border-0 shadow-elegant overflow-hidden group hover:shadow-elegant-lg transition-all">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-4" style={{fontFamily: 'Poppins'}}>
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full">
                    Saiba Mais
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Frota Moderna */}
      <section id="frota" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6" style={{fontFamily: 'Poppins'}}>
              Nossa <span className="text-gradient">Frota</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Veículos modernos e bem equipados para garantir conforto e segurança
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
              <Card key={index} className="border-0 shadow-elegant overflow-hidden hover:shadow-elegant-lg transition-all">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={vehicle.image}
                    alt={vehicle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-2" style={{fontFamily: 'Poppins'}}>
                    {vehicle.title}
                  </h3>
                  <p className="text-primary font-medium mb-6">{vehicle.capacity}</p>
                  <ul className="space-y-2 mb-6">
                    {vehicle.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full">
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Parceiros */}
      <section id="parceiros" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6" style={{fontFamily: 'Poppins'}}>
              Nossos <span className="text-gradient">Parceiros</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Empresas que confiam na Martins para transporte de seus colaboradores
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
            {[
              "Efit", "Grupo Itaeté", "Demia Zenza", "Círculo Militar",
              "VR Controls", "Estrutora LTC", "COA Rodas e Eixos", "Nitport",
              "Empório Dipulo", "Hanser", "Mistral II", "MKS Soluções"
            ].map((partner) => (
              <Card key={partner} className="border-0 shadow-elegant hover:shadow-elegant-lg transition-all group">
                <CardContent className="p-6 flex items-center justify-center h-28">
                  <p className="text-center font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    {partner}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xl text-muted-foreground mb-8">
              Mais de <span className="font-bold text-primary text-2xl">100 empresas</span> confiam em nossos serviços
            </p>
            <Button size="lg" className="gradient-primary text-white border-0">
              Seja Nosso Parceiro
            </Button>
          </div>
        </div>
      </section>

      {/* Contato Moderno */}
      <section id="contato" className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-5xl font-bold mb-6" style={{fontFamily: 'Poppins'}}>
                Entre em <span className="text-gradient">Contato</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-12">
                Solicite um orçamento personalizado ou tire suas dúvidas. Estamos prontos para atendê-lo!
              </p>

              <div className="space-y-8">
                {[
                  {
                    icon: MapPin,
                    title: "Endereço",
                    content: "Rua Arcione Cantador Grabowski, 252\nCEP 83707-582 - Araucária - PR",
                    color: "primary"
                  },
                  {
                    icon: Phone,
                    title: "Telefones",
                    content: "(41) 3643-1427\n(41) 99102-1445\n(41) 99743-6655",
                    color: "secondary"
                  },
                  {
                    icon: Mail,
                    title: "E-mail",
                    content: "contato@martinsviagens.com.br",
                    color: "primary"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-6">
                    <div className={`bg-${item.color}/10 p-4 rounded-2xl`}>
                      <item.icon className={`h-7 w-7 text-${item.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-0 shadow-elegant-lg">
              <CardContent className="p-10">
                <h3 className="text-3xl font-semibold mb-8" style={{fontFamily: 'Poppins'}}>
                  Solicite um Orçamento
                </h3>
                <form className="space-y-6">
                  <Input placeholder="Nome completo" className="h-14" />
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input placeholder="E-mail" type="email" className="h-14" />
                    <Input placeholder="Telefone" type="tel" className="h-14" />
                  </div>
                  <Input placeholder="Empresa" className="h-14" />
                  <Textarea 
                    placeholder="Descreva suas necessidades de transporte..." 
                    className="min-h-40"
                  />
                  <Button className="w-full h-14 text-base gradient-primary text-white border-0" size="lg">
                    Enviar Solicitação
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Moderno */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <img 
                src="/images/logo-original.webp" 
                alt="Martins" 
                className="h-12 w-auto mb-6 brightness-0 invert"
              />
              <p className="text-gray-400 leading-relaxed">
                Mais de 19 anos oferecendo soluções em transporte com excelência, segurança e inovação.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">Serviços</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Transporte Corporativo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Viagens e Turismo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Locação de Veículos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Transporte Escolar</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">Empresa</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#frota" className="hover:text-white transition-colors">Nossa Frota</a></li>
                <li><a href="#parceiros" className="hover:text-white transition-colors">Parceiros</a></li>
                <li><a href="#contato" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">Horário</h4>
              <ul className="space-y-3 text-gray-400">
                <li>Segunda a Sexta: 8h às 18h</li>
                <li>Sábado: 8h às 12h</li>
                <li>Domingo: Fechado</li>
                <li className="pt-3">
                  <span className="text-secondary font-semibold">Emergências 24/7</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© 2026 Martins Viagens e Turismo. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
