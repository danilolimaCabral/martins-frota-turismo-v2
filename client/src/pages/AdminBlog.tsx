import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { useAuth } from "../_core/hooks/useAuth";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Calendar,
  FileText,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";

/**
 * Interface administrativa de gerenciamento de posts do blog
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

export default function AdminBlog() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<"rascunho" | "publicado" | "arquivado" | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "praias" as any,
    tags: "",
    metaDescription: "",
    metaKeywords: "",
    status: "rascunho" as any,
    featured: false,
  });

  const { data: posts, isLoading, refetch } = trpc.blog.listAll.useQuery({
    status: statusFilter,
    limit: 50,
    offset: 0,
  });

  const { data: stats } = trpc.blog.getStats.useQuery();

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => {
      toast.success("Post criado com sucesso!");
      setDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar post");
    },
  });

  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Post atualizado com sucesso!");
      setDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar post");
    },
  });

  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deletado com sucesso!");
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar post");
    },
  });

  const toggleFeaturedMutation = trpc.blog.toggleFeatured.useMutation({
    onSuccess: (data) => {
      toast.success(data.featured ? "Post destacado!" : "Destaque removido!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao alterar destaque");
    },
  });

  // Verificar autenticação e permissão
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!user || user.role !== "admin") {
    setLocation("/login");
    return null;
  }

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      category: "praias",
      tags: "",
      metaDescription: "",
      metaKeywords: "",
      status: "rascunho",
      featured: false,
    });
    setEditingPost(null);
  };

  const handleOpenDialog = (post?: any) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage || "",
        category: post.category,
        tags: post.tags || "",
        metaDescription: post.metaDescription || "",
        metaKeywords: post.metaKeywords || "",
        status: post.status,
        featured: post.featured,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.slug || !formData.excerpt || !formData.content) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (postToDelete) {
      deleteMutation.mutate({ id: postToDelete });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
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
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Blog</h1>
              <p className="text-gray-600">Crie e gerencie artigos do blog de viagens</p>
            </div>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-gradient-to-r from-blue-600 to-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Post
          </Button>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total de Posts</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-10 h-10 opacity-80" />
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Publicados</p>
                  <p className="text-3xl font-bold">{stats.published}</p>
                </div>
                <Eye className="w-10 h-10 opacity-80" />
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Rascunhos</p>
                  <p className="text-3xl font-bold">{stats.drafts}</p>
                </div>
                <Edit className="w-10 h-10 opacity-80" />
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Visualizações</p>
                  <p className="text-3xl font-bold">{stats.totalViews}</p>
                </div>
                <BarChart3 className="w-10 h-10 opacity-80" />
              </div>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-3 mb-6">
          <Button
            variant={statusFilter === undefined ? "default" : "outline"}
            onClick={() => setStatusFilter(undefined)}
            className={statusFilter === undefined ? "bg-gradient-to-r from-blue-600 to-orange-600" : ""}
          >
            Todos
          </Button>
          <Button
            variant={statusFilter === "publicado" ? "default" : "outline"}
            onClick={() => setStatusFilter("publicado")}
            className={statusFilter === "publicado" ? "bg-gradient-to-r from-blue-600 to-orange-600" : ""}
          >
            Publicados
          </Button>
          <Button
            variant={statusFilter === "rascunho" ? "default" : "outline"}
            onClick={() => setStatusFilter("rascunho")}
            className={statusFilter === "rascunho" ? "bg-gradient-to-r from-blue-600 to-orange-600" : ""}
          >
            Rascunhos
          </Button>
          <Button
            variant={statusFilter === "arquivado" ? "default" : "outline"}
            onClick={() => setStatusFilter("arquivado")}
            className={statusFilter === "arquivado" ? "bg-gradient-to-r from-blue-600 to-orange-600" : ""}
          >
            Arquivados
          </Button>
        </div>

        {/* Lista de Posts */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : posts && posts.posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {post.coverImage && (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      {post.featured && (
                        <div className="absolute top-2 right-2">
                          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                          post.status === "publicado" ? "bg-green-500" :
                          post.status === "rascunho" ? "bg-orange-500" : "bg-gray-500"
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                      <span>{getCategoryIcon(post.category)} {getCategoryLabel(post.category)}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(post)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeaturedMutation.mutate({ id: post.id })}
                      >
                        <Star className={`w-3 h-3 ${post.featured ? "fill-yellow-400 text-yellow-400" : ""}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPostToDelete(post.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Nenhum post encontrado</h3>
            <p className="text-gray-600 mb-6">Comece criando seu primeiro artigo!</p>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-blue-600 to-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Post
            </Button>
          </Card>
        )}
      </div>

      {/* Dialog de Criar/Editar Post */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Editar Post" : "Novo Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (!editingPost) {
                    setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
                  }
                }}
                placeholder="Digite o título do post"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="titulo-do-post"
              />
            </div>
            <div>
              <Label htmlFor="excerpt">Resumo *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Breve descrição do post"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="content">Conteúdo (HTML) *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="<p>Conteúdo do post em HTML...</p>"
                rows={10}
              />
            </div>
            <div>
              <Label htmlFor="coverImage">URL da Imagem de Capa</Label>
              <Input
                id="coverImage"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="publicado">Publicado</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="viagem, turismo, brasil"
              />
            </div>
            <div>
              <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Descrição para motores de busca"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="featured">Destacar este post na home</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-orange-600"
            >
              {editingPost ? "Atualizar" : "Criar"} Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
