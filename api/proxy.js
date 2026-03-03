export default async function handler(req, res) {
  // Log incoming request
  console.log('[Proxy] Incoming request:', {
    url: req.url,
    originalUrl: req.originalUrl,
    method: req.method,
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
  delete headers.host;

  if (apiType === 'weixin-long') {
    targetUrl = `https://long.open.weixin.qq.com/${apiPath}${queryString}`;
    headers['User-Agent'] = 'Mozilla/5.0 (Linux; Android 7.0; Mi-4c Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043632 Safari/537.36 MicroMessenger/6.6.1.1220(0x26060135) NetType/WIFI Language/zh_CN';
    headers['Accept'] = '*/*';
    headers['Referer'] = 'https://open.weixin.qq.com/';
  } else if (apiType === 'weixin') {
    targetUrl = `https://open.weixin.qq.com/${apiPath}${queryString}`;
    headers['User-Agent'] = 'Mozilla/5.0 (Linux; Android 7.0; Mi-4c Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043632 Safari/537.36 MicroMessenger/6.6.1.1220(0x26060135) NetType/WIFI Language/zh_CN';
    headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
    headers['Referer'] = 'https://open.weixin.qq.com/';
  } else if (apiType === 'hortor') {
    targetUrl = `https://comb-platform.hortorgames.com/${apiPath}${queryString}`;
    headers['User-Agent'] = 'Mozilla/5.0 (Linux; Android 12; 23117RK66C Build/V417IR; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/95.0.4638.74 Mobile Safari/537.36';
    headers['Accept'] = '*/*';
    headers['Host'] = 'comb-platform.hortorgames.com';
    headers['Connection'] = 'keep-alive';
    headers['Content-Type'] = 'text/plain; charset=utf-8';
    headers['Origin'] = 'https://open.weixin.qq.com';
    headers['Referer'] = 'https://open.weixin.qq.com/';
  } else {
    console.log('[Proxy] Unknown API type:', apiType);
    return res.status(400).json({ error: 'Unknown API type', received: apiType });
  }

  console.log('[Proxy] Forwarding to:', targetUrl);

  try {
    const fetchOptions = {
      method: req.method,
      headers,
    };

    // Handle request body
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body) {
        if (typeof req.body === 'string') {
          fetchOptions.body = req.body;
        } else {
          fetchOptions.body = JSON.stringify(req.body);
        }
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
    const excludeHeaders = ['content-encoding', 'transfer-encoding'];
    response.headers.forEach((value, key) => {
      if (!excludeHeaders.includes(key.toLowerCase())) {
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
