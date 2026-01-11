import mysql from 'mysql2/promise';

const posts = [
  {
    title: 'Praias de Santa Catarina: Florianópolis, Bombinhas e Balneário Camboriú',
    slug: 'praias-santa-catarina-florianopolis-bombinhas',
    excerpt: 'Descubra as praias mais belas de Santa Catarina: Florianópolis, Bombinhas e Balneário Camboriú. Águas cristalinas e paisagens paradisíacas te esperam!',
    content: '<h2>Santa Catarina: Paraíso das Praias Brasileiras</h2><p>Santa Catarina é um dos estados com as praias mais bonitas do Brasil. Com águas cristalinas, areias brancas e infraestrutura completa, o litoral catarinense atrai milhões de turistas todos os anos.</p><h2>Florianópolis: A Ilha da Magia</h2><p>A capital catarinense possui mais de 40 praias, cada uma com características únicas.</p><h3>Praias do Norte</h3><ul><li><strong>Jurerê Internacional:</strong> Praia badalada com beach clubs e vida noturna</li><li><strong>Canasvieiras:</strong> Águas calmas, ideal para famílias com crianças</li><li><strong>Praia da Daniela:</strong> Tranquila e com ótima infraestrutura</li></ul><h3>Praias do Leste</h3><ul><li><strong>Praia Mole:</strong> Ondas fortes, perfeita para surf</li><li><strong>Joaquina:</strong> Famosa pelas dunas e campeonatos de surf</li><li><strong>Praia Brava:</strong> Ondas grandes e areia branca</li></ul><h3>Praias do Sul</h3><ul><li><strong>Lagoinha do Leste:</strong> Praia selvagem acessível apenas por trilha</li><li><strong>Praia do Campeche:</strong> Extensa faixa de areia e águas claras</li></ul><h2>Bombinhas: Águas Cristalinas</h2><p>Conhecida como a Capital do Mergulho Ecológico, Bombinhas possui 39 praias em apenas 35 km².</p><h3>Principais Praias</h3><ul><li><strong>Praia de Bombinhas:</strong> Centro, com boa infraestrutura</li><li><strong>Praia da Sepultura:</strong> Pequena e perfeita para mergulho</li><li><strong>Quatro Ilhas:</strong> Considerada uma das mais bonitas</li><li><strong>Praia de Mariscal:</strong> Extensa e ótima para surf</li><li><strong>Lagoinha (Trapiche):</strong> Águas calmas e transparentes</li></ul><h2>Balneário Camboriú: A Miami Brasileira</h2><p>Famosa pelos arranha-céus à beira-mar, Balneário Camboriú oferece muito mais que praia.</p><h3>Atrações</h3><ul><li><strong>Parque Unipraias:</strong> Bondinhos aéreos conectando praias</li><li><strong>Praia Central:</strong> 7 km de extensão com calçadão</li><li><strong>Praia das Laranjeiras:</strong> Acessível por bondinho ou barco</li><li><strong>Passeio de Barco Pirata:</strong> Diversão para toda a família</li><li><strong>Oceanic Aquarium:</strong> Maior aquário temático da América do Sul</li></ul><h2>Quando Visitar</h2><p>Alta temporada (dezembro a março): praias cheias, clima quente, preços mais altos. Baixa temporada (abril a novembro): menos movimento, preços melhores, clima mais ameno.</p><h2>Dicas Importantes</h2><ul><li>Reserve hospedagem com antecedência na alta temporada</li><li>Use protetor solar e hidrate-se</li><li>Respeite as bandeiras de segurança nas praias</li><li>Experimente a gastronomia local: frutos do mar frescos</li></ul>',
    coverImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
    category: 'praias',
    tags: 'Santa Catarina,Florianópolis,Bombinhas,Balneário Camboriú,Praias',
    authorId: 1,
    authorName: 'Martins Turismo',
    status: 'publicado',
    featured: 1,
    views: 0,
    metaDescription: 'Descubra as melhores praias de Santa Catarina: Florianópolis, Bombinhas e Balneário Camboriú. Guia completo com dicas e atrações!',
    metaKeywords: 'praias santa catarina, florianópolis, bombinhas, balneário camboriú'
  },
  {
    title: 'Aparecida SP: Guia Completo do Santuário Nacional de Nossa Senhora',
    slug: 'aparecida-sp-santuario-nacional-nossa-senhora',
    excerpt: 'Conheça Aparecida, a cidade da Padroeira do Brasil. Guia completo do Santuário Nacional, atrações religiosas e turísticas.',
    content: '<h2>Aparecida: A Capital da Fé</h2><p>Aparecida é um dos principais destinos de turismo religioso do Brasil, recebendo milhões de peregrinos todos os anos. A cidade abriga o <strong>Santuário Nacional de Nossa Senhora Aparecida</strong>, a segunda maior igreja católica do mundo.</p><h2>Santuário Nacional</h2><p>A Basílica de Nossa Senhora Aparecida tem capacidade para 75 mil pessoas e é o coração espiritual do Brasil.</p><h3>Horários de Missas</h3><p>Missas diárias em diversos horários, incluindo:</p><ul><li>Segunda a sexta: 6h45, 9h, 10h30, 12h, 16h, 18h</li><li>Sábado: 6h, 9h, 10h30, 12h, 16h, 18h, 20h</li><li>Domingo: 5h30, 8h, 10h, 12h, 14h, 16h, 18h</li></ul><h2>Circuito de Visitação</h2><h3>Mirante da Torre</h3><p>Vista panorâmica de 360° da cidade e do Vale do Paraíba a 100 metros de altura.</p><h3>Museu Nossa Senhora Aparecida</h3><p>Mais de 3 mil peças que contam a história da devoção à Padroeira do Brasil.</p><h3>Sala das Promessas</h3><p>Espaço emocionante com milhares de ex-votos deixados pelos fiéis.</p><h3>Circuito da Cúpula</h3><p>Conheça a estrutura da cúpula central da Basílica por dentro.</p><h3>Caminho do Rosário</h3><p>Percurso de meditação com os mistérios do Rosário.</p><h2>Outras Atrações</h2><h3>Basílica Velha (Matriz)</h3><p>Igreja histórica onde a imagem de Nossa Senhora foi encontrada em 1717.</p><h3>Passarela da Fé</h3><p>Ponte coberta que liga a Basílica Velha ao Santuário Nacional.</p><h3>Morro do Presépio</h3><p>Representações em tamanho real da vida de Jesus.</p><h3>Porto Itaguaçu</h3><p>Passeios de barco pelo Rio Paraíba do Sul.</p><h3>Teleférico</h3><p>Vista aérea da cidade e do Santuário.</p><h3>Aquário de Aparecida</h3><p>Mais de 3 mil animais marinhos e de água doce.</p><h2>Eventos Especiais</h2><ul><li><strong>12 de outubro:</strong> Dia de Nossa Senhora Aparecida - maior celebração do ano</li><li><strong>Romarias:</strong> Durante todo o ano, grupos de todo o Brasil</li></ul><h2>Dicas para sua Visita</h2><ul><li>Use roupas confortáveis e adequadas para ambiente religioso</li><li>Leve água e protetor solar</li><li>Reserve pelo menos 1 dia inteiro para conhecer tudo</li><li>Evite o dia 12 de outubro se não quiser multidões</li><li>Estacionamento gratuito disponível</li></ul><h2>Como Chegar</h2><p>Aparecida fica no Vale do Paraíba, entre São Paulo (170 km) e Rio de Janeiro (240 km), com fácil acesso pela Via Dutra (BR-116).</p>',
    coverImage: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200',
    category: 'cultura',
    tags: 'Aparecida,São Paulo,Santuário,Turismo Religioso,Nossa Senhora',
    authorId: 1,
    authorName: 'Martins Turismo',
    status: 'publicado',
    featured: 1,
    views: 0,
    metaDescription: 'Guia completo de Aparecida SP: Santuário Nacional, atrações, missas, circuito de visitação e dicas para sua peregrinação.',
    metaKeywords: 'aparecida, santuário nacional, nossa senhora aparecida, turismo religioso'
  },
  {
    title: 'Cidades Históricas de Minas Gerais: Ouro Preto, Tiradentes e Mariana',
    slug: 'cidades-historicas-minas-gerais-ouro-preto-tiradentes',
    excerpt: 'Viaje no tempo pelas cidades históricas de Minas Gerais: Ouro Preto, Tiradentes e Mariana. Patrimônio cultural, arquitetura colonial e muita história.',
    content: '<h2>O Tesouro Colonial de Minas Gerais</h2><p>As cidades históricas de Minas Gerais são verdadeiros museus a céu aberto, preservando a arquitetura e a cultura do período colonial brasileiro. Patrimônios da humanidade pela UNESCO, essas cidades encantam pela beleza e riqueza histórica.</p><h2>Ouro Preto: Joia do Barroco</h2><p>Fundada no início do século XVIII durante o Ciclo do Ouro, Ouro Preto é considerada uma das mais belas cidades coloniais do mundo.</p><h3>Principais Atrações</h3><ul><li><strong>Igreja de São Francisco de Assis:</strong> Obra-prima de Aleijadinho com pinturas de Mestre Athayde</li><li><strong>Basílica de Nossa Senhora do Pilar:</strong> Interior ricamente decorado com mais de 400 kg de ouro</li><li><strong>Museu da Inconfidência:</strong> História da Inconfidência Mineira</li><li><strong>Mina da Passagem:</strong> Antiga mina de ouro aberta à visitação</li><li><strong>Praça Tiradentes:</strong> Coração histórico da cidade</li></ul><h3>Passeios Imperdíveis</h3><ul><li>Tour de jardineira pelas ladeiras históricas</li><li>Visita às igrejas barrocas</li><li>Degustação de cachaças artesanais</li><li>Gastronomia mineira tradicional</li></ul><h2>Tiradentes: Charme Colonial</h2><p>Pequena e charmosa, Tiradentes preserva a atmosfera colonial com ruas de pedra, casarões coloridos e igrejas históricas.</p><h3>Principais Atrações</h3><ul><li><strong>Igreja Matriz de Santo Antônio:</strong> Uma das mais ricas igrejas do Brasil</li><li><strong>Passeio de Maria Fumaça:</strong> Trem histórico até São João del-Rei</li><li><strong>Museu de Sant\'Ana:</strong> Maior coleção de imagens de Sant\'Ana do mundo</li><li><strong>Centro Histórico:</strong> Ruas de pedra e casarões coloniais</li><li><strong>Serra de São José:</strong> Trilhas e natureza</li></ul><h3>Gastronomia</h3><p>Tiradentes é famosa pela alta gastronomia mineira. Não deixe de experimentar:</p><ul><li>Restaurantes premiados no centro histórico</li><li>Doces e queijos artesanais</li><li>Cachaças de alambique</li></ul><h2>Mariana: A Primaz de Minas</h2><p>Primeira vila, cidade e capital de Minas Gerais, Mariana é conhecida como a Primaz de Minas.</p><h3>Principais Atrações</h3><ul><li><strong>Catedral Basílica da Sé:</strong> Órgão alemão do século XVIII ainda em funcionamento</li><li><strong>Igreja de São Francisco de Assis:</strong> Pinturas de Mestre Athayde</li><li><strong>Mina da Passagem:</strong> Compartilhada com Ouro Preto</li><li><strong>Centro Histórico:</strong> Casarões e igrejas coloniais</li><li><strong>Museu Arquidiocesano:</strong> Arte sacra colonial</li></ul><h2>Roteiro Sugerido</h2><p><strong>Dia 1:</strong> Ouro Preto (igrejas, museus, centro histórico)<br><strong>Dia 2:</strong> Mariana e Mina da Passagem<br><strong>Dia 3:</strong> Tiradentes e passeio de Maria Fumaça</p><h2>Quando Visitar</h2><ul><li><strong>Semana Santa:</strong> Celebrações tradicionais e tapetes de serragem</li><li><strong>Carnaval:</strong> Blocos tradicionais em Ouro Preto</li><li><strong>Inverno (junho-agosto):</strong> Clima ameno e festivais gastronômicos</li></ul><h2>Dicas Importantes</h2><ul><li>Use sapatos confortáveis (muitas ladeiras e ruas de pedra)</li><li>Reserve hospedagem com antecedência em feriados</li><li>Contrate guias locais para conhecer a história</li><li>Experimente a comida mineira tradicional</li><li>Leve agasalho (clima de montanha)</li></ul>',
    coverImage: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200',
    category: 'cidades-historicas',
    tags: 'Minas Gerais,Ouro Preto,Tiradentes,Mariana,Cidades Históricas',
    authorId: 1,
    authorName: 'Martins Turismo',
    status: 'publicado',
    featured: 1,
    views: 0,
    metaDescription: 'Guia completo das cidades históricas de Minas Gerais: Ouro Preto, Tiradentes e Mariana. Patrimônio UNESCO, igrejas barrocas e cultura.',
    metaKeywords: 'cidades históricas minas gerais, ouro preto, tiradentes, mariana'
  },
  {
    title: 'Fernando de Noronha: Paraíso Brasileiro com Praias Paradisíacas',
    slug: 'fernando-de-noronha-paraiso-brasileiro-praias',
    excerpt: 'Descubra Fernando de Noronha, o arquipélago mais bonito do Brasil. Praias paradisíacas, mergulho com tartarugas e natureza preservada.',
    content: '<h2>Fernando de Noronha: O Paraíso Brasileiro</h2><p>Fernando de Noronha é um arquipélago vulcânico localizado a 545 km da costa nordestina. Considerado um dos destinos mais bonitos do mundo, o arquipélago encanta por suas praias de águas cristalinas, vida marinha abundante e natureza preservada.</p><h2>Praias Imperdíveis</h2><h3>Baía do Sancho</h3><p>Eleita diversas vezes como a praia mais bonita do mundo. Acesso por escadaria entre rochas, águas cristalinas e areia branca.</p><h3>Baía dos Porcos</h3><p>Piscinas naturais, formações rochosas e vista para o Morro Dois Irmãos.</p><h3>Praia do Leão</h3><p>Local de desova de tartarugas marinhas, ondas fortes e paisagem selvagem.</p><h3>Praia da Conceição</h3><p>Próxima à vila, ótima para assistir ao pôr do sol.</p><h2>Atividades Imperdíveis</h2><ul><li><strong>Mergulho e Snorkel:</strong> Visibilidade de até 50 metros</li><li><strong>Trilhas:</strong> Atalaia, Capim-Açu, Costa Esmeralda</li><li><strong>Passeio de Barco:</strong> Volta à ilha com paradas para mergulho</li><li><strong>Observação de Golfinhos:</strong> Baía dos Golfinhos ao amanhecer</li><li><strong>Pôr do Sol no Forte:</strong> Vista espetacular</li></ul><h2>Informações Práticas</h2><h3>Taxa de Preservação</h3><p>Obrigatória para todos os visitantes, valor diário baseado no tempo de permanência.</p><h3>Limite de Visitantes</h3><p>Número controlado para preservação ambiental. Reserve com antecedência!</p><h3>Melhor Época</h3><ul><li><strong>Agosto a fevereiro:</strong> Mar calmo, ideal para mergulho</li><li><strong>Março a julho:</strong> Ondas maiores, surf, menos turistas</li></ul><h3>Como Chegar</h3><p>Voos diários saindo de Recife (PE) e Natal (RN). Duração aproximada: 1 hora.</p><h2>Dicas Importantes</h2><ul><li>Reserve hospedagem e passeios com meses de antecedência</li><li>Leve protetor solar biodegradável</li><li>Respeite as regras ambientais</li><li>Não alimente os animais</li><li>Leve dinheiro em espécie (poucos lugares aceitam cartão)</li></ul>',
    coverImage: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200',
    category: 'praias',
    tags: 'Fernando de Noronha,Pernambuco,Praias,Mergulho,Ecoturismo',
    authorId: 1,
    authorName: 'Martins Turismo',
    status: 'publicado',
    featured: 0,
    views: 0,
    metaDescription: 'Tudo sobre Fernando de Noronha: praias, mergulho, trilhas, taxas e dicas para aproveitar o arquipélago mais bonito do Brasil.',
    metaKeywords: 'fernando de noronha, praias brasil, mergulho, pernambuco'
  },
  {
    title: 'Foz do Iguaçu: As Cataratas Mais Impressionantes do Mundo',
    slug: 'foz-do-iguacu-cataratas-impressionantes',
    excerpt: 'Conheça Foz do Iguaçu e as Cataratas do Iguaçu, uma das Sete Maravilhas Naturais do Mundo. Guia completo com atrações e dicas.',
    content: '<h2>Foz do Iguaçu: Espetáculo da Natureza</h2><p>Foz do Iguaçu abriga uma das paisagens mais impressionantes do planeta: as Cataratas do Iguaçu, eleitas uma das Sete Maravilhas Naturais do Mundo. Com 275 quedas d\'água, o espetáculo natural atrai visitantes do mundo inteiro.</p><h2>Cataratas do Iguaçu</h2><h3>Lado Brasileiro</h3><p>Vista panorâmica das cataratas, com passarelas que levam até a Garganta do Diabo. Melhor para fotos e visão geral do conjunto.</p><h3>Lado Argentino</h3><p>Contato mais próximo com as quedas, com trilhas e passarelas sobre o rio. Mais tempo de visitação (dia inteiro).</p><h3>Garganta do Diabo</h3><p>A maior e mais impressionante queda d\'água, com 80 metros de altura. Imperdível!</p><h2>Outras Atrações</h2><h3>Parque das Aves</h3><p>Maior parque de aves da América Latina, com mais de 1.400 aves de 150 espécies diferentes.</p><h3>Usina de Itaipu</h3><p>Segunda maior hidrelétrica do mundo. Tour guiado mostra a grandiosidade da construção.</p><h3>Marco das Três Fronteiras</h3><p>Ponto de encontro entre Brasil, Argentina e Paraguai.</p><h3>Compras no Paraguai</h3><p>Cidade del Este oferece produtos eletrônicos e importados.</p><h2>Passeios de Aventura</h2><ul><li><strong>Macuco Safari:</strong> Passeio de barco até as cataratas</li><li><strong>Rapel e Arvorismo:</strong> Aventura na mata atlântica</li><li><strong>Helicóptero:</strong> Vista aérea das cataratas</li></ul><h2>Quando Visitar</h2><ul><li><strong>Primavera/Verão (outubro a março):</strong> Mais volume de água, clima quente</li><li><strong>Outono/Inverno (abril a setembro):</strong> Menos turistas, clima ameno</li></ul><h2>Dicas Importantes</h2><ul><li>Reserve pelo menos 2-3 dias para conhecer tudo</li><li>Leve capa de chuva (você vai se molhar!)</li><li>Use calçados confortáveis e antiderrapantes</li><li>Compre ingressos antecipados online</li><li>Visite os dois lados (Brasil e Argentina)</li><li>Leve documento com foto para cruzar a fronteira</li></ul><h2>Como Chegar</h2><p>Aeroporto Internacional de Foz do Iguaçu com voos diretos das principais capitais brasileiras.</p>',
    coverImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200',
    category: 'ecoturismo',
    tags: 'Foz do Iguaçu,Paraná,Cataratas,Itaipu,Turismo',
    authorId: 1,
    authorName: 'Martins Turismo',
    status: 'publicado',
    featured: 0,
    views: 0,
    metaDescription: 'Guia completo de Foz do Iguaçu: Cataratas, Itaipu, Parque das Aves e todas as atrações. Planeje sua viagem!',
    metaKeywords: 'foz do iguaçu, cataratas, itaipu, paraná, turismo'
  },
  {
    title: 'Bonito MS: Ecoturismo e Águas Cristalinas no Mato Grosso do Sul',
    slug: 'bonito-ms-ecoturismo-aguas-cristalinas',
    excerpt: 'Descubra Bonito MS, o paraíso do ecoturismo brasileiro. Rios cristalinos, grutas, cachoeiras e mergulho com peixes coloridos.',
    content: '<h2>Bonito: Capital do Ecoturismo</h2><p>Bonito, no Mato Grosso do Sul, é considerado um dos melhores destinos de ecoturismo do Brasil. Com rios de águas cristalinas, grutas impressionantes e natureza preservada, a cidade oferece experiências únicas de contato com a natureza.</p><h2>Principais Atrações</h2><h3>Flutuação no Rio da Prata</h3><p>Mergulho de snorkel em rio com visibilidade de até 50 metros. Peixes coloridos, plantas aquáticas e nascentes.</p><h3>Gruta do Lago Azul</h3><p>Caverna com lago subterrâneo de água azul-turquesa. Patrimônio Natural da Humanidade pela UNESCO.</p><h3>Abismo Anhumas</h3><p>Descida de rapel de 72 metros até caverna com lago cristalino. Experiência radical!</p><h3>Cachoeiras</h3><ul><li><strong>Cachoeira do Rio do Peixe:</strong> Várias quedas em sequência</li><li><strong>Boca da Onça:</strong> Maior cachoeira de MS com 156 metros</li><li><strong>Estância Mimosa:</strong> 8 cachoeiras em propriedade particular</li></ul><h3>Aquário Natural</h3><p>Flutuação em nascente com centenas de peixes coloridos.</p><h3>Buraco das Araras</h3><p>Dolina gigante com 160 metros de diâmetro, habitat de araras vermelhas.</p><h2>Atividades</h2><ul><li><strong>Flutuação:</strong> Snorkel em rios cristalinos</li><li><strong>Mergulho:</strong> Com cilindro em lagos e rios</li><li><strong>Trilhas:</strong> Ecológicas pela mata</li><li><strong>Rapel:</strong> Em cachoeiras e cavernas</li><li><strong>Observação de Fauna:</strong> Aves, capivaras, quatis</li></ul><h2>Quando Visitar</h2><ul><li><strong>Melhor época:</strong> Maio a setembro (seca, águas mais claras)</li><li><strong>Evitar:</strong> Janeiro a março (chuvas, águas turvas)</li></ul><h2>Informações Importantes</h2><ul><li>Todos os passeios exigem agendamento prévio</li><li>Número de visitantes limitado por dia (preservação)</li><li>Obrigatório contratar agências credenciadas</li><li>Reserve com antecedência (alta procura)</li><li>Use protetor solar biodegradável</li></ul><h2>Dicas</h2><ul><li>Planeje pelo menos 4-5 dias</li><li>Leve roupa de banho, toalha e chinelo</li><li>Câmera à prova d\'água para registrar</li><li>Respeite as regras ambientais</li><li>Experimente a culinária local (peixes de rio)</li></ul><h2>Como Chegar</h2><p>Aeroporto mais próximo: Campo Grande (300 km). Transfer ou carro alugado até Bonito.</p>',
    coverImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
    category: 'ecoturismo',
    tags: 'Bonito,Mato Grosso do Sul,Ecoturismo,Flutuação,Grutas',
    authorId: 1,
    authorName: 'Martins Turismo',
    status: 'publicado',
    featured: 0,
    views: 0,
    metaDescription: 'Guia completo de Bonito MS: flutuação, grutas, cachoeiras e ecoturismo. Tudo para planejar sua viagem!',
    metaKeywords: 'bonito ms, ecoturismo, flutuação, gruta lago azul, mato grosso do sul'
  }
];

const connection = await mysql.createConnection(process.env.DATABASE_URL);

for (const post of posts) {
  await connection.execute(
    `INSERT INTO blogPosts (title, slug, excerpt, content, coverImage, category, tags, authorId, authorName, status, publishedAt, featured, views, metaDescription, metaKeywords, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, NOW(), NOW())`,
    [post.title, post.slug, post.excerpt, post.content, post.coverImage, post.category, post.tags, post.authorId, post.authorName, post.status, post.featured, post.views, post.metaDescription, post.metaKeywords]
  );
  console.log(`✅ Inserido: ${post.title}`);
}

console.log('\n✅ Todos os posts foram inseridos com sucesso!');
await connection.end();
