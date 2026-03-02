export interface ServiceItem {
  title: string;
  description: string;
  route?: string;
  comingSoon?: boolean;
}

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  ctaLabel: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContactConfig {
  whatsappNumber: string;
  whatsappMessage: string;
  responseTimeText: string;
}

export const CONTACT_CONFIG: ContactConfig = {
  whatsappNumber: '34111111111',
  whatsappMessage:
    'Hola, vengo desde la web de Nous Labs. Me interesa el Servicio D (Asistente IA Operativo) y me gustaría solicitar diagnóstico gratuito.',
  responseTimeText: 'Te responderemos en 24-48h con el siguiente paso para el diagnóstico.',
};

export const SERVICES: ServiceItem[] = [
  {
    title: 'Asistente IA Operativo (Servicio D)',
    description: 'Implantación operativa para agenda, correo y documentación con IA aplicada.',
    route: '/servicios/asistente-ia-operativo',
  },
  {
    title: 'Desarrollo de Software a medida',
    description: 'Plataformas y productos digitales para procesos de negocio críticos.',
    comingSoon: true,
  },
  {
    title: 'Automatizaciones IA',
    description: 'Automatización de operaciones repetitivas con foco en tiempo y calidad.',
    comingSoon: true,
  },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'D-Entry',
    price: '490€',
    description: 'Arranque guiado con configuración base.',
    features: ['Setup inicial', 'Flujo mínimo operativo', 'Checklist de handover'],
    ctaLabel: 'Solicitar D-Entry',
  },
  {
    name: 'D-Core',
    price: '1.250€',
    description: 'Implementación completa para operación diaria estable.',
    features: ['Agenda y correo operativos', 'Documentación base', 'Onboarding y validación'],
    ctaLabel: 'Solicitar D-Core',
  },
  {
    name: 'D-Pro',
    price: '2.400€',
    description: 'Capa avanzada con optimización y soporte extendido.',
    features: ['Todo lo de Core', 'Playbooks avanzados', 'Optimización y seguimiento'],
    ctaLabel: 'Solicitar D-Pro',
  },
];

export const SERVICE_D_FAQ: FaqItem[] = [
  {
    question: '¿Cuánto tarda la implementación?',
    answer: 'Entre 3 y 10 días laborables según el nivel contratado y disponibilidad de accesos.',
  },
  {
    question: '¿Necesito conocimientos técnicos?',
    answer: 'No. Nosotros guiamos setup, validación y entrega para que puedas operar sin fricción.',
  },
  {
    question: '¿Incluye soporte posterior?',
    answer: 'Sí, cada nivel incluye una ventana de soporte para ajustes y dudas tras el handover.',
  },
  {
    question: '¿Cómo se protege la información?',
    answer: 'Trabajamos bajo buenas prácticas de seguridad y acceso mínimo necesario durante la implantación.',
  },
];
