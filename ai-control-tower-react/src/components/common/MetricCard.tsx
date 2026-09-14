import { Card } from '../ui';

export function MetricCard({ label, value, detail, tone = 'purple' }: { label: string; value: string; detail: string; tone?: string }) {
  return <Card className="metric-card"><div className="metric-label">{label}</div><strong className={`metric-value ${tone}`}>{value}</strong><span className="metric-detail">{detail}</span></Card>;
}
