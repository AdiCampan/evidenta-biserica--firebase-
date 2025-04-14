import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import ro from './locales/ro.json';

const resources = {
  es: { translation: es },
  ro: { translation: ro }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ro', 
    fallbackLng: 'ro',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;