const MONTHS = ["Mai", "Jun", "Jul", "Ago", "Set", "Out"];
const VALUES = [2140, 2680, 2390, 3150, 3720, 4310];

// Gráfico de barras em SVG (dados de exemplo). Na Entrega 4 usa as vendas reais.
export function SalesChart() {
  const W = 520;
  const H = 210;
  const padLeft = 44;
  const padBottom = 26;
  const padTop = 14;
  const max = 5000;
  const barWidth = 40;
  const step = (W - padLeft - 10) / VALUES.length;
  const plotH = H - padTop - padBottom;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Vendas por mês em reais, de maio a outubro"
    >
      {[0, 1250, 2500, 3750, 5000].map((v) => {
        const y = padTop + plotH * (1 - v / max);
        return (
          <g key={v}>
            <line x1={padLeft} x2={W - 6} y1={y} y2={y} stroke="var(--line)" />
            <text x={padLeft - 6} y={y + 4} textAnchor="end">
              {v}
            </text>
          </g>
        );
      })}
      {VALUES.map((v, i) => {
        const h = (plotH * v) / max;
        const x = padLeft + step * i + (step - barWidth) / 2;
        const y = H - padBottom - h;
        const last = i === VALUES.length - 1;
        return (
          <g key={MONTHS[i]}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={3}
              fill={last ? "var(--accent)" : "var(--soft)"}
              stroke="var(--accent)"
              strokeWidth={1}
            />
            <text x={x + barWidth / 2} y={H - 8} textAnchor="middle">
              {MONTHS[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
