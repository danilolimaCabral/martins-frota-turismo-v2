import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { motion } from "framer-motion";
import { Calendar, Eye, Tag, ArrowRight, Filter } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

/**
 * Página pública do blog com listagem de artigos
 */

const categories = [
  { value: "praias", label: "Praias", icon: "🏝️" },
  { value: "montanhas", label: "Montanhas", icon: "⛰️" },
  { value: "cidades-historicas", label: "Cidades Históricas", icon: "🏛️" },
  { value: "ecoturismo", label: "Ecoturismo", icon: "🌴" },
  { value: "cultura", label: "Cultura", icon: "🎭" },
  { value: "gastronomia", label: "Gastronomia", icon: "🍽️" },
  { value: "aventura", label: "Aventura", icon: "🧗" },
  { value: "eventos", label: "Eventos", icon: "🎉" },
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);
  const limit = 12;

  const { data, isLoading } = trpc.blog.list.useQuery({
    category: selectedCategory as any,
    limit,
    offset: page * limit,
  });

  const { data: featuredPosts } = trpc.blog.listFeatured.useQuery();

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getCategoryLabel = (cat: string) => {
    return categories.find((c) => c.value === cat)?.label || cat;
  };

  const getCategoryIcon = (cat: string) => {
    return categories.find((c) => c.value === cat)?.icon || "📝";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Header do Blog */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-orange-600 text-white py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Blog de Viagens
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Descubra os melhores destinos turísticos do Brasil com a Martins Viagens
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-12">
        {/* Posts em Destaque */}
        {featuredPosts && featuredPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              ✨ Artigos em Destaque
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer h-full">
                    {post.coverImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {getCategoryIcon(post.category)} {getCategoryLabel(post.category)}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          <span>{post.views}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filtros por Categoria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-900">Filtrar por Categoria</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedCategory === undefined ? "default" : "outline"}
              onClick={() => {
                setSelectedCategory(undefined);
                setPage(0);
              }}
              className={selectedCategory === undefined ? "bg-gradient-to-r from-blue-600 to-orange-600" : ""}
            >
              Todos
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setPage(0);
                }}
                className={selectedCategory === cat.value ? "bg-gradient-to-r from-blue-600 to-orange-600" : ""}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Grid de Artigos */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-20 bg-gray-200 rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : data && data.posts.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid md:grid-cols-3 gap-8"
            >
              {data.posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col">
                      {post.coverImage && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {getCategoryIcon(post.category)} {getCategoryLabel(post.category)}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3 flex-1">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(post.publishedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>{post.views}</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-orange-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                            Ler mais <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Paginação */}
            {(data.hasMore || page > 0) && (
              <div className="flex justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  ← Anterior
                </Button>
                <span className="flex items-center px-4 text-gray-600">
                  Página {page + 1}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.hasMore}
                >
                  Próxima →
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">
              Nenhum artigo encontrado nesta categoria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
