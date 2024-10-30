import Script from 'next/script'

export const MetaCRM = () => {
  return (
    <Script strategy="afterInteractive" id="metacrm-script">
      {`
        async function loadScript(src) {
          return new Promise((resolve, reject) => {
            var fjs = document.getElementsByTagName('script')[0];
            if (document.getElementById('widget-dom-id')) return;
    
            const script = document.createElement('script');
            script.crossOrigin="anonymous";
            script.id = 'widget-dom-id';
            script.src = src;
            script.integrity="sha384-kDm30bkUUB2wbaaWk2fSC6avcTsuIo501uA4NAYj6hFN/nLMXvzDDF82jMYY9XQh";
            script.onload = () => resolve(script);
            script.onerror = () =>
          reject(new Error("Script load error for " + src));
            fjs.parentNode.insertBefore(script, fjs);
          });
        }
        (async function () {
          try {
            await loadScript('https://widget.metacrm.inc/static/js/widget-1-1-10.js');
            MetaCRMWidget.init({
              apiKey: 'qq8dq48by0r'
            });
          } catch (error) {
            console.error('Failed to load widget.js', error);
          }
        })();
        `}
    </Script>
  )
}
