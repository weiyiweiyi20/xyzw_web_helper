export default async function handler(req, res) {
  // Log incoming request
  console.log('[Proxy] Incoming request:', {
    url: req.url,
    method: req.method,
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    headers: Object.keys(req.headers),
  });

  // Get the original path from either URL or query string
  let originalPath = req.query.originalPath || req.url;
  if (Array.isArray(originalPath)) {
    originalPath = originalPath[0];
  }

  console.log('[Proxy] Original path:', originalPath);

  const url = new URL(originalPath, 'http://localhost');
  const pathSegments = url.pathname.split('/').filter(Boolean);
  
  if (pathSegments[0] !== 'api') {
    return res.status(400).json({ error: 'Not an API route' });
  }

  const apiType = pathSegments[1]; // weixin, weixin-long, hortor
  const apiPath = pathSegments.slice(2).join('/');
  const queryString = url.search;

  console.log('[Proxy] Parsed:', { apiType, apiPath, queryString });

  let targetUrl;
  let headers = { ...req.headers };
  
  // Remove headers that should not be forwarded or will be auto-calculated
  const excludeHeaders = [
    'host',
    'connection',
    'content-length',
    'transfer-encoding',
    'accept-encoding',
    'authorization', // Will be re-added if present
  ];
  excludeHeaders.forEach(h => delete headers[h]);

  if (apiType === 'weixin-long') {
    targetUrl = `https://long.open.weixin.qq.com/${apiPath}${queryString}`;
    headers['user-agent'] = 'Mozilla/5.0 (Linux; Android 7.0; Mi-4c Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043632 Safari/537.36 MicroMessenger/6.6.1.1220(0x26060135) NetType/WIFI Language/zh_CN';
    headers['accept'] = '*/*';
    headers['referer'] = 'https://open.weixin.qq.com/';
  } else if (apiType === 'weixin') {
    targetUrl = `https://open.weixin.qq.com/${apiPath}${queryString}`;
    headers['user-agent'] = 'Mozilla/5.0 (Linux; Android 7.0; Mi-4c Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043632 Safari/537.36 MicroMessenger/6.6.1.1220(0x26060135) NetType/WIFI Language/zh_CN';
    headers['accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
    headers['referer'] = 'https://open.weixin.qq.com/';
  } else if (apiType === 'hortor') {
    targetUrl = `https://comb-platform.hortorgames.com/${apiPath}${queryString}`;
    headers['user-agent'] = 'Mozilla/5.0 (Linux; Android 12; 23117RK66C Build/V417IR; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/95.0.4638.74 Mobile Safari/537.36';
    headers['accept'] = '*/*';
    headers['host'] = 'comb-platform.hortorgames.com';
    headers['connection'] = 'keep-alive';
    headers['content-type'] = 'text/plain; charset=utf-8';
    headers['origin'] = 'https://open.weixin.qq.com';
    headers['referer'] = 'https://open.weixin.qq.com/';
  } else {
    console.log('[Proxy] Unknown API type:', apiType);
    return res.status(400).json({ error: 'Unknown API type', received: apiType });
  }

  console.log('[Proxy] Forwarding to:', targetUrl);
  console.log('[Proxy] Request headers being sent:', headers);

  try {
    const fetchOptions = {
      method: req.method,
      headers,
    };

    // Handle request body - preserve raw format
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body) {
        // If body is a Buffer or Uint8Array, send as-is
        if (Buffer.isBuffer(req.body)) {
          fetchOptions.body = req.body;
        } else if (typeof req.body === 'string') {
          fetchOptions.body = req.body;
        } else if (req.body instanceof Uint8Array) {
          fetchOptions.body = req.body;
        } else {
          // For objects, stringify only if content-type is application/json
          if (headers['content-type']?.includes('application/json')) {
            fetchOptions.body = JSON.stringify(req.body);
          } else {
            // Try to preserve form data or other formats
            fetchOptions.body = req.body instanceof Object ? JSON.stringify(req.body) : String(req.body);
          }
        }
        console.log('[Proxy] Request body:', {
          type: typeof req.body,
          isBuffer: Buffer.isBuffer(req.body),
          size: Buffer.byteLength(fetchOptions.body || ''),
          contentType: headers['content-type'],
        });
      }
    }

    // Forward the request
    const response = await fetch(targetUrl, fetchOptions);
    const responseText = await response.text();

    console.log('[Proxy] Got response:', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      size: responseText.length,
    });

    // Copy response headers
    const excludeResponseHeaders = ['content-encoding', 'transfer-encoding', 'connection'];
    response.headers.forEach((value, key) => {
      if (!excludeResponseHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.status(response.status).send(responseText);
  } catch (error) {
    console.error('[Proxy] Error:', error.message, error.stack);
    res.status(500).json({ 
      error: error.message,
      type: error.constructor.name,
    });
  }
}
