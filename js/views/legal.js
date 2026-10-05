/**
 * Clima16 - Legal & LGPD Compliance Views
 * Full transparency documents for Privacy Policy and Terms of Use.
 */
import { CONFIG } from '../config.js';

export function renderPrivacyPolicyView() {
  return `
    <div class="bg-white min-h-screen py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav class="text-xs text-slate-400 mb-6">
          <a href="#/" class="hover:text-brand-blue">Início</a> / <span>Política de Privacidade</span>
        </nav>

        <h1 class="text-3xl sm:text-4xl font-extrabold text-navy mb-4">Política de Privacidade</h1>
        <p class="text-xs text-slate-400 mb-8 font-mono">Última atualização: Março de 2026 • Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</p>

        <div class="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6">
          
          <section>
            <h2 class="text-xl font-bold text-navy mb-2">1. Informações Gerais</h2>
            <p>A presente Política de Privacidade regula o tratamento de dados pessoais coletados pela plataforma <strong>Clima16</strong>, desenvolvida para conectar consumidores interessados em serviços de climatização a profissionais e empresas parceiras que atendem a região de Ribeirão Preto – SP.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-navy mb-2">2. Quais Dados Coletamos</h2>
            <p>Ao utilizar nossos formulários para solicitar um orçamento ou manifestar interesse como parceiro, podemos coletar os seguintes dados:</p>
            <ul class="list-disc pl-6 space-y-1.5 text-slate-600">
              <li><strong>Dados de identificação e contato:</strong> Nome completo, número de WhatsApp/telefone e endereço de e-mail.</li>
              <li><strong>Dados da solicitação do serviço:</strong> Tipo de serviço procurado (instalação, manutenção, limpeza, etc.), tipo de imóvel (casa, apartamento, empresa), posse do equipamento, capacidade em BTUs, bairro de Ribeirão Preto e observações descritivas.</li>
              <li><strong>Dados profissionais (para parceiros cadastrados):</strong> Razão social/nome fantasia, CNPJ (opcional), cidades de atuação e serviços prestados.</li>
              <li><strong>Dados de navegação e técnicos:</strong> Endereço IP aproximado, tipo de dispositivo, navegador, páginas visitadas e parâmetros UTM de origem de campanha.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-navy mb-2">3. Finalidade do Tratamento dos Dados</h2>
            <p>Os dados coletados têm como finalidade precípua:</p>
            <ul class="list-disc pl-6 space-y-1.5 text-slate-600">
              <li>Viabilizar o encaminhamento da solicitação de orçamento a profissionais e empresas de climatização credenciados e atuantes no bairro do solicitante;</li>
              <li>Permitir que os parceiros entrem em contato direto com o usuário para apresentar propostas, sanar dúvidas técnicas e agendar vistorias;</li>
              <li>Aprimorar o funcionamento, a usabilidade e a segurança da plataforma Clima16;</li>
              <li>Cumprir obrigações legais e regulatórias vigentes no ordenamento jurídico brasileiro.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-navy mb-2">4. Compartilhamento de Dados com Parceiros</h2>
            <p>O usuário declara ciência de que o Clima16 é um marketplace intermediador. Para que a cotação aconteça, as informações da solicitação (nome, telefone/WhatsApp, bairro e detalhes do serviço) poderão ser compartilhadas com prestadores de serviços parceiros aptos a prestar o atendimento.</p>
            <p class="mt-2 text-slate-600">Não comercializamos nem transferimos seus dados pessoais para terceiros não relacionados com a finalidade do orçamento solicitado.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-navy mb-2">5. Armazenamento e Segurança</h2>
            <p>Empregamos medidas técnicas e organizacionais compatíveis com os padrões de mercado para proteger as informações contra acessos não autorizados, destruição, perda ou alteração ilícita.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-navy mb-2">6. Direitos do Titular (LGPD)</h2>
            <p>Conforme previsto no Artigo 18 da LGPD, o titular dos dados possui o direito de solicitar a qualquer momento a confirmação da existência de tratamento, o acesso aos dados, a correção de dados incompletos ou a exclusão de seus dados da nossa base.</p>
            <p class="mt-2 text-slate-600">Para exercer seus direitos, entre em contato através do canal de privacidade: <span class="font-mono text-brand-blue">${CONFIG.brand.emailContact}</span>.</p>
          </section>

        </div>

        <div class="mt-12 pt-6 border-t border-slate-200">
          <a href="#/" class="gradient-brand text-white font-bold text-sm px-6 py-3 rounded-xl inline-block shadow">
            ← Voltar para a Página Inicial
          </a>
        </div>

      </div>
    </div>
  `;
}

export function renderTermsView() {
  return `
    <div class="bg-white min-h-screen py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav class="text-xs text-slate-400 mb-6">
          <a href="#/" class="hover:text-brand-blue">Início</a> / <span>Termos de Uso</span>
        </nav>

        <h1 class="text-3xl sm:text-4xl font-extrabold text-navy mb-4">Termos de Uso</h1>
        <p class="text-xs text-slate-400 mb-8 font-mono">Última atualização: Março de 2026</p>

        <div class="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6">
          
          <section>
            <h2 class="text-xl font-bold text-navy mb-2">1. Natureza da Plataforma</h2>
            <p>O <strong>Clima16</strong> é uma plataforma digital de conexão e geração de orçamentos para serviços de ar-condicionado e climatização em Ribeirão Preto – SP. O Clima16 <strong>não executa diretamente os serviços físicos</strong> de instalação, manutenção ou reparos nas dependências do cliente, atuando como facilitador de contato entre clientes e profissionais autônomos ou empresas parceiras.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-navy mb-2">2. Gratuidade para o Consumidor</h2>
            <p>A solicitação de cotações através da plataforma é totalmente gratuita para o solicitante e não gera nenhuma obrigação de contratação.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-navy mb-2">3. Contratação e Responsabilidade</h2>
            <p>A escolha do profissional, a negociação de preços, condições de pagamento, prazos e a execução técnica do serviço contratado são de responsabilidade exclusiva e direta entre o cliente e o profissional/empresa parceira escolhida.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-navy mb-2">4. Conduta do Usuário</h2>
            <p>O usuário compromete-se a fornecer informações verdadeiras e atualizadas nos formulários de solicitação para permitir o correto contato dos prestadores.</p>
          </section>

        </div>

        <div class="mt-12 pt-6 border-t border-slate-200">
          <a href="#/" class="gradient-brand text-white font-bold text-sm px-6 py-3 rounded-xl inline-block shadow">
            ← Voltar para a Página Inicial
          </a>
        </div>

      </div>
    </div>
  `;
}
