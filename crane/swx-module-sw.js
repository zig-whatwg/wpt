self.onfetch = event => {
  if (!new URL(event.request.url).pathname.endsWith('/swx-module-dependency.js')) return;
  const data = {source: 'service worker', destination: event.request.destination,
                clientId: event.clientId, resultingClientId: event.resultingClientId};
  event.respondWith(new Response('export default ' + JSON.stringify(data),
                                {headers: {'Content-Type': 'text/javascript'}}));
};
