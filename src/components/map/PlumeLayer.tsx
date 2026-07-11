import { motion } from "framer-motion";

interface PlumeLayerProps {
  minutes: number;
  visible: boolean;
  uncertaintyVisible: boolean;
}

const layers = [
  { color: "#b92169", opacity: 0.72, inset: 0 },
  { color: "#e73545", opacity: 0.68, inset: 16 },
  { color: "#ff762b", opacity: 0.62, inset: 31 },
  { color: "#efc529", opacity: 0.48, inset: 47 },
  { color: "#81b938", opacity: 0.34, inset: 64 }
];

function plumePath(minutes: number, inset: number) {
  const scale = 0.62 + minutes / 140;
  const end = 230 + 580 * scale - inset;
  const top = 382 - 140 * scale + inset * 0.8;
  const bottom = 382 + 140 * scale - inset * 0.8;
  return `M 128 382 C 235 ${top + 14} ${end - 160} ${top - 8} ${end} ${top + 34} C ${end - 150} 382 ${end - 160} ${bottom + 12} 128 ${bottom - 10} Z`;
}

export function PlumeLayer({ minutes, visible, uncertaintyVisible }: PlumeLayerProps) {
  return (
    <g aria-label="Predicted concentration contours" opacity={visible ? 1 : 0}>
      {uncertaintyVisible && <motion.path d={plumePath(minutes, -24)} fill="none" stroke="#79d7ff" strokeDasharray="10 8" strokeWidth="3" opacity="0.72" />}
      {layers.map((layer) => (
        <motion.path key={layer.color} d={plumePath(minutes, layer.inset)} fill={layer.color} fillOpacity={layer.opacity} stroke={layer.color} strokeWidth="2" strokeOpacity="0.9" />
      ))}
      <motion.path d={plumePath(minutes, 78)} fill="none" stroke="#f4f9fb" strokeWidth="1.5" strokeOpacity="0.48" />
      <motion.g animate={{ x: minutes * 2.5 }} transition={{ duration: 0.65 }}>
        <circle cx="240" cy="382" r="9" fill="#ffd95b" opacity="0.95" />
        <circle cx="320" cy="372" r="5" fill="#ff9262" opacity="0.8" />
        <circle cx="410" cy="390" r="7" fill="#f04b62" opacity="0.78" />
        <circle cx="510" cy="362" r="4" fill="#ffcf57" opacity="0.8" />
      </motion.g>
    </g>
  );
}
