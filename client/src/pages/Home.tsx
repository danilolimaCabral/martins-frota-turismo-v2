import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/Logo";
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
  ArrowRight
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
    }, 4000); // Troca a cada 4 segundos

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Logo />
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#sobre" className="text-sm font-medium hover:text-primary transition-colors">
                Sobre
              </a>
              <a href="#servicos" className="text-sm font-medium hover:text-primary transition-colors">
                Serviços
              </a>
              <a href="#frota" className="text-sm font-medium hover:text-primary transition-colors">
                Frota
              </a>
              <a href="#contato" className="text-sm font-medium hover:text-primary transition-colors">
                Contato
              </a>
              <Link href="/dashboard">
                <Button variant="default" size="sm">
                  Acesso ao Sistema
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{fontFamily: 'Poppins'}}>
                Transporte de <span className="text-gradient">Excelência</span> para sua Empresa
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Com mais de 19 anos de experiência, a Martins Viagens e Turismo oferece soluções completas 
                em transporte corporativo, turismo e locação de veículos com segurança, conforto e pontualidade.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="text-base">
                  Solicitar Orçamento
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-base">
                  Conheça Nossa Frota
                </Button>
              </div>
              
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">19+</div>
                  <div className="text-sm text-muted-foreground">Anos de Experiência</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">100+</div>
                  <div className="text-sm text-muted-foreground">Empresas Atendidas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                  <div className="text-sm text-muted-foreground">Suporte Disponível</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-elegant-lg h-[500px]">
                {heroImages.map((image, index) => (
                  <img
                    key={image}
                    src={image}
                    alt={`Frota Martins Viagens e Turismo ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentImageIndex ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
                
                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-white w-8"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                      aria-label={`Ir para imagem ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-elegant">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Star className="h-6 w-6 text-primary fill-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">4.8/5</div>
                    <div className="text-sm text-muted-foreground">Avaliação Google</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>
              Por que escolher a <span className="text-gradient">Martins</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compromisso com excelência, segurança e satisfação do cliente em cada viagem
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-elegant hover:shadow-elegant-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Poppins'}}>
                  Segurança Garantida
                </h3>
                <p className="text-muted-foreground">
                  Frota moderna com manutenção preventiva e motoristas altamente qualificados
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant hover:shadow-elegant-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-secondary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Poppins'}}>
                  Pontualidade
                </h3>
                <p className="text-muted-foreground">
                  Cumprimento rigoroso de horários e rotas planejadas com precisão
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant hover:shadow-elegant-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Poppins'}}>
                  Equipe Experiente
                </h3>
                <p className="text-muted-foreground">
                  Motoristas treinados e equipe dedicada ao seu atendimento
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant hover:shadow-elegant-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-secondary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Bus className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Poppins'}}>
                  Frota Moderna
                </h3>
                <p className="text-muted-foreground">
                  Veículos novos, confortáveis e equipados com tecnologia de ponta
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>
              Nossos <span className="text-gradient">Serviços</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Soluções completas em transporte para atender todas as necessidades da sua empresa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-elegant overflow-hidden group hover:shadow-elegant-lg transition-all">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="/images/van-2.jpg" 
                  alt="Transporte Corporativo" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 gradient-overlay opacity-40"></div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold mb-3" style={{fontFamily: 'Poppins'}}>
                  Transporte Corporativo
                </h3>
                <p className="text-muted-foreground mb-4">
                  Transporte de funcionários com rotas personalizadas, pontualidade e conforto garantidos.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Rotas customizadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Motoristas treinados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Rastreamento em tempo real</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant overflow-hidden group hover:shadow-elegant-lg transition-all">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="/images/bus-luxury.jpg" 
                  alt="Viagens e Turismo" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 gradient-overlay opacity-40"></div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold mb-3" style={{fontFamily: 'Poppins'}}>
                  Viagens e Turismo
                </h3>
                <p className="text-muted-foreground mb-4">
                  Excursões e pacotes turísticos com roteiros personalizados e veículos de luxo.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Roteiros personalizados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Veículos de luxo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Guias especializados</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant overflow-hidden group hover:shadow-elegant-lg transition-all">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="/images/van-3.png" 
                  alt="Locação de Veículos" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 gradient-overlay opacity-40"></div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold mb-3" style={{fontFamily: 'Poppins'}}>
                  Locação de Veículos
                </h3>
                <p className="text-muted-foreground mb-4">
                  Aluguel de vans e ônibus com ou sem motorista para eventos e ocasiões especiais.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Diversos modelos disponíveis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Com ou sem motorista</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Contratos flexíveis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Frota */}
      <section id="frota" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>
              Nossa <span className="text-gradient">Frota</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Veículos modernos, confortáveis e equipados com tecnologia de ponta
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-elegant overflow-hidden">
              <img 
                src="/images/van-fleet.png" 
                alt="Van Executiva" 
                className="w-full h-56 object-cover"
              />
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Poppins'}}>
                  Vans Executivas
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Capacidade de 10 a 20 passageiros com ar-condicionado e poltronas reclináveis
                </p>
                <Button variant="outline" className="w-full">
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant overflow-hidden">
              <img 
                src="/images/bus-interior.jpg" 
                alt="Ônibus de Turismo" 
                className="w-full h-56 object-cover"
              />
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Poppins'}}>
                  Ônibus de Turismo
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Capacidade de 40 a 60 passageiros com poltronas leito e semi-leito
                </p>
                <Button variant="outline" className="w-full">
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant overflow-hidden">
              <img 
                src="/images/van-2.jpg" 
                alt="Micro-ônibus" 
                className="w-full h-56 object-cover"
              />
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Poppins'}}>
                  Micro-ônibus
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Capacidade de 20 a 30 passageiros ideal para grupos médios
                </p>
                <Button variant="outline" className="w-full">
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold mb-6" style={{fontFamily: 'Poppins'}}>
                Entre em <span className="text-gradient">Contato</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Solicite um orçamento personalizado ou tire suas dúvidas. Nossa equipe está pronta para atendê-lo!
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Endereço</h3>
                    <p className="text-muted-foreground">
                      Rua Arcione Cantador Grabowski, 252<br />
                      CEP 83707-582 - Araucária - PR
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Telefones</h3>
                    <p className="text-muted-foreground">
                      (41) 3643-1427<br />
                      (41) 99102-1445<br />
                      (41) 99743-6655
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">E-mail</h3>
                    <p className="text-muted-foreground">
                      contato@martinsviagens.com.br
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-0 shadow-elegant-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-6" style={{fontFamily: 'Poppins'}}>
                  Solicite um Orçamento
                </h3>
                <form className="space-y-4">
                  <div>
                    <Input placeholder="Nome completo" className="h-12" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input placeholder="E-mail" type="email" className="h-12" />
                    <Input placeholder="Telefone" type="tel" className="h-12" />
                  </div>
                  <div>
                    <Input placeholder="Empresa" className="h-12" />
                  </div>
                  <div>
                    <Textarea 
                      placeholder="Descreva suas necessidades de transporte..." 
                      className="min-h-32"
                    />
                  </div>
                  <Button className="w-full h-12 text-base" size="lg">
                    Enviar Solicitação
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo className="mb-4" />
              <p className="text-sm text-muted-foreground">
                Mais de 19 anos oferecendo soluções em transporte com excelência e segurança.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Serviços</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Transporte Corporativo</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Viagens e Turismo</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Locação de Veículos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Transporte Escolar</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#sobre" className="hover:text-primary transition-colors">Sobre Nós</a></li>
                <li><a href="#frota" className="hover:text-primary transition-colors">Nossa Frota</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Parceiros</a></li>
                <li><a href="#contato" className="hover:text-primary transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Horário de Atendimento</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Segunda a Sexta: 8h às 18h</li>
                <li>Sábado: 8h às 12h</li>
                <li>Domingo: Fechado</li>
                <li className="pt-2">
                  <span className="text-primary font-semibold">Emergências 24/7</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2026 Martins Viagens e Turismo. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
