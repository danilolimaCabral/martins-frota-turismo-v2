import mysql from 'mysql2/promise';

const posts = [
  {
    title: 'Gramado RS: Natal Luz e os Melhores Parques Temáticos',
    slug: 'gramado-rs-natal-luz-parques-tematicos',
    excerpt: 'Descubra Gramado, a cidade que abriga o maior espetáculo natalino do Brasil e parques temáticos incríveis para toda a família.',
    content: '<h2>O Encanto de Gramado</h2><p>Localizada na Serra Gaúcha, Gramado é um dos destinos turísticos mais procurados do Brasil. Com arquitetura europeia, clima de montanha e atrações para todas as idades, a cidade encanta visitantes o ano todo.</p><h2>Natal Luz: O Maior Espetáculo Natalino do Brasil</h2><p>O <strong>Natal Luz de Gramado</strong> celebra em 2025 sua 40ª edição, consolidando-se como o maior espetáculo natalino da América Latina. De 23 de outubro de 2025 a 18 de janeiro de 2026, a cidade se transforma em um verdadeiro conto de fadas iluminado.</p><h3>Espetáculos Principais</h3><ul><li><strong>Nativitaten:</strong> Musical emocionante sobre o nascimento de Jesus</li><li><strong>O Grande Desfile de Natal:</strong> Carros alegóricos e personagens mágicos</li><li><strong>Illusion Show:</strong> Espetáculo de ilusionismo com Henry & Klauss</li></ul><h3>Atrações Gratuitas</h3><ul><li><strong>Acendimento das Luzes:</strong> Momento mágico em que toda a cidade se ilumina</li><li><strong>Caminho de Luzes:</strong> Percurso iluminado pela cidade</li><li><strong>Casa do Papai Noel:</strong> Encontro com o Bom Velhinho</li><li><strong>Embaixadores da Magia:</strong> Personagens natalinos pelas ruas</li></ul><h2>Parques Temáticos Imperdíveis</h2><h3>Mini Mundo</h3><p>Réplicas em miniatura de construções famosas do mundo todo. Um passeio encantador para todas as idades.</p><h3>Snowland</h3><p>O único parque de neve indoor do Brasil! Experimente neve de verdade, esqui, snowboard e muito mais.</p><h3>Acquamotion</h3><p>Parque aquático com toboáguas, piscinas aquecidas e atrações radicais.</p><h3>Vila da Mônica</h3><p>Parque temático da Turma da Mônica com brinquedos e personagens queridos.</p><h2>Outros Pontos Turísticos</h2><ul><li><strong>Lago Negro:</strong> Lago cercado por pinheiros com pedalinhos</li><li><strong>Igreja Matriz São Pedro:</strong> Bela igreja em estilo gótico</li><li><strong>Rua Coberta:</strong> Espaço para compras e gastronomia</li><li><strong>Le Jardin Parque de Lavanda:</strong> Campos de lavanda e jardins temáticos</li></ul><h2>Gastronomia</h2><p>Não deixe de experimentar os chocolates artesanais, fondues, cucas alemãs e a culinária típica da região.</p><h2>Quando Visitar</h2><p>Gramado é encantadora o ano todo, mas o período do Natal Luz (outubro a janeiro) é especialmente mágico. O inverno (junho a agosto) oferece clima frio e aconchegante.</p>',
    coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200',
    category: 'montanhas',
    tags: 'Gramado,Rio Grande do Sul,Natal Luz,Parques Temáticos,Serra Gaúcha',
    authorId: 1,
    authorName: 'Martins Turismo',
    status: 'publicado',
    featured: 1,
    views: 0,
    metaDescription: 'Descubra Gramado RS: o maior espetáculo natalino do Brasil, parques temáticos incríveis e atrações para toda a família. Planeje sua viagem!',
    metaKeywords: 'gramado, natal luz, parques temáticos, serra gaúcha, turismo gramado'
  },
  {
    title: 'Beto Carrero World: O Maior Parque Temático da América Latina',
    slug: 'beto-carrero-world-maior-parque-america-latina',
    excerpt: 'Conheça o Beto Carrero World, o maior parque temático da América Latina, com mais de 100 atrações para toda a família em Penha, Santa Catarina.',
    content: '<h2>Beto Carrero World: Diversão Sem Limites</h2><p>Localizado em Penha, Santa Catarina, o <strong>Beto Carrero World</strong> é o maior parque temático da América Latina, com mais de 100 atrações distribuídas em uma área de 14 km².</p><h2>Áreas Temáticas</h2><p>O parque é dividido em 9 áreas temáticas, cada uma com atrações únicas:</p><ul><li><strong>Mundo Animal:</strong> Shows com animais e apresentações educativas</li><li><strong>Aventura Radical:</strong> Montanhas-russas e brinquedos radicais</li><li><strong>Vila Germânica:</strong> Arquitetura alemã e gastronomia típica</li><li><strong>Velho Oeste:</strong> Cenários de faroeste e shows de cowboys</li><li><strong>Ilha dos Piratas:</strong> Aventuras piratas e shows aquáticos</li><li><strong>Avenida das Nações:</strong> Representação de diferentes países</li><li><strong>Terra da Fantasia:</strong> Brinquedos para crianças</li><li><strong>Madagascar:</strong> Área temática dos personagens do filme</li><li><strong>Hot Wheels:</strong> Única área temática Hot Wheels do mundo!</li></ul><h2>Atrações Imperdíveis</h2><h3>FireWhip</h3><p>A montanha-russa mais radical do parque, com loopings invertidos e muita adrenalina!</p><h3>Star Mountain</h3><p>Uma das maiores montanhas-russas da América Latina, com queda inicial de 35 metros.</p><h3>Big Tower</h3><p>Torre de queda livre com 100 metros de altura e vista panorâmica do parque.</p><h3>Shows e Apresentações</h3><ul><li><strong>Show do Beto Carrero:</strong> Apresentação com o personagem principal</li><li><strong>Show de Aves:</strong> Demonstração com aves exóticas</li><li><strong>Motocross Freestyle:</strong> Manobras radicais de motocross</li><li><strong>Show Pirata:</strong> Espetáculo com acrobacias e efeitos especiais</li></ul><h2>Dicas para sua Visita</h2><ul><li>Chegue cedo para aproveitar todas as atrações</li><li>Use o aplicativo do parque para ver filas em tempo real</li><li>Leve protetor solar e boné</li><li>Planeje pelo menos 1 dia inteiro de visita</li><li>Compre ingressos antecipados online para economizar</li></ul><h2>Como Chegar</h2><p>O Beto Carrero World fica em Penha, SC, a cerca de 35 km de Balneário Camboriú e 110 km de Florianópolis. O parque oferece estacionamento amplo e fácil acesso pela BR-101.</p><h2>Quando Visitar</h2><p>O parque funciona todos os dias do ano. Evite feriados e alta temporada (dezembro a fevereiro) se quiser pegar menos filas.</p>',
    coverImage: 'https://images.unsplash.com/photo-1594818379496-da1e345b0ded?w=1200',
    category: 'aventura',
    tags: 'Beto Carrero,Santa Catarina,Parque Temático,Penha,Montanha-Russa',
    authorId: 1,
    authorName: 'Martins Turismo',
    status: 'publicado',
    featured: 1,
    views: 0,
    metaDescription: 'Tudo sobre o Beto Carrero World: atrações, shows, dicas e como aproveitar o maior parque temático da América Latina em Penha, SC.',
    metaKeywords: 'beto carrero, parque temático, santa catarina, penha, montanha-russa'
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
