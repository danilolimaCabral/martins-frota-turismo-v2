import { motion } from "framer-motion";
import { Award, Heart, Target, Users, TrendingUp, Shield, Clock, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Sobre() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const timeline = [
    { year: "2006", title: "Fundação", description: "Início das operações com 2 veículos e muito sonho" },
    { year: "2010", title: "Expansão", description: "Frota ampliada para 15 veículos" },
    { year: "2015", title: "Certificação ISO", description: "Conquista da certificação ISO 9001:2015" },
    { year: "2018", title: "Tecnologia", description: "Implementação de rastreamento GPS em toda frota" },
    { year: "2022", title: "Digitalização", description: "Lançamento do sistema de gestão inteligente" },
    { year: "2025", title: "Liderança", description: "60+ veículos e referência no Paraná" }
  ];

  const team = [
    { name: "João Martins", role: "Fundador & CEO", photo: "/team/joao-martins.jpg" },
    { name: "Maria Martins", role: "Diretora Operacional", photo: "/team/maria-martins.jpg" },
    { name: "Carlos Silva", role: "Gerente de Frota", photo: "/team/carlos-silva.jpg" },
    { name: "Ana Santos", role: "Gerente Comercial", photo: "/team/ana-santos.jpg" }
  ];

  const diferenciais = [
    { icon: Shield, title: "Segurança Total", description: "Frota com seguro completo e manutenção rigorosa" },
    { icon: Clock, title: "Pontualidade", description: "98% de pontualidade em mais de 10.000 viagens" },
    { icon: Users, title: "Equipe Qualificada", description: "Motoristas treinados e certificados" },
    { icon: TrendingUp, title: "Tecnologia", description: "Rastreamento GPS e sistema de gestão inteligente" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Martins MV" className="h-12" />
          </a>
          <a href="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
            ← Voltar para Home
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary to-secondary text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...fadeInUp} className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 text-sm border border-white/20">
              <Sparkles className="h-4 w-4" />
              <span>Mais de 19 anos transformando viagens</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{fontFamily: 'Poppins'}}>
              Sobre a <span className="text-secondary">Martins</span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Uma história de dedicação, crescimento e compromisso com a excelência no transporte corporativo
            </p>
          </motion.div>
        </div>
      </section>

      {/* História */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12" style={{fontFamily: 'Poppins'}}>
              Nossa <span className="text-primary">História</span>
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Fundada em 2006 pelos irmãos João e Maria Martins, a <strong>Martins Viagens e Turismo</strong> nasceu de um sonho: oferecer transporte de qualidade com segurança e pontualidade. O que começou com apenas 2 veículos e muita determinação, hoje se tornou referência no Paraná com uma frota de mais de 60 veículos modernos.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Ao longo desses 19 anos, investimos continuamente em <strong>tecnologia, treinamento e infraestrutura</strong>. Conquistamos certificações importantes como ISO 9001:2015 e ANTT, sempre mantendo o foco na satisfação dos nossos clientes e na segurança dos passageiros.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Hoje, atendemos grandes empresas do Paraná e São Paulo, realizando mais de <strong>10.000 viagens por ano</strong> com excelência operacional e compromisso com a sustentabilidade.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>
              Linha do <span className="text-primary">Tempo</span>
            </h2>
            <p className="text-lg text-gray-600">19 anos de crescimento e conquistas</p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary to-secondary"></div>

              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                    <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="text-3xl font-bold text-primary mb-2">{item.year}</div>
                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Círculo no meio */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-primary border-4 border-white shadow-lg z-10"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div {...fadeInUp}>
              <Card className="h-full border-0 shadow-xl bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>Missão</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Proporcionar soluções de transporte seguras, pontuais e confortáveis, superando as expectativas dos clientes com tecnologia e profissionalismo.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="h-full border-0 shadow-xl bg-gradient-to-br from-orange-50 to-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-6">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>Visão</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Ser referência nacional em transporte corporativo, reconhecida pela excelência operacional, inovação tecnológica e compromisso socioambiental.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="h-full border-0 shadow-xl bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>Valores</h3>
                  <ul className="text-gray-700 leading-relaxed space-y-2 text-left">
                    <li>• Segurança em primeiro lugar</li>
                    <li>• Pontualidade e compromisso</li>
                    <li>• Ética e transparência</li>
                    <li>• Inovação contínua</li>
                    <li>• Respeito às pessoas</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>
              Nossa <span className="text-primary">Equipe</span>
            </h2>
            <p className="text-lg text-gray-600">Liderados por profissionais experientes e apaixonados</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="relative h-64 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                    <p className="text-gray-600">{member.role}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{fontFamily: 'Poppins'}}>
              Nossos <span className="text-primary">Diferenciais</span>
            </h2>
            <p className="text-lg text-gray-600">O que nos torna únicos no mercado</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {diferenciais.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl font-bold mb-6" style={{fontFamily: 'Poppins'}}>
              Faça Parte da Nossa História
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Entre em contato e descubra como podemos transformar o transporte da sua empresa
            </p>
            <a href="/#contato" className="inline-block px-8 py-4 bg-white text-primary font-semibold rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              Solicitar Orçamento
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
