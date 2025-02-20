const LINEN_HOSTNAMES = [
  'localhost',
  'localhost:3000',
  'linen.dev',
  'ngrok.io',
  'vercel.app',
];

export function isLinenDomain(host?: string) {
  if (!host) return true;
  return !!LINEN_HOSTNAMES.find(
    (linenHost) => linenHost === host || host.endsWith(linenHost)
  );
}

export function getCurrentUrl(request?: any) {
  return (
    process.env.NEXTAUTH_URL ||
    request?.headers?.origin ||
    'http://localhost:3000'
  );
}

// Checks if the routing is subdomain or based on paths
export const isSubdomainbasedRouting = (host: string): boolean => {
  if (host.includes('vercel.app')) {
    return false;
  }
  if (host.includes('linendev.com')) {
    return false;
  }
  if (host.includes('www.localhost:3000')) {
    return false;
  }

  if (host.includes('.')) {
    const splitHost = host.split('.');
    if (splitHost[0] === 'www') {
      // for cases where user want to use fully qualified name and not subdomain like www.papercups.io
      if (splitHost[1] !== 'linen') {
        return true;
      }
      return false;
    }
    if (host.includes('localhost:3000')) {
      return true;
    }

    // handle osquery.fleetdm.com and something.linen.dev
    if (host.split('.').length > 2) {
      return true;
    }
  }

  return false;
};

export function isSubdomainNotAllowed(host: string) {
  return (
    host.endsWith('linen.dev') &&
    host.split('.').length > 2 &&
    !host.startsWith('www')
  );
}

export function getIntegrationUrl() {
  if (process.env.NODE_ENV === 'test') {
    return '';
  }
  if (process.env.BRANCH === 'main') {
    return `main.linendev.com`;
  }
  if (process.env.VERCEL_GIT_COMMIT_REF === 'main') {
    return `main.linendev.com`;
  }
  if (process.env.VERCEL_URL) {
    return `${process.env.VERCEL_GIT_COMMIT_REF}.linendev.com`.toLowerCase();
  }
  if (process.env.BRANCH) {
    return `${process.env.BRANCH}.linendev.com`.toLowerCase();
  }
  // assume localhost
  return `localhost:${process.env.PORT ?? 3000}`;
}

export function getLinenUrl() {
  if (process.env.NODE_ENV === 'test') {
    return '';
  }
  if (process.env.BRANCH === 'main') {
    return `linen.dev`;
  }
  if (process.env.VERCEL_GIT_COMMIT_REF === 'main') {
    return `linen.dev`;
  }
  if (process.env.VERCEL_URL) {
    return `${process.env.VERCEL_URL}`;
  }
  if (process.env.BRANCH) {
    return `linen-dev-git-${process.env.BRANCH}-linen.vercel.app`.toLowerCase();
  }
  // assume localhost
  return `localhost:${process.env.PORT ?? 3000}`;
}

export function getPushUrlSSR() {
  if (!!process.env.VERCEL_GIT_COMMIT_REF) {
    return `https://push.${process.env.VERCEL_GIT_COMMIT_REF}.linendev.com`;
  }
  if (!!process.env.PUSH_SERVICE_URL) {
    return process.env.PUSH_SERVICE_URL;
  }
  return `http://localhost:${process.env.PUSH_PORT ?? 4000}`;
}
