/**
 * ClimaRP - Blog & Content Marketing View
 * Displays technical guides, buying tips, and practical articles with high conversion CTAs.
 */
import { BLOG_POSTS } from '../blog-data.js';

export function renderBlogView(postId = null) {
  if (postId) {
    const post = BLOG_POSTS.find(p => p.id === postId);
    if (post) {
      return renderSingleArticle(post);
    }
  }

  return `
    <div class="bg-slate-50 min-h-screen py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span class="text-xs font-bold uppercase tracking-wider text-brand-blue bg-blue-50 px-3 py-1 rounded-full">
            Dicas & Conteúdo
          </span>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy mt-3">
            Guia de Climatização para Ribeirão Preto
          </h1>
          <p class="text-sm sm:text-base text-muted-rp mt-3">
            Artigos práticos sobre economia de energia, dimensionamento de BTUs, manutenção e cuidados com seu ar-condicionado.
          </p>
        </div>

        <!-- Blog Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${BLOG_POSTS.map(article => `
            <article class="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-subtle hover:shadow-card-hover transition-all flex flex-col justify-between">
              
              <div>
                <!-- Top Color Banner -->
                <div class="h-32 bg-gradient-to-r ${article.imageBg} p-5 flex items-end">
                  <span class="bg-white/90 backdrop-blur-sm text-navy text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    ${article.category}
                  </span>
                </div>

                <div class="p-6">
                  <div class="flex items-center gap-3 text-xs text-slate-400 mb-2">
                    <span>${article.date}</span>
                    <span>•</span>
                    <span>${article.readTime} de leitura</span>
                  </div>

                  <h2 class="text-lg font-bold text-navy mb-3 leading-snug hover:text-brand-blue transition-colors">
                    <a href="#/blog/${article.id}">${article.title}</a>
                  </h2>

                  <p class="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    ${article.summary}
                  </p>
                </div>
              </div>

              <div class="px-6 pb-6 pt-2 border-t border-slate-50 flex items-center justify-between">
                <a href="#/blog/${article.id}" class="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1">
                  Ler artigo completo →
                </a>
                <a href="#/formulario" class="text-xs font-medium text-slate-400 hover:text-slate-700">
                  Pedir orçamento
                </a>
              </div>

            </article>
          `).join('')}
        </div>

      </div>
    </div>
  `;
}

function renderSingleArticle(article) {
  return `
    <div class="bg-white min-h-screen py-12 border-b border-slate-100">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Breadcrumbs -->
        <nav class="flex items-center space-x-2 text-xs text-slate-500 mb-8">
          <a href="#/" class="hover:text-brand-blue">Início</a>
          <span>/</span>
          <a href="#/blog" class="hover:text-brand-blue">Blog</a>
          <span>/</span>
          <span class="text-navy font-semibold truncate">${article.title}</span>
        </nav>

        <header class="mb-8">
          <span class="text-xs font-bold uppercase tracking-wider text-brand-blue bg-blue-50 px-3 py-1 rounded-full">
            ${article.category}
          </span>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-navy mt-4 mb-3 leading-tight">
            ${article.title}
          </h1>
          <div class="flex items-center gap-3 text-xs text-slate-400">
            <span>Publicado em ${article.date}</span>
            <span>•</span>
            <span>${article.readTime} de leitura</span>
            <span>•</span>
            <span class="text-brand-blue font-semibold">ClimaRP Ribeirão Preto</span>
          </div>
        </header>

        <div class="h-48 sm:h-64 rounded-2xl bg-gradient-to-r ${article.imageBg} mb-8 flex items-center justify-center text-white shadow-inner p-6 text-center">
          <div class="max-w-md">
            <svg class="w-12 h-12 mx-auto mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p class="font-medium text-sm sm:text-base opacity-90">${article.summary}</p>
          </div>
        </div>

        <div class="prose max-w-none text-slate-700 leading-relaxed text-base sm:text-lg mb-12">
          ${article.content}
        </div>

        <!-- Direct CTA inside Article -->
        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/80 rounded-2xl p-6 sm:p-8 text-center my-12">
          <h3 class="text-xl sm:text-2xl font-bold text-navy mb-2">Precisa de ajuda com seu ar-condicionado em Ribeirão Preto?</h3>
          <p class="text-sm text-slate-600 max-w-xl mx-auto mb-6">
            Solicite um orçamento gratuito e receba propostas de profissionais da região de forma rápida e sem compromisso.
          </p>
          <a href="#/formulario" class="gradient-brand text-white font-bold px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg inline-block text-sm sm:text-base transition-all">
            Solicitar orçamento agora
          </a>
        </div>

        <div class="pt-6 border-t border-slate-200 flex justify-between items-center">
          <a href="#/blog" class="text-sm font-semibold text-brand-blue hover:underline">← Voltar para todos os artigos</a>
          <a href="#/" class="text-sm font-medium text-slate-500 hover:text-slate-800">Ir para a página inicial</a>
        </div>

      </div>
    </div>
  `;
}
