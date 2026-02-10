/**
 * 微信 WebView 兼容的图片导出工具
 */

/**
 * 检测是否运行在微信环境中
 */
export const isInWeChat = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /micromessenger/i.test(navigator.userAgent);
};

/**
 * 检测是否运行在移动设备上
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );
};

/**
 * 检测是否运行在 Safari 浏览器中
 */
export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

/**
 * 微信兼容的图片导出函数
 * @param element 要导出的DOM元素
 * @param filename 文件名（不含扩展名）
 * @param options html2canvas选项
 * @returns 导出URL (base64 或 blob URL)
 */
export const exportToImageWithWeChatSupport = async (
  element: HTMLElement,
  filename: string,
  options: any = {}
): Promise<{ url: string; isWeChat: boolean; message: string }> => {
  const { html2canvas } = (window as any);

  if (!html2canvas) {
    throw new Error('html2canvas 未加载，请确保已引入该库');
  }

  // 检测环境
  const inWeChat = isInWeChat();
  const isMobile = isMobileDevice();
  
  // 保存原始样式，在finally块中恢复
  const originalStyles: Array<{
    element: HTMLElement;
    height: string;
    maxHeight: string;
    overflow: string;
    overflowY: string;
    overflowX: string;
  }> = [];

  try {
    // 递归函数：清除所有子元素的高度和溢出限制
    const clearHeightRestrictions = (el: HTMLElement) => {
      if (!el) return;

      originalStyles.push({
        element: el,
        height: el.style.height,
        maxHeight: el.style.maxHeight,
        overflow: el.style.overflow,
        overflowY: el.style.overflowY,
        overflowX: el.style.overflowX
      });

      el.style.height = 'auto';
      el.style.maxHeight = 'none';
      el.style.overflow = 'visible';
      el.style.overflowY = 'visible';
      el.style.overflowX = 'visible';

      const children = el.children;
      for (let i = 0; i < children.length; i++) {
        clearHeightRestrictions(children[i] as HTMLElement);
      }
    };

    // 清除限制
    clearHeightRestrictions(element);
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 计算实际尺寸
    const actualHeight = Math.max(
      element.scrollHeight,
      element.clientHeight
    );
    const actualWidth = Math.max(
      element.scrollWidth,
      element.clientWidth
    );

    // 微信环境特殊配置
    const weChatOptions = inWeChat
      ? {
          scale: 1, // 微信中降低scale避免Canvas过大
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          height: actualHeight,
          width: actualWidth,
          windowWidth: actualWidth,
          windowHeight: actualHeight,
          allowTaint: true,
          proxy: null,
          // 微信中禁用某些可能导致问题的选项
          removeContainer: true,
          letterRendering: true,
          onclone: (cloned: Document) => {
            const clonedElement =
              cloned.querySelector('div') ||
              cloned.documentElement;
            if (clonedElement) {
              clearHeightRestrictions(clonedElement as HTMLElement);
            }
          }
        }
      : {
          scale: 2, // PC/非微信环境支持更高的scale
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          height: actualHeight,
          width: actualWidth,
          windowWidth: actualWidth,
          windowHeight: actualHeight,
          allowTaint: true,
          proxy: null,
          onclone: (cloned: Document) => {
            const clonedElement =
              cloned.querySelector('div') ||
              cloned.documentElement;
            if (clonedElement) {
              clearHeightRestrictions(clonedElement as HTMLElement);
            }
          },
          ...options
        };

    // 渲染Canvas
    const canvas = await html2canvas(element, weChatOptions);

    // 检查Canvas是否为空
    const ctx = canvas.getContext('2d');
    const imageData = ctx?.getImageData(0, 0, 1, 1);
    const isCanvasEmpty =
      imageData?.data[3] === 0; // 检查alpha通道是否为0

    let url: string;
    let message: string;

    if (inWeChat) {
      // 微信环境：使用base64 (避免blob问题)
      url = canvas.toDataURL('image/png', 0.8);
      message = '⚠️ 请长按图片保存到相册，或点击分享到朋友圈';

      // 微信中如果需要下载，可以用JS bridge调用微信API
      if ((window as any).wx && (window as any).wx.ready) {
        (window as any).wx.onMenuShareAppMessage({
          title: filename,
          desc: '数据导出',
          link: '', // 微信要求提供链接
          imgUrl: url.substring(0, 1000), // base64太长，用第一部分作预览
          type: 'link',
          dataUrl: url
        });
      }
    } else if (isCanvasEmpty && isMobile) {
      // 移动Safari中Canvas为空的情况
      url = canvas.toDataURL('image/png', 0.8);
      message = '✅ 导出成功，请长按图片保存';
    } else {
      // 正常环境：使用blob下载
      url = canvas.toDataURL('image/png');
      message = '✅ 导出成功';

      // 自动下载（非微信非移动环境）
      if (!isMobile) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }

    return {
      url,
      isWeChat: inWeChat,
      message
    };
  } finally {
    // 恢复原始样式
    originalStyles.forEach(({ element, height, maxHeight, overflow, overflowY, overflowX }) => {
      element.style.height = height;
      element.style.maxHeight = maxHeight;
      element.style.overflow = overflow;
      element.style.overflowY = overflowY;
      element.style.overflowX = overflowX;
    });
  }
};

/**
 * 创建一个模态框来显示导出的图片（适合微信）
 */
export const showExportImageModal = (
  imageUrl: string,
  filename: string = '导出图片'
): void => {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
  `;

  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.cssText = `
    max-width: 90%;
    max-height: 70%;
    border-radius: 8px;
    object-fit: contain;
  `;

  const tip = document.createElement('div');
  tip.style.cssText = `
    color: #fff;
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
    line-height: 1.5;
  `;
  tip.innerHTML = `
    <p>${filename}</p>
    <p style="margin-top: 10px; color: #ffcc00;">💡 请长按图片保存到相册</p>
  `;

  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    border: none;
    background: rgba(255, 255, 255, 0.3);
    color: white;
    border-radius: 50%;
    font-size: 24px;
    cursor: pointer;
  `;
  closeBtn.textContent = '×';
  closeBtn.onclick = () => modal.remove();

  modal.appendChild(img);
  modal.appendChild(tip);
  modal.appendChild(closeBtn);
  document.body.appendChild(modal);

  // 点击背景关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
};
