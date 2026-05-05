const Icon = ({ d, children, size = 17, sw = 1.7, ...rest }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {d && <path d={d} />}
    {children}
  </svg>
);

export const IcoDashboard = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5"/>
    <rect x="14" y="3" width="7" height="5" rx="1.5"/>
    <rect x="14" y="12" width="7" height="9" rx="1.5"/>
    <rect x="3" y="16" width="7" height="5" rx="1.5"/>
  </Icon>
);

export const IcoOrders = (p) => (
  <Icon {...p}>
    <path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h12"/>
    <circle cx="19" cy="18" r="2"/>
  </Icon>
);

export const IcoPlane = (p) => (
  <Icon {...p}>
    <path d="M10.5 21l1.5-6 6 6 2-2-6-6 6-6-2-2-6 6-6-1.5L5 12l4 2 2 4z"/>
  </Icon>
);

export const IcoUsers = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.5"/>
    <path d="M2.5 20c.8-3.4 3.5-5.5 6.5-5.5s5.7 2.1 6.5 5.5"/>
    <circle cx="17" cy="7" r="2.8"/>
    <path d="M16.5 14.5c2.5.2 4.5 2 5 5"/>
  </Icon>
);

export const IcoChart = (p) => (
  <Icon {...p}>
    <path d="M3 3v18h18"/>
    <path d="M7 15l3-4 3 2 5-7"/>
  </Icon>
);

export const IcoSettings = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.7 1.7 0 0 0 .4 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.4 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.9.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .4-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.4-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.9-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.4 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z"/>
  </Icon>
);

export const IcoSearch = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7"/>
    <path d="M20 20l-3.5-3.5"/>
  </Icon>
);

export const IcoBell = (p) => (
  <Icon {...p}>
    <path d="M6 8a6 6 0 0 1 12 0v5l1.5 3H4.5L6 13z"/>
    <path d="M10 20a2 2 0 0 0 4 0"/>
  </Icon>
);

export const IcoMsg = (p) => (
  <Icon {...p}>
    <path d="M4 5h16v11H8l-4 4z"/>
  </Icon>
);

export const IcoHelp = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9"/>
    <path d="M9.5 9.5a2.5 2.5 0 0 1 5 .2c0 1.3-1 1.8-2 2.4-.6.4-1 .9-1 1.9"/>
    <circle cx="12" cy="18" r=".9" fill="currentColor"/>
  </Icon>
);

export const IcoChevron = (p) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6"/>
  </Icon>
);

export const IcoUp = (p) => (
  <Icon {...p}>
    <path d="M5 15l7-7 7 7"/>
  </Icon>
);

export const IcoDown = (p) => (
  <Icon {...p}>
    <path d="M5 9l7 7 7-7"/>
  </Icon>
);

export const IcoDollar = (p) => (
  <Icon {...p}>
    <path d="M12 3v18"/>
    <path d="M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 2.5 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3"/>
  </Icon>
);

export const IcoLeaf = (p) => (
  <Icon {...p}>
    <path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16z"/>
    <path d="M4 20c4-6 8-10 14-12"/>
  </Icon>
);

export const IcoTicket = (p) => (
  <Icon {...p}>
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/>
    <path d="M10 6v12" strokeDasharray="2 2"/>
  </Icon>
);

export const IcoExport = (p) => (
  <Icon {...p}>
    <path d="M12 3v12"/>
    <path d="M7 8l5-5 5 5"/>
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>
  </Icon>
);

export const IcoCalendar = (p) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2"/>
    <path d="M3 10h18"/>
    <path d="M8 3v4M16 3v4"/>
  </Icon>
);

export const IcoFilter = (p) => (
  <Icon {...p}>
    <path d="M4 5h16l-6 8v5l-4 2v-7z"/>
  </Icon>
);

export const IcoPlus = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14"/>
  </Icon>
);

export const IcoMore = (p) => (
  <Icon {...p}>
    <circle cx="5" cy="12" r="1.3" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.3" fill="currentColor"/>
    <circle cx="19" cy="12" r="1.3" fill="currentColor"/>
  </Icon>
);

export const IcoGlobe = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9"/>
    <path d="M3 12h18"/>
    <path d="M12 3a14 14 0 0 1 0 18"/>
    <path d="M12 3a14 14 0 0 0 0 18"/>
  </Icon>
);

export const IcoSliders = (p) => (
  <Icon {...p}>
    <path d="M4 7h10M18 7h2"/>
    <path d="M4 17h4M12 17h8"/>
    <circle cx="16" cy="7" r="2"/>
    <circle cx="10" cy="17" r="2"/>
  </Icon>
);

export const IcoNetwork = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="5" r="2"/>
    <circle cx="5" cy="19" r="2"/>
    <circle cx="19" cy="19" r="2"/>
    <path d="M12 7v4M12 11l-5 6M12 11l5 6"/>
  </Icon>
);

export const IcoLeafBrand = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M4 18c0-8 6-14 16-14 0 10-6 16-16 16z"/>
    <path d="M4 20c5-5 9-8 16-10" stroke="#06402B" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
  </svg>
);
