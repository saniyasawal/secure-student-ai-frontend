
import { API_BASE_URL, API_KEY } from '$app/env/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({
    params,
    request,
    url,
    fetch
}) => {
    if (!API_BASE_URL || !API_KEY) {
        return new Response(
            JSON.stringify({ error: 'Server API configuration is missing.' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    const path = params.path;

    if (!path || path.split('/').includes('..')) {
        return new Response(
            JSON.stringify({ error: 'Invalid API path.' }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    const authorization = request.headers.get('authorization');

    const upstreamUrl =
        `${API_BASE_URL.replace(/\/+$/, '')}/${path}${url.search}`;

    try {
        const upstream = await fetch(upstreamUrl, {
            method: 'GET',
            headers: {
                'X-API-Key': API_KEY,
                ...(authorization ? { Authorization: authorization } : {})
            }
        });

        return new Response(upstream.body, {
            status: upstream.status,
            headers: {
                'Content-Type':
                    upstream.headers.get('content-type') ?? 'application/json',
                'Cache-Control': 'no-store'
            }
        });
    } catch {
        return new Response(
            JSON.stringify({
                error: 'Unable to connect to the academic API.'
            }),
            {
                status: 502,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};
