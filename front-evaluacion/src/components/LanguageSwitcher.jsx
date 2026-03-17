import { useRouter } from 'next/router';

export default function LanguageSwitcher() {
  const router = useRouter();
  const { locale, pathname, asPath, query } = router;

  const switchLocale = (nextLocale) => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    router.push({ pathname, query }, asPath, { locale: nextLocale });
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => switchLocale('es')}
        className={`px-2 py-1 text-sm rounded font-medium transition-colors ${
          locale === 'es'
            ? 'bg-indigo-500 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => switchLocale('en')}
        className={`px-2 py-1 text-sm rounded font-medium transition-colors ${
          locale === 'en'
            ? 'bg-indigo-500 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
    </div>
  );
}
