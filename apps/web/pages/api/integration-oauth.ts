import { NextApiRequest, NextApiResponse } from 'next/types';
import { getCurrentConfig } from 'config/discord';
import { z } from 'zod';

const REDIRECT_URI_SLACK =
  process.env.NEXT_PUBLIC_REDIRECT_URI || 'https://linen.dev/api/oauth';
const SLACK_CLIENT_ID =
  process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || '1250901093238.3006399856353';

function integrationAuthorizer(community: string, accountId: string) {
  switch (community) {
    case 'discord':
      const discord = getCurrentConfig();
      return (
        `https://discord.com/api/oauth2/authorize` +
        `?client_id=${discord.PUBLIC_CLIENT_ID}` +
        `&permissions=${discord.permissions}` +
        `&redirect_uri=${discord.PUBLIC_REDIRECT_URI}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(discord.scope.join(' '))}` +
        `&state=${accountId}`
      );
    case 'slack':
      const scope = [
        'channels:history',
        'channels:join',
        'channels:read',
        'incoming-webhook',
        'reactions:read',
        'users:read',
        'team:read',
        'files:read',
        'chat:write',
        'chat:write.customize',
      ];
      const user_scope = [
        'channels:history',
        'search:read',
        'users:read',
        'reactions:read',
      ];
      return (
        'https://slack.com/oauth/v2/authorize' +
        `?client_id=${SLACK_CLIENT_ID}` +
        `&scope=${scope.join()}` +
        `&user_scope=${user_scope.join()}` +
        `&state=${accountId}` +
        `&redirect_uri=${REDIRECT_URI_SLACK}`
      );
    default:
      throw new Error('not implemented');
  }
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const schema = z.object({
    community: z.string(),
    accountId: z.string().uuid(),
  });

  const body = schema.parse(request.query);
  return response.json({
    url: integrationAuthorizer(body.community, body.accountId),
  });
}
