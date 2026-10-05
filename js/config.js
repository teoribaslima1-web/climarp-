/**
 * ClimaRP - Global Configuration
 * Centralized settings for easy customization without touching application logic.
 */
export const CONFIG = {
  brand: {
    name: 'ClimaRP',
    tagline: 'Ar-condicionado em Ribeirão Preto sem complicação',
    description: 'Encontre profissionais para instalação, manutenção, limpeza e serviços de ar-condicionado em Ribeirão Preto de forma simples e rápida.',
    city: 'Ribeirão Preto',
    state: 'SP',
    fullLocation: 'Ribeirão Preto – SP',
    emailContact: 'contato@climarp.com.br',
    whatsappNumber: '5516981570034',
    whatsappFormatted: '(16) 98157-0034',
    whatsappDefaultMessage: 'Olá! Encontrei o ClimaRP e gostaria de solicitar um orçamento para ar-condicionado.'
  },

  analytics: {
    enabled: true,
    gtmId: 'GTM-XXXXXXX', // [PLACEHOLDER GTM ID]
    ga4Id: 'G-XXXXXXXXXX', // [PLACEHOLDER GA4 ID]
    metaPixelId: 'XXXXXXXXXXXXXXX' // [PLACEHOLDER Meta Pixel ID]
  },

  services: [
    {
      id: 'instalacao',
      slug: 'instalacao-ar-condicionado-ribeirao-preto',
      name: 'Instalação de ar-condicionado',
      shortTitle: 'Instalação',
      description: 'Instalação de aparelhos Split e outros sistemas residenciais ou comerciais com fixação e conexões adequadas.',
      icon: 'wrench',
      popular: true,
      situations: [
        'Comprou um aparelho novo e precisa de instalação profissional',
        'Mudança de imóvel necessitando desinstalação e nova fixação',
        'Instalação em apartamentos com regras de condomínio e tubulação pré-existente',
        'Adequação de capacidade para escritórios, clínicas e pontos comerciais'
      ],
      equipmentTypes: [
        'Split Hi-Wall (Inverter e Convencional)',
        'Multi Split residencial',
        'Cassete e Piso Teto para comércios e empresas',
        'Aparelhos de 9.000 a 30.000+ BTUs'
      ],
      faqs: [
        {
          q: 'O que inclui a instalação de ar-condicionado?',
          a: 'Geralmente contempla a fixação da unidade evaporadora (interna), condensadora (externa), tubulação frigorífica, isolamento térmico, fiação de interligação e testes de vedação e funcionamento.'
        },
        {
          q: 'Como sei a potência ideal em BTUs para o meu cômodo?',
          a: 'Em média, quartos pequenos (até 12m²) costumam usar 9.000 BTUs. Salas e ambientes com incidência solar direta geralmente pedem 12.000 a 18.000 BTUs. O técnico parceiro pode avaliar o local exato.'
        }
      ]
    },
    {
      id: 'manutencao',
      slug: 'manutencao-ar-condicionado-ribeirao-preto',
      name: 'Manutenção de ar-condicionado',
      shortTitle: 'Manutenção',
      description: 'Diagnóstico e manutenção para equipamentos apresentando falhas, ruídos estranhos ou baixo desempenho.',
      icon: 'settings',
      popular: true,
      situations: [
        'Aparelho fazendo barulho anormal ou vibrando excessivamente',
        'Equipamento desarmando disjuntor ou desligando sozinho',
        'Luzes piscando na unidade interna indicando código de erro',
        'Manutenção preventiva periódica para prolongar a vida útil'
      ],
      equipmentTypes: [
        'Modelos Inverter de todas as marcas',
        'Sistemas convencionais On/Off',
        'Condensadoras residenciais e comerciais'
      ],
      faqs: [
        {
          q: 'Com que frequência devo fazer manutenção preventiva?',
          a: 'Para residências, uma revisão semestral ou anual é indicada. Em comércios e clínicas com uso contínuo, recomenda-se inspeção trimestral.'
        },
        {
          q: 'O que fazer se meu ar-condicionado apresentar código de erro?',
          a: 'Desligue o aparelho na tomada ou disjuntor e solicite um orçamento pelo ClimaRP para que um técnico realize a leitura técnica correta da placa.'
        }
      ]
    },
    {
      id: 'limpeza',
      slug: 'limpeza-ar-condicionado-ribeirao-preto',
      name: 'Limpeza e higienização',
      shortTitle: 'Limpeza / Higienização',
      description: 'Serviços especializados para remoção de poeira, fungos, bactérias e sujeira acumuladas no equipamento.',
      icon: 'sparkles',
      popular: true,
      situations: [
        'Mau cheiro ao ligar o ar-condicionado',
        'Alergias respiratórias e espirros frequentes no ambiente',
        'Filtros e serpentina visivelmente sujos ou obstruídos',
        'Redução perceptível na força da ventilação'
      ],
      equipmentTypes: [
        'Higienização completa da turbina e serpentina',
        'Aplicação de bactericidas biodegradáveis próprios para climatização',
        'Limpeza das bandejas de dreno'
      ],
      faqs: [
        {
          q: 'Limpar apenas o filtro de tela é suficiente?',
          a: 'A limpeza do filtro é essencial e pode ser feita pelo morador mensalmente. Porém, fungos e ácaros se alojam na turbina interna e na serpentina, exigindo higienização profunda periódica.'
        },
        {
          q: 'A higienização ajuda a economizar energia elétrica?',
          a: 'Sim. Quando os canais de ar estão desobstruídos, o motor trabalha sem sobrecarga e atinge a temperatura desejada com menor consumo elétrico.'
        }
      ]
    },
    {
      id: 'nao_gela',
      slug: 'ar-condicionado-nao-gela-ribeirao-preto',
      name: 'Ar-condicionado não está gelando',
      shortTitle: 'Ar não gela',
      description: 'Avaliação de aparelhos que ligam normalmente e ventilam, mas não conseguem refrigerar adequadamente o cômodo.',
      icon: 'snowflake',
      popular: true,
      situations: [
        'Aparelho sopra vento morno ou ambiente não esfria mesmo no 18°C',
        'Unidade externa (compressor) não aciona ou desarma em minutos',
        'Serpentina congelando / criando camada de gelo',
        'Suspeita de perda de carga de fluido refrigerante'
      ],
      equipmentTypes: [
        'Inspeção elétrica, capacitores e sensores térmicos',
        'Teste de pressão e medição de superaquecimento/sub-resfriamento',
        'Diagnóstico do compressor e válvula reversora'
      ],
      faqs: [
        {
          q: 'Por que o ar-condicionado liga mas sopra ar quente ou morno?',
          a: 'As causas mais comuns incluem filtros entupidos de poeira, capacitor do compressor com defeito, placa eletrônica com erro, ou microvazamento de fluido.'
        },
        {
          q: 'O gás do ar-condicionado vence ou precisa ser trocado com o tempo?',
          a: 'Não. Em um sistema vedado corretamente, o gás refrigerante não se consome nem vence. Se faltar gás, há vazamento que deve ser identificado e reparado.'
        }
      ]
    },
    {
      id: 'vazamento',
      slug: 'vazamento-gotejamento-ar-condicionado-ribeirao-preto',
      name: 'Vazamentos e gotejamento',
      shortTitle: 'Vazamento / gotejamento',
      description: 'Avaliação e conserto de problemas na drenagem, mangueiras obstruídas, caimento incorreto ou funcionamento do dreno.',
      icon: 'droplets',
      popular: false,
      situations: [
        'Água pingando pela frente da unidade interna na parede ou piso',
        'Mangueira de dreno entupida por limo ou lodo',
        'Bandeja de condensado trincada ou desnivelada',
        'Água escorrendo por trás do equipamento na alvenaria'
      ],
      equipmentTypes: [
        'Desobstrução e substituição de mangueiras cristal/corrugadas',
        'Instalação ou revisão de bombas de dreno',
        'Correção de nivelamento da evaporadora'
      ],
      faqs: [
        {
          q: 'Por que o ar-condicionado começa a pingar para dentro do quarto?',
          a: 'Na maioria das vezes o canal ou a mangueira de dreno está obstruído por limo natural da umidade, fazendo a bandeja transbordar.'
        }
      ]
    },
    {
      id: 'gas',
      slug: 'recarga-avaliacao-gas-ar-condicionado-ribeirao-preto',
      name: 'Recarga e avaliação de gás',
      shortTitle: 'Recarga / avaliação de gás',
      description: 'Avaliação técnica com manômetros digitais quando houver suspeita de perda ou desequilíbrio no fluido refrigerante.',
      icon: 'gauge',
      popular: false,
      situations: [
        'Queda progressiva no rendimento térmico',
        'Aparelho após mudança ou reinstalação',
        'Formação de gelo na tubulação de cobre',
        'Identificação e correção de pontos de vazamento com teste de pressão'
      ],
      equipmentTypes: [
        'Gás ecológico R-410A, R-32 e R-22',
        'Vácuo com bomba de alto rendimento e medição em mícrons',
        'Carga com balança de precisão conforme especificação do fabricante'
      ],
      faqs: [
        {
          q: 'Basta apenas colocar mais gás se estiver faltando?',
          a: 'Não é recomendável apenas repor o gás sem antes localizar o ponto de vazamento, pois o gás novo escapará novamente em pouco tempo.'
        }
      ]
    }
  ],

  propertyTypes: [
    { id: 'casa', label: 'Casa', icon: 'home' },
    { id: 'apartamento', label: 'Apartamento', icon: 'building' },
    { id: 'escritorio', label: 'Empresa / escritório', icon: 'briefcase' },
    { id: 'comercio', label: 'Comércio', icon: 'store' },
    { id: 'outro', label: 'Outro', icon: 'more-horizontal' }
  ],

  equipmentOwnership: [
    { id: 'sim', label: 'Sim, já tenho o aparelho' },
    { id: 'nao', label: 'Não possuo o aparelho' },
    { id: 'pesquisando', label: 'Ainda estou pesquisando para comprar' }
  ],

  btuCapacities: [
    '9.000 BTUs',
    '12.000 BTUs',
    '18.000 BTUs',
    '24.000 BTUs',
    '30.000+ BTUs',
    'Não sei informar'
  ],

  neighborhoodsRP: [
    'Jardim Botânico',
    'Nova Aliança',
    'Alto da Boa Vista',
    'Bonfim Paulista',
    'Vila Tibério',
    'Centro',
    'Jardim Paulistano',
    'Jardim Irajá',
    'Campos Elíseos',
    'Ipiranga',
    'Ribeirânia',
    'Jardim Canadá',
    'Jardim Santa Ângela',
    'City Ribeirão',
    'Quintas de São José',
    'Jardim São Luiz',
    'Parque dos Bandeirantes',
    'Sumarezinho',
    'Vila Virgínia',
    'Jardim Recreio',
    'Outro bairro de Ribeirão Preto'
  ]
};
