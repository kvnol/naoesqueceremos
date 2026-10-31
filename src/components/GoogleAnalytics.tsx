interface GoogleAnalyticsProps {
  gaId: string;
}

/**
 * gtag.js no HTML do servidor (não via client-only do @next/third-parties),
 * para a inicialização aparecer no código-fonte e o GA registrar visitas.
 */
export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  if (!gaId) return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <script
        id="gtag-init"
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');
`,
        }}
      />
    </>
  );
}
