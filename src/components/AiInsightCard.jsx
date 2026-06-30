import React, { useState } from 'react';
import { Sparkles, RefreshCw, Loader2, CheckCircle2, AlertTriangle, Lightbulb, Info } from 'lucide-react';

/**
 * Card hiển thị nhận định AI (Gemini) cho trang quản trị.
 * AI chỉ diễn giải số liệu thật do BE tính sẵn — không gọi mỗi lần load trang:
 * người dùng bấm "Tạo phân tích AI" / "Làm mới" (forceRefresh bỏ qua cache 3h ở BE).
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {(forceRefresh:boolean)=>Promise<any>} props.fetchInsight  Trả AdminInsightDto.
 */
const AiInsightCard = ({ title = 'Phân tích bằng AI', subtitle, fetchInsight }) => {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const load = async (forceRefresh) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchInsight(forceRefresh);
      // Chuẩn hóa camelCase/PascalCase phòng hờ.
      setInsight({
        summary: res?.summary ?? res?.Summary ?? '',
        positives: res?.positives ?? res?.Positives ?? [],
        concerns: res?.concerns ?? res?.Concerns ?? [],
        recommendations: res?.recommendations ?? res?.Recommendations ?? [],
        aiAvailable: res?.aiAvailable ?? res?.AiAvailable ?? false,
        generatedAt: res?.generatedAt ?? res?.GeneratedAt ?? null,
      });
      setLoaded(true);
    } catch (err) {
      setError(err.message || 'Không tạo được phân tích AI.');
    } finally {
      setLoading(false);
    }
  };

  const Group = ({ icon, color, label, items }) => {
    if (!items || items.length === 0) return null;
    return (
      <div style={{ marginTop: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '13px', color, marginBottom: '6px' }}>
          {React.createElement(icon, { size: 15 })} {label}
        </div>
        <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map((t, i) => (
            <li key={i} style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: 1.5 }}>{t}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="card" style={{ position: 'relative', borderLeft: '4px solid var(--primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '4px' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--primary)" /> {title}
          </h3>
          {subtitle && <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--gray-400)' }}>{subtitle}</p>}
        </div>
        <button
          className="btn btn-white btn-sm"
          style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}
          onClick={() => load(loaded)}
          disabled={loading}
        >
          {loading
            ? <Loader2 size={15} className="spinning" />
            : loaded ? <><RefreshCw size={15} /> Làm mới</> : <><Sparkles size={15} /> Tạo phân tích AI</>}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: '12px', padding: '10px 12px', background: 'var(--red-light, #fde8e8)', color: 'var(--red, #c0392b)', borderRadius: '8px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {!loaded && !loading && !error && (
        <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--gray-400)' }}>
          Bấm “Tạo phân tích AI” để hệ thống đọc số liệu thật và đưa ra nhận định, điểm đáng lưu ý và khuyến nghị.
        </p>
      )}

      {loaded && insight && (
        insight.aiAvailable ? (
          <div style={{ marginTop: '12px' }}>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-dark, #1a1a1a)', fontWeight: 600 }}>
              {insight.summary}
            </p>
            <Group icon={CheckCircle2} color="#10b981" label="Điểm tốt" items={insight.positives} />
            <Group icon={AlertTriangle} color="#f59e0b" label="Đáng lưu ý" items={insight.concerns} />
            <Group icon={Lightbulb} color="var(--primary)" label="Khuyến nghị" items={insight.recommendations} />
          </div>
        ) : (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--gray-500)' }}>
            <Info size={15} /> {insight.summary || 'Tính năng AI chưa được cấu hình trên máy chủ.'}
          </div>
        )
      )}
    </div>
  );
};

export default AiInsightCard;
