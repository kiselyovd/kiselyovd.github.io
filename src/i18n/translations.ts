export const translations = {
  en: {
    'sc.back': 'Portfolio',
    'sc.source': 'Source',
    'sc.task': 'Task preset',
    'sc.slug': 'Project slug',
    'sc.python': 'Python version',
    'sc.serving': 'Include API serving',
    'sc.command': 'Generation command',
    'sc.copy': 'Copy command',
    'sc.files': 'What changes in the scaffold',
    'sc.ready': 'Ready to copy. Framework and paths follow the selected preset.',
    'sc.invalid': 'Use 2–50 lowercase letters, digits, and hyphens; start with a letter.',
    'sc.copied': 'Command copied.',
    'sc.copy.fallback': 'Select the command above and copy it from your browser.',
    'sc.task.classification': 'Image classification',
    'sc.task.segmentation': 'Image segmentation',
    'sc.task.keypoints': 'Keypoint detection',
    'sc.task.tabular': 'Tabular classification',
    'sc.task.nlp': 'Text classification',
    'sc.scaffold.note':
      'The command creates a project scaffold. Training, model-specific prediction code, and data preparation remain part of your project.',
    'sc.files.note':
      "The file choices follow the template's post-generation hooks. Crossed-out paths are removed for the selected preset.",
    'sc.template.intro':
      'See how a task preset changes a reproducible ML scaffold. Choose the task, Python version, and API serving; the command and file choices follow the real template.',
    'sc.template.provenance':
      "The five presets match the template's canonical test contexts. The framework follows the task; generation and training run in your own environment.",
    'sc.combat': 'Combat and tabletop',
    'sc.character': 'Character creation',
    'sc.combat.caption':
      "Published combat screen: initiative, the tabletop, and the DM's game-tool result. Default actor in this example: Hero.",
    'sc.combat.title': 'An action reaches the rules engine',
    'sc.combat.description':
      'The DM combines narration and tool calls. Combat state, turn order, damage, and conditions belong to the backend; the interface presents that state.',
    'sc.character.caption':
      'Published character-creation screen with class presets and character art.',
    'sc.character.title': 'A character enters the campaign',
    'sc.character.description':
      'Choose a preset hero or create a character. The application records the combat attributes and carries that character into the campaign.',
    'sc.tour.note':
      'This tour uses the two screenshots already published with the project. Open the release to try a campaign.',
    'sc.code': 'Open the source',
    'sc.release': 'Try the published milestone',
    'sc.platform': 'Platform',
    'sc.assets': 'Open release assets',
    'sc.release.note':
      'Release v0.12.0-real-engine publishes Windows, macOS Apple silicon, and Linux installers. Filenames retain package version 0.1.0. Signing and notarization are optional workflow steps; local model mode needs compatible sidecars.',
    'sc.dungeon.intro':
      'A solo D&D desktop application with an AI Dungeon Master, a rules engine, a virtual tabletop, and persistent campaigns. Explore the published screens and the path to trying the release.',
    'sc.dungeon.provenance':
      'The screenshots are presentation evidence from the published project. Installer signatures, platform behavior, and local-model compatibility require the relevant release checks.',
    'flag.cta.tour': 'Explore the product tour',
    'port.template.explorer': 'Explore the scaffold',
    'nav.about': 'About',
    'nav.work': 'Work',
    'nav.presale': 'Presale',
    'nav.portfolio': 'Portfolio',

    'hero.tag': 'Lead ML Engineer · Moscow / remote',
    'hero.headline.prefix': 'LLM systems that',
    'hero.headline.accent': 'ship',
    'hero.headline.suffix': 'to production.',
    'hero.role': 'on-prem · air-gapped · multimodal',
    'hero.fact1.value': '5.5y',
    'hero.fact1.label': 'in ML & dev',
    'hero.fact2.value': '4',
    'hero.fact2.label': 'enterprise AI systems',
    'hero.fact3.value': '10+',
    'hero.fact3.label': 'presales led',
    'hero.fact4.value': '6',
    'hero.fact4.label': 'open-source ML repos',
    'hero.cta.primary': 'View work',
    'hero.cta.secondary': 'GitHub',

    'about.label': '/ About',
    'about.heading': 'Lead ML Engineer with product and presale background',
    'about.p1':
      'I build LLM systems, RAG, and multimodal pipelines for enterprise clients in on-premise and air-gapped environments. 5.5 years in ML and engineering; the last three years have been end-to-end LLM, OCR/VLM, and RAG platforms in production.',
    'about.p2':
      'I combine product development, ML team lead work, mentoring external teams, and presale architecture. A fullstack (Django/React) background means I ship models as production services, not proof-of-concepts.',
    'about.meta.focus.label': 'Focus',
    'about.meta.focus.value': 'LLM · RAG · VLM',
    'about.meta.deploy.label': 'Deploy',
    'about.meta.deploy.value': 'on-prem · air-gapped',
    'about.meta.industries.label': 'Industries',
    'about.meta.industries.value': 'BIM · oil & gas · edtech',
    'about.meta.languages.label': 'Languages',
    'about.meta.languages.value': 'RU native · EN B2',
    'about.meta.education.label': 'Education',
    'about.meta.education.value': 'MSc in AI for image processing (2025)',

    'ent.label': '/ Enterprise work',
    'ent.heading': 'Four enterprise AI systems in production',
    'ent.card1.category': 'BIM / AEC',
    'ent.card1.role': 'Full-stack · solo',
    'ent.card1.title': 'Multi-platform AI for BIM design',
    'ent.card1.desc':
      'Production with 160+ engineers. Scenario Engine (n8n-style DAG with LLM-aware nodes, versioning, rollback), Tauri v2 desktop, FastAPI backend, C# Revit plugin with a custom MCP protocol.',
    'ent.card2.category': 'Visual RAG',
    'ent.card2.role': 'Solo · 3 clients',
    'ent.card2.title': 'Visual RAG for engineering docs',
    'ent.card2.desc':
      'Hybrid retrieval: Visual RAG over PDF/DWG drawings with Jina v4 multimodal embeddings, Text2SQL over tables with Qwen on vLLM. Four domain profiles, PaddleOCR PP-StructureV3, air-gapped deployment.',
    'ent.card3.category': 'Industrial B2B',
    'ent.card3.role': 'Tech Lead · team 1+1',
    'ent.card3.title': 'LLM commercial-proposal automation',
    'ent.card3.desc':
      'VLM field extraction on Qwen 3.6 35B with xgrammar constrained decoding - hallucination-free at inference. Rules graph on networkx, human-in-the-loop constraint extractor from regulatory docs.',
    'ent.card4.category': 'EdTech · VR',
    'ent.card4.role': 'ML advisor / mentor',
    'ent.card4.title': 'VR language-learning with AI agent',
    'ent.card4.desc':
      'Two-model speech loop: Whisper ASR with custom phoneme alignment for pronunciation scoring, MMS-TTS fine-tuned on a low-resource creole absent from open speech datasets.',

    'pres.label': '/ Presale & leadership',
    'pres.heading': 'Presale architecture, tech lead, mentoring',
    'pres.col1.title': 'Presale',
    'pres.col1.big': '10+',
    'pres.col1.desc':
      'tenders and presale analyses across 10 months: multilingual ticket systems, LLM infrastructure cost modelling, HR analytics, GNN for BIM, air-gapped platforms for design institutes.',
    'pres.col2.title': 'Tech lead',
    'pres.col2.big': 'ML team',
    'pres.col2.desc':
      'ML architecture, decomposition, code review. Scenario Engine rewrite replacing a multi-agent architecture. CQRS split, OIDC + RBAC, audit log for every admin action.',
    'pres.col3.title': 'Hiring & mentoring',
    'pres.col3.big': '10 → 2',
    'pres.col3.desc':
      'interviews under LLM + RecSys; two candidates accepted by the client. ML mentoring for external teams on speech pipelines and low-resource TTS/ASR.',

    'port.label': '/ Open-source ML portfolio',
    'port.heading': 'Applied ML projects and the engineering scaffold behind them',
    'port.intro':
      'PyTorch Lightning · Hydra · MLflow · DVC · FastAPI · Docker · GitHub Actions · MkDocs · HuggingFace Hub. Every repo: CI, HF model card with widget, DVC-tracked artefacts, bilingual README, full quality gates.',
    'port.col.repo': 'Repo',
    'port.col.task': 'Task',
    'port.col.model': 'Model',
    'port.col.metrics': 'Metrics',
    'port.template.prefix': 'All five models are generated from a shared cookiecutter scaffold,',
    'port.template.suffix':
      ', which wires the CI, quality gates, Docker, and docs pipeline before any model code is written.',
    'port.research.label': '/ Research track',
    'port.research.heading': 'Synthetic data & monocular 3D pose',
    'port.research.synth':
      ' - an Unreal Engine 5 C++ plugin that captures keypoint-annotated vehicle datasets from Epic City Sample on a 24-point schema (CarFusion-14 compatible), with a cinematic generation demo and a published ',
    'port.research.dataset': 'HF dataset',
    'port.research.docs.sep': ' · ',
    'port.research.docs': 'Docs',
    'port.research.model':
      ' - a 24-point YOLO-pose model trained entirely on the synthetic renders (mAP@50 0.859 on synthetic val), proving the generated dataset is clean and learnable.',
    'port.research.pose3d':
      'Monocular 3D pose baseline in vehicle-keypoints: detector -> PnP (solvePnPRansac) against a canonical rigid car wireframe -> 6DoF pose, evaluated on ApolloCar3D (median rotation error 13.6 deg, 37.8% of cars within 10 deg).',
    'port.research.cap.video':
      'Rendered in Epic UE5 City Sample - clean -> 24-pt skeleton -> wireframe',
    'port.research.cap.labels': 'Synthetic labels',
    'port.research.cap.detect': 'Keypoints + bbox',
    'port.research.cap.lanes': 'Road sampling',

    'flag.label': '/ Flagship application',
    'flag.heading': 'Dungeon Master AI',
    'flag.desc':
      'A D&D desktop application with server-authoritative combat, persistent campaigns, local and cloud model paths, and SRD rules retrieval. Explore the published interface and platform-specific release assets.',
    'flag.cap.combat': 'Combat engine + VTT',
    'flag.cap.onboarding': 'Guided hero creation',
    'flag.cta': 'View on GitHub',
    'flag.cta.releases': 'Releases',

    'contact.label': '/ Contact',
    'contact.heading': 'Get in touch',
    'contact.sublabel': 'hiring · consulting · presale',

    'footer.tagline': 'Built with Astro · Deployed on GitHub Pages',
  },

  ru: {
    'sc.back': 'Портфолио',
    'sc.source': 'Источник',
    'sc.task': 'Тип задачи',
    'sc.slug': 'Имя проекта',
    'sc.python': 'Версия Python',
    'sc.serving': 'Добавить API',
    'sc.command': 'Команда генерации',
    'sc.copy': 'Скопировать команду',
    'sc.files': 'Что меняется в структуре',
    'sc.ready': 'Можно копировать. Framework и пути соответствуют выбранной задаче.',
    'sc.invalid': 'Используй 2–50 строчных латинских букв, цифр и дефисов; начни с буквы.',
    'sc.copied': 'Команда скопирована.',
    'sc.copy.fallback': 'Выдели команду выше и скопируй её в браузере.',
    'sc.task.classification': 'Классификация изображений',
    'sc.task.segmentation': 'Сегментация изображений',
    'sc.task.keypoints': 'Ключевые точки',
    'sc.task.tabular': 'Табличная классификация',
    'sc.task.nlp': 'Классификация текстов',
    'sc.scaffold.note':
      'Команда создаёт каркас проекта. Обучение, код предсказания для конкретной модели и подготовка данных остаются задачами проекта.',
    'sc.files.note':
      'Выбор файлов следует реальным post-generation hooks. Перечёркнутые пути удаляются для выбранного варианта.',
    'sc.template.intro':
      'Посмотри, как тип задачи меняет воспроизводимый ML-каркас. Выбери задачу, Python и API: команда и набор файлов следуют реальному шаблону.',
    'sc.template.provenance':
      'Пять вариантов соответствуют canonical test contexts шаблона. Framework зависит от задачи; генерация и обучение запускаются в твоём окружении.',
    'sc.combat': 'Бой и игровой стол',
    'sc.character': 'Создание героя',
    'sc.combat.caption':
      'Опубликованный экран боя: инициатива, игровой стол и результат инструмента ведущего. Персонаж этого примера: Hero.',
    'sc.combat.title': 'Действие попадает в движок правил',
    'sc.combat.description':
      'Ведущий соединяет рассказ и вызовы игровых инструментов. Состояние боя, порядок ходов, урон и состояния персонажей обрабатывает backend; интерфейс показывает это состояние.',
    'sc.character.caption': 'Опубликованный экран создания героя с классами и иллюстрациями.',
    'sc.character.title': 'Герой входит в кампанию',
    'sc.character.description':
      'Выбери готового героя или создай персонажа. Приложение сохраняет боевые характеристики и использует этого героя в кампании.',
    'sc.tour.note':
      'В туре показаны два экрана, уже опубликованные с проектом. Попробовать кампанию можно в релизе.',
    'sc.code': 'Открыть исходники',
    'sc.release': 'Попробовать опубликованную версию',
    'sc.platform': 'Платформа',
    'sc.assets': 'Открыть файлы релиза',
    'sc.release.note':
      'В v0.12.0-real-engine опубликованы установщики Windows, macOS Apple silicon и Linux. В именах файлов остаётся package version 0.1.0. Подпись и нотариализация — опциональные шаги workflow; локальные модели требуют совместимых sidecars.',
    'sc.dungeon.intro':
      'Desktop-приложение для одиночной D&D: AI-ведущий, движок правил, игровой стол и сохранённые кампании. Посмотри опубликованные экраны и выбери путь к запуску релиза.',
    'sc.dungeon.provenance':
      'Снимки показывают опубликованный интерфейс проекта. Подписи установщиков, поведение платформ и совместимость локальных моделей требуют соответствующих проверок релиза.',
    'flag.cta.tour': 'Посмотреть интерфейс',
    'port.template.explorer': 'Исследовать структуру шаблона',
    'nav.about': 'Обо мне',
    'nav.work': 'Работы',
    'nav.presale': 'Пресейл',
    'nav.portfolio': 'Портфолио',

    'hero.tag': 'Lead ML Engineer · Москва / удалённо',
    'hero.headline.prefix': 'LLM-системы, которые',
    'hero.headline.accent': 'доходят до прода',
    'hero.headline.suffix': '.',
    'hero.role': 'on-prem · air-gapped · мультимодальность',
    'hero.fact1.value': '5.5 лет',
    'hero.fact1.label': 'в ML и разработке',
    'hero.fact2.value': '4',
    'hero.fact2.label': 'enterprise AI-системы',
    'hero.fact3.value': '10+',
    'hero.fact3.label': 'пресейлов',
    'hero.fact4.value': '6',
    'hero.fact4.label': 'open-source ML-репо',
    'hero.cta.primary': 'Смотреть работы',
    'hero.cta.secondary': 'GitHub',

    'about.label': '/ Обо мне',
    'about.heading': 'Lead ML-инженер с продуктовым и пресейл-бэкграундом',
    'about.p1':
      'Строю LLM-системы, RAG и мультимодальные пайплайны для корпоративных заказчиков в on-premise и air-gapped контурах. 5.5 лет в ML и разработке; последние три года - LLM, OCR/VLM и RAG-платформы в проде от архитектуры до поддержки.',
    'about.p2':
      'Совмещаю продуктовую разработку, техлид ML-команды, менторинг внешних команд и пресейл-архитектуру. Fullstack-бэкграунд (Django/React) помогает доводить модели до полноценных сервисов, а не PoC.',
    'about.meta.focus.label': 'Фокус',
    'about.meta.focus.value': 'LLM · RAG · VLM',
    'about.meta.deploy.label': 'Деплой',
    'about.meta.deploy.value': 'on-prem · air-gapped',
    'about.meta.industries.label': 'Отрасли',
    'about.meta.industries.value': 'BIM · нефтегаз · edtech',
    'about.meta.languages.label': 'Языки',
    'about.meta.languages.value': 'русский родной · английский B2',
    'about.meta.education.label': 'Образование',
    'about.meta.education.value': 'Магистр, ИИ в обработке изображений (2025)',

    'ent.label': '/ Enterprise',
    'ent.heading': 'Четыре корпоративные AI-системы в проде',
    'ent.card1.category': 'BIM / AEC',
    'ent.card1.role': 'Full-stack · соло',
    'ent.card1.title': 'Мультиплатформенная AI-система для BIM-проектирования',
    'ent.card1.desc':
      'Продакшен, 160+ инженеров. Scenario Engine (визуальный DAG с LLM-нодами, версионирование, rollback), Tauri v2 desktop, FastAPI, C# плагин для Revit с собственным MCP-протоколом.',
    'ent.card2.category': 'Visual RAG',
    'ent.card2.role': 'Соло · 3 заказчика',
    'ent.card2.title': 'Visual RAG для инженерной документации',
    'ent.card2.desc':
      'Гибридный ретривал: Visual RAG по PDF/DWG-чертежам на мультимодальных эмбеддингах Jina v4, Text2SQL по табличным данным на Qwen через vLLM. 4 domain-профиля, PaddleOCR PP-StructureV3, air-gapped контур.',
    'ent.card3.category': 'Промышленный B2B',
    'ent.card3.role': 'Tech Lead · команда 1+1',
    'ent.card3.title': 'LLM-автоматизация коммерческих предложений',
    'ent.card3.desc':
      'VLM-экстракция полей на Qwen 3.6 35B с constrained decoding через xgrammar - без галлюцинаций на инференсе. Граф правил на networkx, human-in-the-loop экстрактор constraints из нормативки.',
    'ent.card4.category': 'EdTech · VR',
    'ent.card4.role': 'ML-эксперт / ментор',
    'ent.card4.title': 'VR-платформа для изучения языков с AI-агентом',
    'ent.card4.desc':
      'Двухмодельный речевой контур: Whisper ASR с кастомным phoneme-alignment под оценку произношения, MMS-TTS с fine-tuning под региональный креольский, отсутствующий в открытых speech-датасетах.',

    'pres.label': '/ Пресейл и лидерство',
    'pres.heading': 'Пресейл-архитектура, техлид, менторинг',
    'pres.col1.title': 'Пресейл',
    'pres.col1.big': '10+',
    'pres.col1.desc':
      'тендеров и пресейл-аналитики за 10 месяцев: мультиязычные тикет-системы, cost-модели LLM-инфраструктуры, HR-аналитика, GNN-планировщик для BIM, air-gapped платформы для проектных институтов.',
    'pres.col2.title': 'Техлид',
    'pres.col2.big': 'ML-команда',
    'pres.col2.desc':
      'Архитектура ML-контура, декомпозиция, код-ревью. Scenario Engine как rewrite мультиагентной архитектуры. CQRS, OIDC + RBAC, audit-log на каждое административное действие.',
    'pres.col3.title': 'Найм и менторинг',
    'pres.col3.big': '10 → 2',
    'pres.col3.desc':
      'интервью под связку LLM + RecSys; 2 кандидата приняты заказчиком. ML-менторинг внешних команд по речевым пайплайнам и low-resource TTS/ASR.',

    'port.label': '/ Open-source ML-портфолио',
    'port.heading': 'Прикладные ML-проекты и общий инженерный каркас',
    'port.intro':
      'PyTorch Lightning · Hydra · MLflow · DVC · FastAPI · Docker · GitHub Actions · MkDocs · HuggingFace Hub. Каждый репо: CI, HF-карточка с виджетом, DVC-артефакты, bilingual README, полный стек quality gates.',
    'port.col.repo': 'Репо',
    'port.col.task': 'Задача',
    'port.col.model': 'Модель',
    'port.col.metrics': 'Метрики',
    'port.template.prefix': 'Все пять моделей сгенерированы из общего cookiecutter-шаблона',
    'port.template.suffix':
      ', который поднимает CI, quality gates, Docker и docs-пайплайн ещё до первой строки кода модели.',
    'port.research.label': '/ Research-направление',
    'port.research.heading': 'Синтетические данные и монокулярная 3D-поза',
    'port.research.synth':
      ' - плагин на C++ для Unreal Engine 5: снимает размеченные датасеты ключевых точек авто из Epic City Sample по 24-точечной схеме (совместимой с CarFusion-14), с кинематографичным demo-роликом генерации и опубликованным ',
    'port.research.dataset': 'HF-датасетом',
    'port.research.docs.sep': ' · ',
    'port.research.docs': 'Docs',
    'port.research.model':
      ' - 24-точечная YOLO-pose модель, обученная полностью на синтетических рендерах (mAP@50 0.859 на синтетическом val); доказательство, что сгенерированный датасет чист и обучаем.',
    'port.research.pose3d':
      'Монокулярный 3D-baseline в vehicle-keypoints: детектор -> PnP (solvePnPRansac) по каноничному жёсткому каркасу авто -> 6DoF поза, оценка на ApolloCar3D (медианная ошибка поворота 13.6 deg, 37.8% машин в пределах 10 deg).',
    'port.research.cap.video':
      'Рендер в Epic UE5 City Sample - чисто -> 24-точечный скелет -> каркас',
    'port.research.cap.labels': 'Синтетические метки',
    'port.research.cap.detect': 'Точки + bbox',
    'port.research.cap.lanes': 'Дороги (ZoneGraph)',

    'flag.label': '/ Флагманское приложение',
    'flag.heading': 'Dungeon Master AI',
    'flag.desc':
      'D&D desktop-приложение с серверным движком боя, сохранёнными кампаниями, локальными и облачными моделями и поиском по правилам SRD. Посмотри опубликованный интерфейс и файлы релиза для своей платформы.',
    'flag.cap.combat': 'Движок боя + VTT',
    'flag.cap.onboarding': 'Создание героя',
    'flag.cta': 'Открыть на GitHub',
    'flag.cta.releases': 'Релизы',

    'contact.label': '/ Контакты',
    'contact.heading': 'На связи',
    'contact.sublabel': 'найм · консалтинг · пресейл',

    'footer.tagline': 'Сделано на Astro · Задеплоено на GitHub Pages',
  },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)['en'];
