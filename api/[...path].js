export default async function handler(req, res) {
  const { path = [] } = req.query;
  const pathStr = Array.isArray(path) ? path.join('/') : path;

  let targetUrl;
  let headers = {
    'User-Agent': req.headers['user-agent'] || '',
    Accept: req.headers['accept'] || '*/*',
  };

  if (pathStr.startsWith('weixin-long')) {
    targetUrl = `https://long.open.weixin.qq.com/${pathStr.replace(/^weixin-long\/?/, '')}`;
    headers['User-Agent'] = 'Mozilla/5.0 (Linux; Android 7.0; Mi-4c Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043632 Safari/537.36 MicroMessenger/6.6.1.1220(0x26060135) NetType/WIFI Language/zh_CN';
    headers['Accept'] = '*/*';
    headers['Referer'] = 'https://open.weixin.qq.com/';
  } else if (pathStr.startsWith('weixin')) {
    targetUrl = `https://open.weixin.qq.com/${pathStr.replace(/^weixin\/?/, '')}`;
    headers['User-Agent'] = 'Mozilla/5.0 (Linux; Android 7.0; Mi-4c Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043632 Safari/537.36 MicroMessenger/6.6.1.1220(0x26060135) NetType/WIFI Language/zh_CN';
    headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
    headers['Referer'] = 'https://open.weixin.qq.com/';
  } else if (pathStr.startsWith('hortor')) {
    targetUrl = `https://comb-platform.hortorgames.com/${pathStr.replace(/^hortor\/?/, '')}`;
    headers['User-Agent'] = 'Mozilla/5.0 (Linux; Android 12; 23117RK66C Build/V417IR; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/95.0.4638.74 Mobile Safari/537.36';
    headers['Accept'] = '*/*';
    headers['Host'] = 'comb-platform.hortorgames.com';
    headers['Connection'] = 'keep-alive';
    headers['Content-Type'] = 'text/plain; charset=utf-8';
    headers['Origin'] = 'https://open.weixin.qq.com';
    headers['Referer'] = 'https://open.weixin.qq.com/';
  } else {
    return res.status(400).json({ error: 'Invalid API path' });
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body) {
        if (typeof req.body === 'string') {
          fetchOptions.body = req.body;
        } else {
          fetchOptions.body = JSON.stringify(req.body);
        }
      }
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();

    // Copy response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}
