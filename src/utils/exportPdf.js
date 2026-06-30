import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Màu thương hiệu SignMate (tím).
const BRAND = [124, 58, 237];      // #7C3AED
const BRAND_LIGHT = [243, 238, 255]; // nền tím nhạt cho block AI
const TEXT_MUTED = 120;

// Font Roboto nhúng để PDF hiển thị đúng dấu tiếng Việt (font mặc định của jsPDF không hỗ trợ).
// CHỈ có bản Regular — không gọi setFont('Roboto','bold') (sẽ fallback font vỡ dấu); nhấn mạnh bằng cỡ/màu.
let _robotoBase64 = null;
// Logo nạp lazy (base64 + tỉ lệ) y như font, tránh phình bundle chính.
let _logo = null; // { dataUrl, ratio }

async function ensureVietnameseFont(doc) {
  if (!_robotoBase64) {
    const buf = await (await fetch('/fonts/Roboto-Regular.ttf')).arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    _robotoBase64 = btoa(binary);
  }
  doc.addFileToVFS('Roboto-Regular.ttf', _robotoBase64);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.setFont('Roboto');
}

async function ensureLogo() {
  if (_logo) return _logo;
  try {
    const blob = await (await fetch('/logo.01.png')).blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    const ratio = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1);
      img.onerror = () => resolve(1);
      img.src = dataUrl;
    });
    _logo = { dataUrl, ratio };
  } catch {
    _logo = null; // không có logo cũng không sao — header vẫn render phần chữ
  }
  return _logo;
}

/** Header thương hiệu: logo + tên + gạch tím. Trả về toạ độ y sau header. */
async function drawBrandHeader(doc, marginX, pageWidth) {
  let y = 14;
  const logo = await ensureLogo();
  let textX = marginX;

  if (logo) {
    const h = 11; // mm
    const w = Math.min(28, h * logo.ratio);
    try {
      doc.addImage(logo.dataUrl, 'PNG', marginX, y - 3, w, h);
      textX = marginX + w + 5;
    } catch {
      textX = marginX;
    }
  }

  doc.setFontSize(17);
  doc.setTextColor(...BRAND);
  doc.text('SignMate', textX, y + 5);
  doc.setFontSize(9);
  doc.setTextColor(TEXT_MUTED);
  doc.text('Nền tảng học Ngôn ngữ Ký hiệu', textX, y + 10);

  y += 16;
  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.6);
  doc.line(marginX, y, pageWidth - marginX, y);
  doc.setTextColor(0);
  return y + 8;
}

/** Footer mọi trang: gạch mảnh + tên thương hiệu + thời điểm xuất + số trang. */
function drawFooters(doc, marginX, pageWidth, pageHeight) {
  const total = doc.getNumberOfPages();
  const stamp = new Date().toLocaleString('vi-VN');
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    const yf = pageHeight - 10;
    doc.setDrawColor(220);
    doc.setLineWidth(0.2);
    doc.line(marginX, yf - 3, pageWidth - marginX, yf - 3);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`SignMate • Xuất lúc ${stamp}`, marginX, yf);
    doc.text(`Trang ${i}/${total}`, pageWidth - marginX, yf, { align: 'right' });
  }
  doc.setTextColor(0);
}

/**
 * Xuất một báo cáo PDF từ dữ liệu thật của trang, có thương hiệu + (tùy chọn) tóm tắt AI.
 * @param {object} opts
 * @param {string} opts.title       Tiêu đề báo cáo
 * @param {string} [opts.subtitle]  Mô tả phụ
 * @param {string} [opts.fileName]  Tên file (.pdf)
 * @param {object} [opts.aiSummary] Tóm tắt điều hành AI: { summary, positives?, concerns?, recommendations? }
 * @param {{label:string, value:any}[]} [opts.summary]  Bảng chỉ số tổng quan
 * @param {{heading?:string, columns:string[], rows:(string|number)[][]}[]} [opts.tables]  Các bảng chi tiết
 */
export async function exportReportPdf({ title, subtitle, fileName, aiSummary = null, summary = [], tables = [] }) {
  const doc = new jsPDF();
  await ensureVietnameseFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;

  let y = await drawBrandHeader(doc, marginX, pageWidth);

  doc.setFontSize(18);
  doc.text(title, marginX, y);
  y += 8;

  if (subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(TEXT_MUTED);
    doc.text(doc.splitTextToSize(subtitle, pageWidth - marginX * 2), marginX, y);
    y += 7;
    doc.setTextColor(0);
  }

  const headStyles = { fillColor: BRAND, textColor: 255, font: 'Roboto' };
  const bodyStyles = { font: 'Roboto', fontSize: 10 };

  // ── Block tóm tắt điều hành (AI) ──
  if (aiSummary && aiSummary.summary) {
    y += 2;
    const lines = doc.splitTextToSize(aiSummary.summary, pageWidth - marginX * 2 - 8);
    const bullets = [];
    const pushAll = (label, arr) => (arr || []).forEach((t) => bullets.push(`${label} ${t}`));
    pushAll('✓', aiSummary.positives);
    pushAll('!', aiSummary.concerns);
    pushAll('→', aiSummary.recommendations);
    const bulletLines = bullets.flatMap((b) => doc.splitTextToSize(b, pageWidth - marginX * 2 - 8));

    const boxH = 12 + lines.length * 5 + (bulletLines.length ? 4 + bulletLines.length * 5 : 0);
    doc.setFillColor(...BRAND_LIGHT);
    doc.roundedRect(marginX, y, pageWidth - marginX * 2, boxH, 2, 2, 'F');

    let ty = y + 7;
    doc.setFontSize(11);
    doc.setTextColor(...BRAND);
    doc.text('Tóm tắt điều hành (AI)', marginX + 4, ty);
    ty += 6;
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(lines, marginX + 4, ty);
    ty += lines.length * 5;
    if (bulletLines.length) {
      ty += 3;
      doc.setTextColor(70);
      doc.setFontSize(9);
      doc.text(bulletLines, marginX + 4, ty);
    }
    doc.setTextColor(0);
    y += boxH + 8;
  }

  doc.setFontSize(9);
  doc.setTextColor(150);
  y += 0;
  doc.setTextColor(0);

  if (summary.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Chỉ số', 'Giá trị']],
      body: summary.map(s => [s.label, String(s.value)]),
      theme: 'striped',
      headStyles,
      styles: bodyStyles,
      margin: { left: marginX, right: marginX },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  tables.forEach(t => {
    if (t.heading) {
      doc.setFontSize(13);
      doc.setTextColor(...BRAND);
      doc.text(t.heading, marginX, y);
      doc.setTextColor(0);
      y += 5;
    }
    autoTable(doc, {
      startY: y,
      head: [t.columns],
      body: t.rows,
      theme: 'grid',
      headStyles,
      styles: { font: 'Roboto', fontSize: 9 },
      margin: { left: marginX, right: marginX },
    });
    y = doc.lastAutoTable.finalY + 10;
  });

  drawFooters(doc, marginX, pageWidth, pageHeight);

  doc.save(fileName || `${title}.pdf`);
}
