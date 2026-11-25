/* Widzenie komputerowe: zdjęcie paragonu -> tekst. Tesseract.js działa w przeglądarce (ładowany z CDN, bez instalacji). FA.ocr */
(function () {
  const FA = window.FA;
  FA.ocr = {
    available: () => !!window.Tesseract,
    loadImage(file) {
      return new Promise((ok, no) => {
        const url = URL.createObjectURL(file), img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); ok(img); };
        img.onerror = () => { URL.revokeObjectURL(url); no(new Error('Nie udało się wczytać zdjęcia.')); };
        img.src = url;
      });
    },
    // skala szarości + rozciągnięcie kontrastu (2%-98% histogramu); binaryzację robi sam Tesseract
    prep(img) {
      const W = Math.min(2000, Math.max(1400, img.naturalWidth)), sc = W / img.naturalWidth;
      const c = document.createElement('canvas'); c.width = W; c.height = Math.round(img.naturalHeight * sc);
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0, c.width, c.height);
      const d = x.getImageData(0, 0, c.width, c.height), p = d.data, g = new Uint8Array(p.length / 4), h = new Array(256).fill(0);
      for (let i = 0, j = 0; i < p.length; i += 4, j++) { const v = (p[i] * 0.299 + p[i + 1] * 0.587 + p[i + 2] * 0.114) | 0; g[j] = v; h[v]++; }
      const n = g.length; let acc = 0, lo = 0, hi = 255;
      for (let t = 0; t < 256; t++) { acc += h[t]; if (acc >= n * 0.02) { lo = t; break; } }
      acc = 0; for (let t = 255; t >= 0; t--) { acc += h[t]; if (acc >= n * 0.02) { hi = t; break; } }
      const span = Math.max(1, hi - lo);
      for (let i = 0, j = 0; i < p.length; i += 4, j++) { const v = Math.max(0, Math.min(255, ((g[j] - lo) * 255) / span)); p[i] = p[i + 1] = p[i + 2] = v; }
      x.putImageData(d, 0, 0);
      return c;
    },
    async recognize(file, onProgress) {
      if (!this.available()) throw new Error('Moduł OCR nie załadował się (brak internetu?). Wklej tekst paragonu ręcznie.');
      const canvas = this.prep(await this.loadImage(file));
      const worker = await Tesseract.createWorker(FA.config.OCR_LANG, 1, {
        logger: m => { if (m.status === 'recognizing text' && onProgress) onProgress(m.progress); }
      });
      try {
        await worker.setParameters({ tessedit_pageseg_mode: '6', preserve_interword_spaces: '1' });
        const r = await worker.recognize(canvas);
        return r.data.text;
      } finally { await worker.terminate(); }
    }
  };
})();
