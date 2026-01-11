import { useRoute, Link } from "wouter";
import { trpc } from "../lib/trpc";
import { motion } from "framer-motion";
import { Calendar, Eye, Tag, ArrowLeft, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

/**
 * Página de artigo individual do blog
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

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";

  const { data: post, isLoading, error } = trpc.blog.getBySlug.useQuery({ slug });

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

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(() => {
        // Fallback: copiar URL
        navigator.clipboard.writeText(window.location.href);
        alert("Link copiado para a área de transferência!");
      });
    } else {
      // Fallback: copiar URL
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
        <div className="container py-12">
          <Card className="max-w-4xl mx-auto animate-pulse">
            <div className="h-96 bg-gray-200" />
            <div className="p-8 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-40 bg-gray-200 rounded" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Artigo não encontrado</h1>
          <p className="text-gray-600 mb-8">
            O artigo que você está procurando não existe ou foi removido.
          </p>
          <Link href="/blog">
            <Button className="bg-gradient-to-r from-blue-600 to-orange-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Header com Imagem de Capa */}
      {post.coverImage && (
        <div className="relative h-[60vh] overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-4">
                  <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {getCategoryIcon(post.category)} {getCategoryLabel(post.category)}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-4xl">
                  {post.title}
                </h1>
                <div className="flex items-center gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span>{post.views} visualizações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Por {post.authorName}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Botões de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-8"
          >
            <Link href="/blog">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Blog
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
          </motion.div>

          {/* Conteúdo do Artigo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 md:p-12">
              {/* Excerpt */}
              <div className="text-xl text-gray-700 font-medium mb-8 pb-8 border-b">
                {post.excerpt}
              </div>

              {/* Conteúdo Principal */}
              <div
                className="prose prose-lg max-w-none
                  prose-headings:text-gray-900 prose-headings:font-bold
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900
                  prose-ul:text-gray-700 prose-ol:text-gray-700
                  prose-img:rounded-lg prose-img:shadow-lg
                  prose-blockquote:border-l-orange-500 prose-blockquote:bg-orange-50 prose-blockquote:p-4"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && (
                <div className="mt-12 pt-8 border-t">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Tag className="w-5 h-5 text-gray-600" />
                    {post.tags.split(",").map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* CTA Final */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-blue-600 to-orange-600 text-white p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Gostou deste destino?
              </h3>
              <p className="text-lg mb-6 text-white/90">
                A Martins Viagens pode levar você até lá com conforto e segurança!
              </p>
              <Link href="/#contato">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Solicitar Orçamento
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
