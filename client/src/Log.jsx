import Anser from 'anser';
import { useMemo } from 'react';

function createStyle(bundle) {
  const style = {};
  if (bundle.bg) {
    style.backgroundColor = `rgb(${bundle.bg})`;
  }
  if (bundle.fg) {
    style.color = `rgb(${bundle.fg})`;
  }
  switch (bundle.decoration) {
    case 'bold':
      style.fontWeight = 'bold';
      break;
    case 'dim':
      style.opacity = '0.5';
      break;
    case 'italic':
      style.fontStyle = 'italic';
      break;
    case 'hidden':
      style.visibility = 'hidden';
      break;
    case 'strikethrough':
      style.textDecoration = 'line-through';
      break;
    case 'underline':
      style.textDecoration = 'underline';
      break;
    case 'blink':
      style.textDecoration = 'blink';
      break;
    default:
      break;
  }
  return style;
}

function Log({ style, className, children }) {
  const logs = `${children ?? ''}`;

  const bundles = useMemo(() => Anser.ansiToJson(logs), [logs]);

  return (
    <pre style={style} className={className}>
      {bundles.map((bundle, i) => (
        <span key={i} style={createStyle(bundle)}>
          {bundle.content}
        </span>
      ))}
    </pre>
  );
}

export default Log;
