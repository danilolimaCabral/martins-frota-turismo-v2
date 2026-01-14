import { db } from './server/db.ts';
import { blogPosts } from './drizzle/schema.ts';

const blogPostsData = [
  {
    title: "Brasil bate recorde histórico com 9,2 milhões de turistas internacionais em 2025",
    slug: "brasil-recorde-turistas-2025",
    excerpt: "O Brasil viveu seu melhor momento no turismo internacional em 2025, registrando 9.287.196 chegadas de turistas estrangeiros, batendo recorde histórico.",
    content: `O Brasil viveu, em 2025, o seu melhor momento no turismo internacional. O país registrou 9.287.196 chegadas de turistas estrangeiros, superando todos os recordes anteriores.

Este crescimento representa uma recuperação significativa do setor de turismo brasileiro após os desafios dos anos anteriores. O aumento de visitantes internacionais reflete a confiança dos viajantes no destino Brasil e a eficácia das estratégias de promoção turística.

**Principais dados:**
- Total de 9,2 milhões de turistas internacionais
- Faturamento recorde de R$ 185 bilhões
- Crescimento em todas as regiões do país
- Aumento na demanda por turismo corporativo e de eventos

O turismo corporativo foi um destaque especial, com o Brasil consolidando sua liderança no segmento de congressos científicos e médicos. As projeções para 2026 reforçam o protagonismo brasileiro na atração de eventos internacionais.`,
    coverImage: "/yWmxRzilxcML.png",
    category: "eventos",
    tags: "turismo,brasil,recorde,2025,estatísticas",
    metaDescription: "Brasil bate recorde com 9,2 milhões de turistas internacionais em 2025",
    metaKeywords: "turismo brasil, turistas internacionais, recorde 2025",
    status: "publicado",
    featured: true,
  },
  {
    title: "Turismo corporativo: tendências e oportunidades para 2026",
    slug: "turismo-corporativo-tendencias-2026",
    excerpt: "Conheça as principais tendências do turismo corporativo para 2026 e como as empresas podem otimizar suas viagens de negócios.",
    content: `O turismo corporativo é um dos segmentos que mais cresce no Brasil. Com a retomada das atividades presenciais e a importância dos eventos de negócios, as empresas investem cada vez mais em viagens corporativas bem planejadas.

**Tendências para 2026:**

1. **Sustentabilidade**: Empresas buscam agências que ofereçam opções sustentáveis de transporte e hospedagem.

2. **Tecnologia**: Plataformas de gestão de viagens ganham espaço, permitindo controle de custos e melhor experiência do viajante.

3. **Flexibilidade**: Após a pandemia, as empresas valorizam maior flexibilidade nos pacotes e agendamentos.

4. **Bem-estar**: Programas que incluem atividades de bem-estar e lazer complementam as viagens de negócios.

5. **Eventos Híbridos**: Congressos e conferências combinam participação presencial e virtual.

As agências especializadas em turismo corporativo estão se posicionando para atender essas novas demandas, oferecendo soluções personalizadas que vão além do simples transporte e hospedagem.`,
    coverImage: "/pbj91fQljFIL.jpg",
    category: "eventos",
    tags: "turismo corporativo,viagens de negócios,2026,tendências",
    metaDescription: "Tendências do turismo corporativo para 2026",
    metaKeywords: "turismo corporativo, viagens de negócios, agências de viagem",
    status: "publicado",
    featured: true,
  },
  {
    title: "Lençóis Maranhenses: o novo destino que conquista o Brasil",
    slug: "lencois-maranhenses-novo-destino",
    excerpt: "Os Lençóis Maranhenses se consolidam como um dos principais destinos turísticos do Brasil, atraindo visitantes de todo o mundo.",
    content: `Os Lençóis Maranhenses, no Maranhão, estão se consolidando como um dos principais destinos turísticos do Brasil. Com suas dunas brancas, lagoas de água doce e paisagens de tirar o fôlego, o local atrai visitantes de todo o mundo.

**O que torna os Lençóis Maranhenses especiais:**

- **Paisagem única**: As dunas brancas contrastam com as lagoas de água cristalina, criando um cenário de beleza incomparável.
- **Biodiversidade**: O parque abriga uma rica fauna e flora, ideal para ecoturismo.
- **Acessibilidade**: Melhorias na infraestrutura facilitam o acesso ao destino.
- **Experiências autênticas**: Passeios a pé, banho nas lagoas e contato com a natureza.

**Melhor época para visitar:**
A melhor época para visitar os Lençóis Maranhenses é de maio a setembro, quando as lagoas estão cheias e as condições climáticas são mais favoráveis.

O destino faz parte da "Rota das Emoções", um roteiro que inclui também o Piauí e o Ceará, oferecendo uma experiência completa de turismo no Nordeste brasileiro.`,
    coverImage: "/nAfpAjR0VxlA.png",
    category: "ecoturismo",
    tags: "lençóis maranhenses,nordeste,ecoturismo,destino turístico",
    metaDescription: "Lençóis Maranhenses: conheça o novo destino que conquista o Brasil",
    metaKeywords: "Lençóis Maranhenses, Maranhão, turismo, ecoturismo",
    status: "publicado",
    featured: true,
  },
  {
    title: "Fernando de Noronha: paraíso tropical imperdível",
    slug: "fernando-de-noronha-paraiso-tropical",
    excerpt: "Fernando de Noronha é um arquipélago único no Brasil, conhecido por suas praias paradisíacas, mergulho e vida marinha exuberante.",
    content: `Fernando de Noronha é um arquipélago localizado a 545 km de Recife, Pernambuco. Declarado Patrimônio Natural da Humanidade pela UNESCO, é um dos destinos mais procurados por turistas que buscam experiências únicas.

**Características principais:**

- **Praias espetaculares**: Com areias douradas e águas cristalinas, as praias de Fernando de Noronha são entre as mais bonitas do Brasil.
- **Mergulho de classe mundial**: A vida marinha é abundante, com peixes coloridos, tartarugas marinhas e até tubarões.
- **Trilhas e caminhadas**: Várias trilhas oferecem vistas panorâmicas do arquipélago.
- **Conservação ambiental**: O local é protegido e há restrições para preservar o ecossistema.

**Dicas importantes:**
- Necessário agendamento prévio para visita
- Melhor época: agosto a dezembro
- Leve protetor solar de alta proteção
- Respeite as regras de preservação ambiental

Fernando de Noronha é ideal para quem busca uma experiência de turismo de natureza autêntica e quer contribuir para a preservação do meio ambiente.`,
    coverImage: "/nHyZXNDzoHEC.jpeg",
    category: "praias",
    tags: "fernando de noronha,pernambuco,praias,mergulho,natureza",
    metaDescription: "Fernando de Noronha: paraíso tropical imperdível",
    metaKeywords: "Fernando de Noronha, Pernambuco, praias, mergulho",
    status: "publicado",
    featured: false,
  },
  {
    title: "Como otimizar custos em viagens corporativas",
    slug: "otimizar-custos-viagens-corporativas",
    excerpt: "Dicas práticas para reduzir custos em viagens corporativas sem comprometer a qualidade e o conforto dos viajantes.",
    content: `As viagens corporativas representam uma despesa significativa para as empresas. Otimizar esses custos é fundamental para melhorar a rentabilidade, sem prejudicar a experiência dos colaboradores.

**Estratégias para reduzir custos:**

1. **Negociar com fornecedores**: Estabeleça parcerias com agências de viagem, companhias aéreas e redes hoteleiras para obter melhores tarifas.

2. **Usar plataformas de gestão**: Ferramentas de gestão de viagens permitem maior controle e visibilidade dos gastos.

3. **Agendar com antecedência**: Compras antecipadas geralmente oferecem melhores preços.

4. **Consolidar viagens**: Agrupar viagens para o mesmo destino reduz custos operacionais.

5. **Estabelecer políticas claras**: Diretrizes sobre hospedagem, transporte e refeições ajudam a controlar gastos.

6. **Considerar viagens virtuais**: Para reuniões que não exigem presença física, videoconferências são mais econômicas.

7. **Analisar dados**: Acompanhar métricas de gasto por viagem ajuda a identificar oportunidades de economia.

**Benefícios da otimização:**
- Redução de 15-25% nos custos de viagem
- Melhor controle orçamentário
- Maior satisfação dos viajantes
- Dados para tomada de decisão

Com as estratégias certas, é possível manter a qualidade das viagens corporativas enquanto reduz significativamente os custos.`,
    coverImage: "/pbj91fQljFIL.jpg",
    category: "eventos",
    tags: "viagens corporativas,custos,otimização,gestão",
    metaDescription: "Como otimizar custos em viagens corporativas",
    metaKeywords: "viagens corporativas, custos, otimização, gestão de viagens",
    status: "publicado",
    featured: false,
  },
];

async function populateBlog() {
  try {
    console.log("Iniciando população do blog...");
    
    for (const post of blogPostsData) {
      await db.insert(blogPosts).values({
        ...post,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✓ Post criado: ${post.title}`);
    }
    
    console.log("✓ Blog populado com sucesso!");
  } catch (error) {
    console.error("Erro ao popular blog:", error);
  }
}

populateBlog();
