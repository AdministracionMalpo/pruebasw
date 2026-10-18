// Íconos de línea propios del portal (24×24, trazo).
const P: Record<string, string> = {
home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.5"/>',
history:'<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/><path d="M12 8v4l3 2"/>',
hour:'<path d="M6 3h12M6 21h12"/><path d="M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
inbox:'<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h5"/>',
doc:'<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/>',
chart:'<path d="M4 20V11M10 20V5M16 20v-8M21 20H3"/>',
shield:'<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
device:'<rect x="2" y="4" width="14" height="10" rx="1"/><rect x="17" y="8" width="5" height="12" rx="1"/><path d="M6 18h6"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
finger:'<path d="M7.5 6.5A6 6 0 0 1 18 10.5v2"/><path d="M6 10.5v3a9 9 0 0 0 1.5 5"/><path d="M9 11a3 3 0 0 1 6 0v3a10 10 0 0 1-1.5 5.5"/><path d="M12 11v3.5a7 7 0 0 1-2 5"/><path d="M18 15.5a12 12 0 0 1-.8 4"/>',
check:'<path d="M4 12.5l5 5L20 6.5"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
bell:'<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
cal:'<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/>',
users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.5.5 4 2.5 4 6"/>',
swap:'<path d="M4 8h14l-4-4M20 16H6l4 4"/>',
exit:'<path d="M10 4H5v16h5"/><path d="M14 8l4 4-4 4M18 12H9"/>',
beach:'<path d="M3 21h18"/><path d="M12 21L9.5 10"/><path d="M3 11a9 9 0 0 1 17-3.5z"/>',
chev:'<path d="M9 6l6 6-6 6"/>',
chevl:'<path d="M15 6l-6 6 6 6"/>',
pen:'<path d="M4 20l4-1 11-11-3-3L5 16z"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
pact:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5"/><path d="M9 2h6"/>',
sick:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-4 3-6 7-6 1.5 0 2.8.3 3.9.8"/><circle cx="18" cy="17" r="4"/><path d="M15.5 19.5l5-5"/>',
late:'<rect x="3" y="7" width="14" height="13" rx="2"/><path d="M7 7V4h6v3"/><circle cx="17" cy="17" r="4.5"/><path d="M17 15v2l1.5 1"/>',
eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
upload:'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',
download:'<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 16v4h16v-4"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
pin:'<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
};

export function Icono({ n, s = 18, className = '' }: { n: string; s?: number; className?: string }) {
  return (
    <svg className={'i ' + className} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: P[n] || '' }} />
  );
}
