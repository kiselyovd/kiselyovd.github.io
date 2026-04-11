export const translations = {
  en: {
    // Header
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.stack': 'Stack',
    'nav.contact': 'Contact',

    // Hero
    'hero.name': 'Daniil Kiselyov',
    'hero.status': 'Working on Text2BIM Agent',
    'hero.subtitle': 'ML Engineer',
    'hero.description':
      'Building LLM systems, RAG pipelines, and computer vision solutions for production environments.',
    'hero.cta.projects': 'View Projects',
    'hero.cta.contact': 'Get in Touch',

    // About
    'about.label': 'About',
    'about.heading': 'Background',
    'about.p1':
      'ML engineer focused on LLM systems, RAG, and computer vision in production. I build LLM-based assistants, OCR pipelines, and multimodal document models that run in real-world enterprise environments.',
    'about.p2':
      "My work centers on deploying AI on-premise and in air-gapped environments for clients in construction, oil & gas, and other industries where cloud isn't an option. Models ship as production services, not just proof-of-concepts.",
    'about.p3':
      'Former fullstack developer and team lead with a Django/React background. That experience means I treat ML the same way I treat software engineering — with proper architecture, testing, CI/CD, and monitoring.',
    'about.current.label': 'Currently building',
    'about.current.text':
      '<strong class="text-zinc-800 dark:text-zinc-200">Text2BIM Agent</strong> — a multi-agent LLM platform for BIM design automation in Autodesk Revit.',

    // Projects
    'projects.label': 'Projects',
    'projects.heading': 'Selected Work',
    'projects.subheading': 'Open-source projects and research experiments.',
    'project.rag.desc':
      'Production-ready RAG pipeline with modular retrieval, reranking, and generation.',
    'project.finetune.desc':
      'LLM fine-tuning template with LoRA/QLoRA via Unsloth for efficient training.',
    'project.dnd.desc':
      'AI-powered D&D application with Clean Architecture, CQRS, and FastAPI microservices.',
    'project.pneumo.desc':
      'Pneumonia detection from chest X-rays — 26 architectures benchmarked, 84% accuracy.',
    'project.yolo.desc': 'Hands-on YOLO course — 6 modules from theory to real-world deployment.',
    'project.grnti.desc':
      'Scientific paper classification by GRNTI codes — multilingual BERT, 86% F1 score.',

    // Tech Stack
    'stack.label': 'Stack',
    'stack.heading': 'Technologies',
    'stack.subheading': 'Tools and frameworks I work with daily.',

    // Contact
    'contact.label': 'Contact',
    'contact.heading': 'Get in Touch',
    'contact.text':
      'Open to collaborations, consulting, and interesting ML projects. Feel free to reach out.',

    // Footer
    'footer.github': 'GitHub',
    'footer.email': 'Email',
  },

  ru: {
    // Header
    'nav.about': 'Обо мне',
    'nav.projects': 'Проекты',
    'nav.stack': 'Стек',
    'nav.contact': 'Контакты',

    // Hero
    'hero.name': 'Даниил Киселёв',
    'hero.status': 'Работаю над Text2BIM Agent',
    'hero.subtitle': 'ML-инженер',
    'hero.description':
      'Строю LLM-системы, RAG-пайплайны и решения компьютерного зрения для продакшена.',
    'hero.cta.projects': 'Проекты',
    'hero.cta.contact': 'Связаться',

    // About
    'about.label': 'Обо мне',
    'about.heading': 'Бэкграунд',
    'about.p1':
      'ML-инженер с фокусом на LLM-системы, RAG и компьютерное зрение в продакшене. Строю ассистентов на базе LLM, OCR-пайплайны и мультимодальные модели для работы с документами.',
    'about.p2':
      'Разворачиваю AI on-premise и в air-gapped контурах для клиентов из строительства, нефтегаза и других отраслей, где облако — не вариант. Модели идут в прод как полноценные сервисы, а не PoC.',
    'about.p3':
      'В прошлом — fullstack-разработчик и тимлид (Django/React). Этот опыт означает, что к ML я отношусь так же, как к разработке ПО — с архитектурой, тестами, CI/CD и мониторингом.',
    'about.current.label': 'Сейчас работаю над',
    'about.current.text':
      '<strong class="text-zinc-800 dark:text-zinc-200">Text2BIM Agent</strong> — мультиагентная LLM-платформа для автоматизации BIM-проектирования в Autodesk Revit.',

    // Projects
    'projects.label': 'Проекты',
    'projects.heading': 'Избранные работы',
    'projects.subheading': 'Open-source проекты и исследовательские эксперименты.',
    'project.rag.desc':
      'Модульный RAG-пайплайн с retrieval, reranking и генерацией — готов к продакшену.',
    'project.finetune.desc': 'Шаблон для fine-tuning LLM с LoRA/QLoRA через Unsloth.',
    'project.dnd.desc': 'D&D-приложение с AI — Clean Architecture, CQRS, микросервисы на FastAPI.',
    'project.pneumo.desc': 'Детекция пневмонии по рентгену — 26 архитектур, 84% accuracy.',
    'project.yolo.desc': 'Практический курс по YOLO — 6 модулей от теории до деплоя.',
    'project.grnti.desc':
      'Классификация научных статей по кодам ГРНТИ — multilingual BERT, 86% F1.',

    // Tech Stack
    'stack.label': 'Стек',
    'stack.heading': 'Технологии',
    'stack.subheading': 'Инструменты и фреймворки, с которыми работаю каждый день.',

    // Contact
    'contact.label': 'Контакты',
    'contact.heading': 'Связаться',
    'contact.text': 'Открыт к сотрудничеству, консалтингу и интересным ML-проектам. Пишите.',

    // Footer
    'footer.github': 'GitHub',
    'footer.email': 'Почта',
  },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)['en'];
