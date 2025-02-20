import { getHomeUrl, getHomeText } from './home';
import { build } from '@linen/factory';

const PORT = process.env.PORT || 3000;

describe('getHomeUrl', () => {
  it('returns the correct url for a premium account', () => {
    const account = build('account', {
      premium: true,
      redirectDomain: 'example.com',
    });
    expect(getHomeUrl(account)).toEqual('http://example.com');
  });

  it('returns the correct url for a slack domain', () => {
    const account = build('account', {
      slackDomain: 'example',
    });
    expect(getHomeUrl(account)).toEqual(`http://localhost:${PORT}/s/example`);
  });

  it('returns the correct url for a discord domain', () => {
    const account = build('account', {
      discordDomain: 'example',
    });
    expect(getHomeUrl(account)).toEqual(`http://localhost:${PORT}/d/example`);
  });

  it('returns the correct url for a discord server id', () => {
    const account = build('account', {
      discordServerId: 'example',
    });
    expect(getHomeUrl(account)).toEqual(`http://localhost:${PORT}/d/example`);
  });

  it('returns the correct url for a non-premium account', () => {
    const account = build('account', {
      premium: false,
    });
    expect(getHomeUrl(account)).toEqual('/');
  });

  it('returns the correct url for a non-premium account with a redirect domain', () => {
    const account = build('account', {
      premium: false,
      redirectDomain: 'example.com',
    });
    expect(getHomeUrl(account)).toEqual('/');
  });

  it('returns the correct url when there is no account', () => {
    expect(getHomeUrl()).toEqual('/');
  });
});

describe('getHomeText', () => {
  it('returns null for / as the url', () => {
    expect(getHomeText('/')).toEqual(null);
  });

  it('returns the correct text for a url thats starts with https://', () => {
    expect(getHomeText('https://example.com')).toEqual('example.com');
  });

  it('returns the linen.dev url for other urls', () => {
    expect(getHomeText('/s/example')).toEqual('linen.dev/s/example');
    expect(getHomeText('/d/example')).toEqual('linen.dev/d/example');
  });
});
