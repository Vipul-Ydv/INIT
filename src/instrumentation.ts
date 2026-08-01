export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy;
  if (!proxyUrl) return;

  const { ProxyAgent, setGlobalDispatcher } = await import("undici");
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
}
