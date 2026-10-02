/**
 * Safe clipboard copy utility that works reliably across:
 * - Iframes (handles "Document is not focused" DOMException gracefully)
 * - Mobile devices (iOS Safari, Android Chrome)
 * - Modern navigator.clipboard API
 * - Fallback with document.execCommand('copy')
 *
 * Never throws uncaught exceptions.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try focusing window to mitigate iframe focus issues
  try {
    if (typeof window !== 'undefined' && typeof window.focus === 'function') {
      window.focus();
    }
  } catch {
    // Ignore focus failure
  }

  // 2. Try modern navigator.clipboard.writeText wrapped in try/catch
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (clipboardErr) {
      // Common in iframes: "DOMException: Document is not focused" or permission issues
      console.warn('navigator.clipboard.writeText failed, using execCommand fallback:', clipboardErr);
    }
  }

  // 3. Fallback: create temporary offscreen textarea and call document.execCommand('copy')
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      // Position offscreen without hiding (so focus/select works)
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '-9999px';
      textarea.style.opacity = '0';
      textarea.setAttribute('readonly', '');
      textarea.setAttribute('aria-hidden', 'true');

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);

      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (successful) {
        return true;
      }
    } catch (fallbackErr) {
      console.warn('execCommand copy fallback failed:', fallbackErr);
    }
  }

  return false;
}
