import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

// Reads a PDF's text lines on the phone with Mozilla's pdf.js inside a hidden
// WebView (React Native itself can't read PDF text). Only pdf.js is fetched
// from the CDN; the PDF itself never leaves the phone.
// ponytail: needs internet the first time pdf.js loads; bundle pdf.js as an asset if offline import matters.
const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build';

const HTML = `<!doctype html><html><body><script src="${PDFJS}/pdf.min.js"></script><script>
pdfjsLib.GlobalWorkerOptions.workerSrc = '${PDFJS}/pdf.worker.min.js';
const post = (m) => window.ReactNativeWebView.postMessage(JSON.stringify(m));
// Group text pieces into lines by their y position, left to right.
window.readPdf = async (id, b64) => {
  try {
    const bin = atob(b64), data = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
    const doc = await pdfjsLib.getDocument({ data }).promise;
    const out = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const tc = await (await doc.getPage(p)).getTextContent();
      const rows = [];
      for (const it of tc.items) {
        if (!it.str) continue;
        const y = it.transform[5], x = it.transform[4];
        let r = rows.find((r) => Math.abs(r.y - y) < 3);
        if (!r) rows.push((r = { y, parts: [] }));
        r.parts.push({ x, s: it.str, w: it.width });
      }
      rows.sort((a, b) => b.y - a.y);
      for (const r of rows) {
        r.parts.sort((a, b) => a.x - b.x);
        let s = '', end = null;
        for (const q of r.parts) { if (end !== null && q.x - end > 1.5) s += ' '; s += q.s; end = q.x + q.w; }
        out.push(s.replace(/\\s+/g, ' ').trim());
      }
    }
    post({ id, lines: out });
  } catch (e) { post({ id, error: String(e && e.message || e) }); }
};
post({ ready: true });
</script></body></html>`;

export interface PdfTextReaderHandle {
  read: (base64: string) => Promise<string[]>;
}

export const PdfTextReader = forwardRef<PdfTextReaderHandle>(function PdfTextReader(_, ref) {
  const web = useRef<WebView>(null);
  const ready = useRef<Promise<void>>(null as unknown as Promise<void>);
  const markReady = useRef<() => void>(() => {});
  if (!ready.current) ready.current = new Promise((r) => (markReady.current = r));
  const pending = useRef(new Map<number, { ok: (l: string[]) => void; fail: (e: Error) => void }>());
  const nextId = useRef(1);

  useImperativeHandle(ref, () => ({
    read: async (base64) => {
      await withTimeout(ready.current, 20000, "Couldn't load the PDF reader. Check your internet and try again.");
      const id = nextId.current++;
      const result = new Promise<string[]>((ok, fail) => pending.current.set(id, { ok, fail }));
      web.current?.injectJavaScript(`window.readPdf(${id}, ${JSON.stringify(base64)}); true;`);
      return withTimeout(result, 60000, 'Reading the PDF took too long.');
    },
  }));

  const onMessage = (e: WebViewMessageEvent) => {
    const msg = JSON.parse(e.nativeEvent.data);
    if (msg.ready) return markReady.current();
    const p = pending.current.get(msg.id);
    if (!p) return;
    pending.current.delete(msg.id);
    msg.error ? p.fail(new Error(msg.error)) : p.ok(msg.lines);
  };

  return (
    <View style={{ width: 0, height: 0, overflow: 'hidden' }}>
      <WebView
        ref={web}
        originWhitelist={['*']}
        source={{ html: HTML, baseUrl: 'https://cdn.jsdelivr.net/' }}
        onMessage={onMessage}
        javaScriptEnabled
      />
    </View>
  );
});

function withTimeout<T>(p: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([p, new Promise<T>((_, fail) => setTimeout(() => fail(new Error(message)), ms))]);
}
