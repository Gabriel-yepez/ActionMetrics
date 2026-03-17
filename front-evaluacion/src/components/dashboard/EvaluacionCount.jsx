import EventNoteIcon from '@mui/icons-material/EventNote';
import { useTranslations } from 'next-intl';

export default function EvaluacionCount({evaluacionCount}) {
    const t = useTranslations('dashboard');

    return (
    <div className="flex justify-normal items-center w-full h-full p-3 md:p-6">
        <section className="m-1 md:m-2 shrink-0">
            <EventNoteIcon sx={{fontSize: {xs: 48, md: 80}, color: "#2196F3"}} />
        </section>

        <section className="text-center min-w-0">
            <h1 className="text-lg md:text-2xl font-semibold mb-1 md:mb-2">
                {t('totalEvaluations')}
            </h1>
            <span className="text-lg md:text-2xl font-medium">
                {evaluacionCount !== null ? evaluacionCount : 0}
            </span>
        </section>

  </div>
  )
}
