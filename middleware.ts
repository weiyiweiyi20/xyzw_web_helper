import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const search = req.nextUrl.search;

  // 代理 1：/api/weixin/* → https://open.weixin.qq.com/*
  if (pathname.startsWith('/api/weixin')) {
    const targetPath = pathname.replace(/^\/api\/weixin/, '');
    const url = new URL(targetPath + search, 'https://open.weixin.qq.com');

    return NextResponse.rewrite(url, {
      request: {
        headers: new Headers({
          'User-Agent': 'Mozilla/5.0 (Linux; Android 7.0; Mi-4c Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043632 Safari/537.36 MicroMessenger/6.6.1.1220(0x26060135) NetType/WIFI Language/zh_CN',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Referer': 'https://open.weixin.qq.com/',
        }),
      },
    });
  }

  // 代理 2：/api/weixin-long/* → https://long.open.weixin.qq.com/*
  if (pathname.startsWith('/api/weixin-long')) {
    const targetPath = pathname.replace(/^\/api\/weixin-long/, '');
    const url = new URL(targetPath + search, 'https://long.open.weixin.qq.com');

    return NextResponse.rewrite(url, {
      request: {
        headers: new Headers({
          'User-Agent': 'Mozilla/5.0 (Linux; Android 7.0; Mi-4c Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043632 Safari/537.36 MicroMessenger/6.6.1.1220(0x26060135) NetType/WIFI Language/zh_CN',
          'Accept': '*/*',
          'Referer': 'https://open.weixin.qq.com/',
        }),
      },
    });
  }

  // 代理 3：/api/hortor/* → https://comb-platform.hortorgames.com/*
  if (pathname.startsWith('/api/hortor')) {
    const targetPath = pathname.replace(/^\/api\/hortor/, '');
    const url = new URL(targetPath + search, 'https://comb-platform.hortorgames.com');

    return NextResponse.rewrite(url, {
      request: {
        headers: new Headers({
          'User-Agent': 'Mozilla/5.0 (Linux; Android 12; 23117RK66C Build/V417IR; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/95.0.4638.74 Mobile Safari/537.36',
          'Accept': '*/*',
          'Host': 'comb-platform.hortorgames.com',
          'Connection': 'keep-alive',
          'Content-Type': 'text/plain; charset=utf-8',
          'Origin': 'https://open.weixin.qq.com',
          'Referer': 'https://open.weixin.qq.com/',
        }),
      },
    });
  }

  return NextResponse.next();
}

// 只拦截 /api 开头的路径做代理
export const config = {
  matcher: ['/api/:path*'],
};
