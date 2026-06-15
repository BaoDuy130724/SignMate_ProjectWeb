import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Font Roboto nhúng để PDF hiển thị đúng dấu tiếng Việt (font mặc định của jsPDF
// không hỗ trợ). Nạp 1 lần khi xuất lần đầu rồi cache, tránh phình bundle chính.
let _robotoBase64 = null;

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

/**
 * Xuất một báo cáo PDF từ dữ liệu thật của trang.
 * @param {object} opts
 * @param {string} opts.title       Tiêu đề báo cáo
 * @param {string} [opts.subtitle]  Mô tả phụ
 * @param {string} [opts.fileName]  Tên file (.pdf)
 * @param {{label:string, value:any}[]} [opts.summary]  Bảng chỉ số tổng quan
 * @param {{heading?:string, columns:string[], rows:(string|number)[][]}[]} [opts.tables]  Các bảng chi tiết
 */
export async function exportReportPdf({ title, subtitle, fileName, summary = [], tables = [] }) {
  const doc = new jsPDF();
  await ensureVietnameseFont(doc);

  const marginX = 14;
  let y = 18;

  doc.setFontSize(18);
  doc.text(title, marginX, y);
  y += 8;

  if (subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text(subtitle, marginX, y);
    y += 6;
    doc.setTextColor(0);
  }

  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(`Xuất lúc: ${new Date().toLocaleString('vi-VN')}`, marginX, y);
  y += 8;
  doc.setTextColor(0);

  const headStyles = { fillColor: [124, 58, 237], font: 'Roboto' };
  const bodyStyles = { font: 'Roboto', fontSize: 10 };

  if (summary.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Chỉ số', 'Giá trị']],
      body: summary.map(s => [s.label, String(s.value)]),
      theme: 'striped',
      headStyles,
      styles: bodyStyles,
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  tables.forEach(t => {
    if (t.heading) {
      doc.setFontSize(13);
      doc.text(t.heading, marginX, y);
      y += 5;
    }
    autoTable(doc, {
      startY: y,
      head: [t.columns],
      body: t.rows,
      theme: 'grid',
      headStyles,
      styles: { font: 'Roboto', fontSize: 9 },
    });
    y = doc.lastAutoTable.finalY + 10;
  });

  doc.save(fileName || `${title}.pdf`);
}
