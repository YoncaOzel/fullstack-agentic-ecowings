export const REVENUE_MONTHLY = [
  { m: "May", total: 412, eco: 182, standard: 230 },
  { m: "Jun", total: 468, eco: 214, standard: 254 },
  { m: "Jul", total: 601, eco: 302, standard: 299 },
  { m: "Aug", total: 642, eco: 321, standard: 321 },
  { m: "Sep", total: 518, eco: 238, standard: 280 },
  { m: "Oct", total: 474, eco: 212, standard: 262 },
  { m: "Nov", total: 503, eco: 241, standard: 262 },
  { m: "Dec", total: 712, eco: 368, standard: 344 },
  { m: "Jan", total: 598, eco: 297, standard: 301 },
  { m: "Feb", total: 556, eco: 282, standard: 274 },
  { m: "Mar", total: 681, eco: 362, standard: 319 },
  { m: "Apr", total: 758, eco: 418, standard: 340 },
];

export const SPARK_REVENUE = [22, 26, 24, 31, 29, 34, 36, 33, 38, 41, 44, 47];
export const SPARK_USERS   = [12, 14, 14, 17, 18, 17, 20, 22, 21, 24, 26, 28];
export const SPARK_FLIGHTS = [6,  8,  7,  9,  11, 10, 12, 11, 13, 15, 14, 16];
export const SPARK_CARBON  = [4,  5,  6,  5,  8,  9,  11, 10, 13, 14, 16, 18];

export const ORDERS = [
  { id:"EW-2831-04190", pax:"Amelia Kavas",     email:"amelia.k@ecowings.co",    from:"IST", to:"LHR", fromC:"Istanbul — London",      date:"Apr 19, 2026", time:"09:40", cabin:"Business",    status:"Confirmed", amount:1842 },
  { id:"EW-2831-04188", pax:"Jonas Weber",      email:"jonas.w@finn-air.de",     from:"FRA", to:"JFK", fromC:"Frankfurt — New York",   date:"Apr 19, 2026", time:"10:05", cabin:"Premium Eco", status:"Confirmed", amount:2214 },
  { id:"EW-2831-04186", pax:"Lucía Fernández",  email:"l.fernandez@uam.es",      from:"MAD", to:"DXB", fromC:"Madrid — Dubai",         date:"Apr 19, 2026", time:"11:15", cabin:"Economy",     status:"Pending",   amount:612 },
  { id:"EW-2831-04185", pax:"Takeshi Morita",   email:"takeshi.m@keio.jp",       from:"NRT", to:"SIN", fromC:"Tokyo — Singapore",      date:"Apr 19, 2026", time:"13:20", cabin:"First",       status:"Confirmed", amount:3960 },
  { id:"EW-2831-04182", pax:"Selin Yıldız",     email:"selin.y@ecowings.co",     from:"IST", to:"CDG", fromC:"Istanbul — Paris",       date:"Apr 19, 2026", time:"14:50", cabin:"Business",    status:"Cancelled", amount:1420 },
  { id:"EW-2831-04179", pax:"Marcus Okonkwo",   email:"m.okonkwo@lagos-u.ng",    from:"LOS", to:"LHR", fromC:"Lagos — London",         date:"Apr 19, 2026", time:"16:00", cabin:"Economy",     status:"Confirmed", amount:884 },
  { id:"EW-2831-04177", pax:"Priya Raghavan",   email:"priya.r@tata-consult.in", from:"BOM", to:"DXB", fromC:"Mumbai — Dubai",         date:"Apr 19, 2026", time:"17:30", cabin:"Premium Eco", status:"Pending",   amount:1196 },
  { id:"EW-2831-04175", pax:"Noah Bergström",   email:"noah.b@novnord.se",       from:"ARN", to:"SFO", fromC:"Stockholm — S. Francisco",date:"Apr 19, 2026", time:"19:10", cabin:"Business",   status:"Confirmed", amount:2780 },
  { id:"EW-2831-04171", pax:"Hana Park",        email:"hana.p@gangnam-med.kr",   from:"ICN", to:"CDG", fromC:"Seoul — Paris",          date:"Apr 18, 2026", time:"22:20", cabin:"Business",    status:"Confirmed", amount:2410 },
  { id:"EW-2831-04168", pax:"Omar Al-Sayed",    email:"o.alsayed@gulf-hold.ae",  from:"DXB", to:"JFK", fromC:"Dubai — New York",       date:"Apr 18, 2026", time:"21:10", cabin:"First",       status:"Confirmed", amount:4820 },
  { id:"EW-2831-04166", pax:"Emma Johansson",   email:"emma.j@copenhagen.dk",    from:"CPH", to:"BCN", fromC:"Copenhagen — Barcelona", date:"Apr 18, 2026", time:"18:45", cabin:"Economy",     status:"Confirmed", amount:392 },
  { id:"EW-2831-04162", pax:"Diego Mendes",     email:"d.mendes@saopaulo.br",    from:"GRU", to:"LHR", fromC:"São Paulo — London",     date:"Apr 18, 2026", time:"17:30", cabin:"Premium Eco", status:"Cancelled", amount:1604 },
  { id:"EW-2831-04159", pax:"Chloé Beaumont",   email:"chloe.b@sorbonne.fr",     from:"CDG", to:"IST", fromC:"Paris — Istanbul",       date:"Apr 18, 2026", time:"16:10", cabin:"Economy",     status:"Confirmed", amount:418 },
  { id:"EW-2831-04156", pax:"Ahmed Qureshi",    email:"a.qureshi@karachi-u.pk",  from:"KHI", to:"DXB", fromC:"Karachi — Dubai",        date:"Apr 18, 2026", time:"13:50", cabin:"Economy",     status:"Pending",   amount:312 },
  { id:"EW-2831-04151", pax:"Maya Lindqvist",   email:"maya.l@ecowings.co",      from:"ARN", to:"NRT", fromC:"Stockholm — Tokyo",      date:"Apr 18, 2026", time:"11:40", cabin:"Business",    status:"Confirmed", amount:3140 },
];

export const ROUTES_TOP = [
  { pair:"IST → LHR", pct:94, n:412 },
  { pair:"FRA → JFK", pct:82, n:358 },
  { pair:"MAD → DXB", pct:71, n:311 },
  { pair:"CDG → NRT", pct:64, n:280 },
  { pair:"IST → CDG", pct:58, n:253 },
  { pair:"AMS → SIN", pct:47, n:204 },
];

export const CHANNELS = [
  { name:"Mobile",      pct:58, n:3812, color:"#1B3D2F" },
  { name:"Web",         pct:31, n:2041, color:"#2D6A4F" },
  { name:"Partner API", pct:8,  n:528,  color:"#7AAA8A" },
  { name:"Agents",      pct:3,  n:196,  color:"#CDE2D2" },
];

export const FEED = [
  { t:"2m ago",  tone:"mint",  title:"New booking · EW-2831-04190",  sub:"Amelia Kavas · IST → LHR · Business · $1,842" },
  { t:"14m ago", tone:"green", title:"Carbon offset purchased",       sub:"Jonas Weber opted into the reforestation bundle (+48kg CO₂)" },
  { t:"38m ago", tone:"amber", title:"Pending payment flagged",       sub:"EW-2831-04186 · MAD → DXB · waiting on 3DS verification" },
  { t:"1h ago",  tone:"green", title:"Route EW-7 restored",           sub:"Istanbul → Athens resumed after weather hold" },
  { t:"2h ago",  tone:"red",   title:"Refund processed",              sub:"EW-2831-04182 · Selin Yıldız · $1,420 reversed to card ···4421" },
  { t:"3h ago",  tone:"mint",  title:"Tier milestone – 200 users",    sub:"Monthly active Gold tier users crossed 200 for the first time" },
];

export const USERS = [
  { id:"U-00841", name:"Amelia Kavas",    email:"amelia.k@ecowings.co",   city:"Istanbul, TR", tier:"Platinum", trips:128, miles:1842300, spend:412820, status:"Active",    joined:"Mar 4, 2022",  last:"2m ago" },
  { id:"U-00840", name:"Jonas Weber",     email:"jonas.w@finn-air.de",    city:"Frankfurt, DE",tier:"Gold",     trips:82,  miles:942110,  spend:214840, status:"Active",    joined:"Jun 12, 2023", last:"14m ago" },
  { id:"U-00839", name:"Lucía Fernández", email:"l.fernandez@uam.es",     city:"Madrid, ES",   tier:"Silver",   trips:41,  miles:412900,  spend:84120,  status:"Active",    joined:"Sep 9, 2024",  last:"38m ago" },
  { id:"U-00838", name:"Takeshi Morita",  email:"takeshi.m@keio.jp",      city:"Tokyo, JP",    tier:"Platinum", trips:204, miles:2914800, spend:612480, status:"Active",    joined:"Jan 11, 2021", last:"1h ago" },
  { id:"U-00837", name:"Selin Yıldız",    email:"selin.y@ecowings.co",    city:"Ankara, TR",   tier:"Gold",     trips:68,  miles:821600,  spend:184210, status:"Suspended", joined:"Feb 28, 2023", last:"2h ago" },
  { id:"U-00836", name:"Marcus Okonkwo",  email:"m.okonkwo@lagos-u.ng",   city:"Lagos, NG",    tier:"Silver",   trips:22,  miles:184200,  spend:42800,  status:"Active",    joined:"Nov 3, 2024",  last:"5h ago" },
  { id:"U-00835", name:"Priya Raghavan",  email:"priya.r@tata-consult.in",city:"Mumbai, IN",   tier:"Gold",     trips:54,  miles:612300,  spend:142090, status:"Active",    joined:"Aug 16, 2023", last:"1d ago" },
  { id:"U-00834", name:"Noah Bergström",  email:"noah.b@novnord.se",      city:"Stockholm, SE",tier:"Platinum", trips:118, miles:1512400, spend:318840, status:"Active",    joined:"Apr 22, 2022", last:"2d ago" },
  { id:"U-00833", name:"Hana Park",       email:"hana.p@gangnam-med.kr",  city:"Seoul, KR",    tier:"Gold",     trips:74,  miles:898210,  spend:198320, status:"Active",    joined:"May 4, 2023",  last:"2d ago" },
  { id:"U-00832", name:"Omar Al-Sayed",   email:"o.alsayed@gulf-hold.ae", city:"Dubai, AE",    tier:"Platinum", trips:142, miles:1921400, spend:584120, status:"Active",    joined:"Oct 18, 2021", last:"3d ago" },
  { id:"U-00831", name:"Emma Johansson",  email:"emma.j@copenhagen.dk",   city:"Copenhagen, DK",tier:"Basic",  trips:8,   miles:42900,   spend:8420,   status:"Invited",   joined:"Apr 10, 2026", last:"Never" },
  { id:"U-00830", name:"Diego Mendes",    email:"d.mendes@saopaulo.br",   city:"São Paulo, BR",tier:"Silver",  trips:31,  miles:312800,  spend:68420,  status:"Active",    joined:"Dec 5, 2023",  last:"4d ago" },
];

export const BOOKINGS_BY_WEEK = [318, 342, 394, 412, 388, 426, 451, 472, 446, 492, 514, 548];
export const CANCEL_BY_WEEK   = [28, 24, 32, 18, 26, 22, 19, 24, 30, 22, 18, 16];

export const CABIN_MIX = [
  { name:"Economy",     pct:52, color:"#1B3D2F" },
  { name:"Premium Eco", pct:21, color:"#2D6A4F" },
  { name:"Business",    pct:22, color:"#7AAA8A" },
  { name:"First",       pct:5,  color:"#CDE2D2" },
];

export const GEO = [
  { region:"Europe",        pct:38, n:10794 },
  { region:"Asia Pacific",  pct:27, n:7671 },
  { region:"North America", pct:19, n:5398 },
  { region:"Middle East",   pct:9,  n:2557 },
  { region:"Africa",        pct:4,  n:1136 },
  { region:"South America", pct:3,  n:852 },
];

export const CARBON_MONTHLY = [98, 112, 124, 118, 136, 152, 168, 174, 162, 178, 194, 214];

export const DEVICE_FUNNEL = [
  { stage:"Visited",   n:418200 },
  { stage:"Searched",  n:212480 },
  { stage:"Selected",  n:98420 },
  { stage:"Paid",      n:28412 },
  { stage:"Flown",     n:24180 },
];

export const ROLES = [
  { role:"Super Admin", n:3,  color:"#1B3D2F" },
  { role:"Ops Manager", n:12, color:"#2D6A4F" },
  { role:"Support",     n:28, color:"#7AAA8A" },
  { role:"Analyst",     n:9,  color:"#CDE2D2" },
];
