// lib/mock-data.ts
export const STATS = [
  { label: "Trips planned", value: "600k+" },
  { label: "Average savings", value: "$1,200" },
  { label: "Travel advisors", value: "2,500+" },
  { label: "Countries covered", value: "120+" },
];

export const ADVISOR_STORIES = [
  {
    id: 1,
    text: "My NOMA advisor planned a two-week trip across Japan that was flawless. Every ryokan, every train, every hidden sushi counter — curated to perfection.",
    advisorName: "Sarah Chen",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    imageUrl: "https://images.unsplash.com/photo-1554797589-7241bb691973?q=80",
  },
  {
    id: 2,
    text: "We wanted a safari that felt exclusive, not commercial. Our advisor delivered beyond what we imagined — private conservancies, sunrise balloon rides, the works.",
    advisorName: "James Okafor",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    imageUrl: "https://images.unsplash.com/photo-1759129669580-e1e9ae3c078b?q=80",
  },
  {
    id: 3,
    text: "Traveling with kids can be stressful, but our advisor thought of everything — adjoining suites, kid-friendly excursions, and even a surprise birthday cake in Santorini.",
    advisorName: "Priya Mehta",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80",
  },
  {
    id: 4,
    text: "I've booked luxury hotels on my own for years, but the room upgrades and VIP perks my NOMA advisor secured were on another level entirely.",
    advisorName: "Michael Torres",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80",
  },
  {
    id: 5,
    text: "Our honeymoon in the Maldives was truly once in a lifetime. From overwater villas to private dining on the beach, every detail was impeccable.",
    advisorName: "Emma Laurent",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
  },
];

export const CATEGORIES = [
  { name: "Hotels", imageUrl: "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?q=80" },
  { name: "Itineraries", imageUrl: "https://images.unsplash.com/photo-1551878736-72273e51025c?q=80" },
  { name: "Cruises", imageUrl: "https://images.unsplash.com/photo-1688269910608-e3c65eb4ac3a?q=80" },
  { name: "Safaris", imageUrl: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?q=80" },
  { name: "Honeymoons", imageUrl: "https://images.unsplash.com/photo-1494137319847-a9592a0e73ed?q=80" },
  { name: "Adventure", imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80" },
  { name: "Wellness", imageUrl: "https://images.unsplash.com/photo-1598468872842-d39d85892daf?q=80" },
  { name: "Family", imageUrl: "https://images.unsplash.com/photo-1687660187066-dc7e95eb3c5e?q=80" },
  { name: "Villas", imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80" },
  { name: "Private Jets", imageUrl: "https://images.unsplash.com/photo-1678419214383-2391a9118c24?q=80" },
  { name: "Yachts", imageUrl: "https://images.unsplash.com/photo-1535024966840-e7424dc2635b?q=80" },
  { name: "Culinary", imageUrl: "https://images.unsplash.com/photo-1593854989775-ae5e4d9e49e9?q=80" },
  { name: "Skiing", imageUrl: "https://images.unsplash.com/photo-1707080193970-b24078d96417?q=80" },
  { name: "Expeditions", imageUrl: "https://images.unsplash.com/photo-1727030117400-f1deca521a32?q=80" },
];

export const GUIDES = [
  {
    id: 1,
    title: "The Ultimate Guide to the Amalfi Coast",
    author: "Sophia Reyes",
    imageUrl: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=600&h=750&fit=crop",
    tag: "Beaches",
    slug: "amalfi-coast-guide",
    content: `
      <h2>Introduction</h2>
      <p>The Amalfi Coast, with its dramatic cliffs dropping into azure waters and charming pastel-colored villages, is the epitome of the Italian dolce vita. Whether you're seeking a romantic getaway, a culinary adventure, or a journey through ancient ruins, this UNESCO World Heritage Site offers an unforgettable experience.</p>
      <img src="https://images.unsplash.com/photo-1516483638261-f40889eba1e2?q=80&w=2000&auto=format&fit=crop" alt="Positano coastline at sunset" />
      <h2>Where to Stay</h2>
      <p>For the ultimate luxury experience, Positano and Ravello offer some of the world's most spectacular hotels. In Positano, look for cliffside hotels with private balconies overlooking the Mediterranean. In Ravello, historic villas transformed into five-star resorts offer a more tranquil, refined atmosphere away from the bustling crowds.</p>
      <img src="https://images.unsplash.com/photo-1540615555198-d1ff04874051?q=80&w=2000&auto=format&fit=crop" alt="Luxury hotel balcony over the Mediterranean" />
      <h2>What to Eat</h2>
      <p>The local cuisine is a celebration of the sea and the sun. Do not miss the chance to savor fresh seafood pasta, incredibly sweet local tomatoes, and the region's famous Neapolitan-style pizza. Finish every meal with a glass of ice-cold Limoncello, made from the sprawling lemon groves that dot the coastal cliffs.</p>
      <h2>Must-Do Activities</h2>
      <p>Chartering a private boat to explore hidden coves and grottos is absolutely essential. A drive (or better yet, a chauffeur-driven ride) along the Amalfi Drive offers breathtaking vistas at every turn. For the active traveler, the Path of the Gods hiking trail provides panoramic views that are simply unparalleled.</p>
    `
  },
  {
    id: 2,
    title: "Safari Planning: From Serengeti to Kruger",
    author: "James Okafor",
    imageUrl: "https://images.unsplash.com/photo-1759129669580-e1e9ae3c078b?q=80",
    tag: "Nature Getaway",
    slug: "safari-planning",
    content: `
      <h2>Choosing Your Safari Destination</h2>
      <p>Planning a safari can be overwhelming given the vast choices across the African continent. For first-timers looking to witness the Great Migration, the Serengeti in Tanzania and the Maasai Mara in Kenya are incomparable. For those seeking luxury lodges and high chances of spotting the Big Five in a single day, South Africa's Kruger National Park and its surrounding private reserves are top choices.</p>
      <img src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2000&auto=format&fit=crop" alt="Elephant walking through the savanna" />
      <h2>When to Go</h2>
      <p>Timing is everything. In East Africa, the Great Migration typically crosses the Mara River between July and October. In Southern Africa, the dry season (May to September) is generally considered the best time for wildlife viewing, as animals congregate around water sources and the vegetation is thinner, making them easier to spot.</p>
      <img src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?q=80&w=2000&auto=format&fit=crop" alt="Luxury safari tent interior" />
      <h2>What to Expect</h2>
      <p>A typical luxury safari involves early morning game drives as the sun rises, followed by a hearty breakfast back at camp. The midday heat is spent relaxing by your private plunge pool or enjoying a spa treatment. As the afternoon cools, another game drive begins, usually culminating in a classic "sundowner" — sipping your favorite cocktail out in the bush as the sun sets over the savanna.</p>
    `
  },
  {
    id: 3,
    title: "Island-Hopping the Greek Cyclades",
    author: "Elena Papadimitriou",
    imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&h=750&fit=crop",
    tag: "Honeymoons",
    slug: "island-hopping-cyclades",
    content: `
      <h2>The Magic of the Cyclades</h2>
      <p>The Cyclades are a mesmerising archipelago in the Aegean Sea, famous for their stark white architecture, blue-domed churches, and crystal-clear waters. While Santorini and Mykonos steal the spotlight, a well-planned island-hopping itinerary reveals the diverse character of this region.</p>
      <img src="https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2000&auto=format&fit=crop" alt="Santorini blue domes and white architecture" />
      <h2>Santorini: The Romantic Escape</h2>
      <p>Begin your journey in Santorini. The caldera views from Oia and Imerovigli are legendary for good reason. Opt for a suite with a private plunge pool on the caldera edge. Spend your days wine tasting at local vineyards — enjoying the unique crispness of the Assyrtiko grape — and sailing on a luxury catamaran at sunset.</p>
      <h2>Mykonos: Chic and Lively</h2>
      <p>Next, take a high-speed ferry to Mykonos. Known for its upscale beach clubs and vibrant nightlife, Mykonos is where the cosmopolitan crowd gathers. Stroll through the labyrinthine streets of Mykonos Town, dine at exclusive seaside restaurants, and relax at stylish beach clubs like Scorpios or Nammos.</p>
      <img src="https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?q=80&w=2000&auto=format&fit=crop" alt="Greek island seaside dining" />
      <h2>Paros & Naxos: Authentic Charm</h2>
      <p>To balance the glamorous rush of Mykonos and Santorini, include quieter islands like Paros or Naxos. These islands offer pristine beaches, authentic mountain villages, and incredible farm-to-table cuisine without the immense crowds, allowing for a more intimate experience of Greek island life.</p>
    `
  },
  {
    id: 4,
    title: "A Week in Kyoto: Temples, Tea & Tranquility",
    author: "Sarah Chen",
    imageUrl: "https://images.unsplash.com/photo-1554797589-7241bb691973?q=80",
    tag: "Arts and Culture",
    slug: "kyoto-temples",
    content: `
      <h2>Embracing Kyoto's Heritage</h2>
      <p>Kyoto, Japan's cultural heart, is a city where ancient traditions seamlessly blend with modern life. With over 1,000 temples and shrines, navigating Kyoto requires a thoughtful pace to truly absorb its Zen-like atmosphere.</p>
      <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop" alt="Traditional Japanese street in Kyoto" />
      <h2>Iconic Sights</h2>
      <p>Start with the must-sees: the golden pavilion of Kinkaku-ji, the mesmerizing thousands of vermilion torii gates at Fushimi Inari Taisha, and the towering bamboo grove in Arashiyama. To avoid crowds, opt for early morning visits or arrange private access tours through our concierge.</p>
      <h2>The Art of Kaiseki</h2>
      <p>Kyoto is the birthplace of kaiseki — a multi-course traditional dinner that is as much a work of art as it is a meal. Dining in an intimate tatami room overlooking a meticulously raked Zen garden is an essential Kyoto experience. The seasonal ingredients and exquisite presentation reflect the Japanese philosophy of harmony with nature.</p>
      <img src="https://images.unsplash.com/photo-1580442151529-343f2f6e0e27?q=80&w=2000&auto=format&fit=crop" alt="Exquisite Kaiseki meal presentation" />
      <h2>Tea Ceremonies and Ryokans</h2>
      <p>Immerse yourself further by participating in a private tea ceremony in a historic machiya (traditional wooden townhouse). For accommodation, spending at least a couple of nights in a luxury ryokan, complete with private onsen (hot spring baths), provides a deeply restorative and authentic Japanese hospitality experience.</p>
    `
  },
  {
    id: 5,
    title: "Patagonia: Trekking at the End of the World",
    author: "Carlos Mendez",
    imageUrl: "https://images.unsplash.com/photo-1531761535209-180857e963b9?w=600&h=750&fit=crop",
    tag: "Nature Getaway",
    slug: "patagonia-trekking",
    content: `
      <h2>The Wild Frontier</h2>
      <p>Patagonia, spanning the southern reaches of Chile and Argentina, offers some of the most dramatic and awe-inspiring landscapes on the planet. From towering granite spires and massive glaciers to pristine turquoise lakes, it is a paradise for adventurers and nature lovers.</p>
      <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop" alt="Torres del Paine national park" />
      <h2>Torres del Paine (Chile)</h2>
      <p>In Chilean Patagonia, Torres del Paine National Park is the crown jewel. For luxury travelers, several incredible eco-lodges situated just outside the park's borders offer spectacular views, world-class cuisine, and expert-guided excursions ranging from the intense W-Trek to more leisurely horseback rides among guanaco herds.</p>
      <h2>Los Glaciares (Argentina)</h2>
      <p>Across the border in Argentina, Los Glaciares National Park is home to the stunning Perito Moreno Glacier. Watching massive chunks of ice calve off the glacier face into the water perfectly illustrates the raw power of nature. Farther north, the town of El Chaltén serves as the basecamp for iconic treks to Mount Fitz Roy.</p>
      <img src="https://images.unsplash.com/photo-1533923156502-be31530547c4?q=80&w=2000&auto=format&fit=crop" alt="Perito Moreno Glacier ice wall" />
      <h2>Packing and Preparation</h2>
      <p>The weather in Patagonia is notoriously unpredictable; you might experience all four seasons in a single hour. Layering is key, with high-quality windproof and waterproof gear being non-negotiable. Despite the rugged environment, modern eco-lodges ensure you return to refined comfort, heated floors, and a glass of excellent Chilean Carménère every evening.</p>
    `
  },
  {
    id: 6,
    title: "The Maldives: Overwater Luxury Redefined",
    author: "Emma Laurent",
    imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=750&fit=crop",
    tag: "Honeymoons",
    slug: "maldives-luxury",
    content: `
      <h2>The Ultimate Seclusion</h2>
      <p>When it comes to pure, unadulterated luxury and relaxation, the Maldives stands in a league of its own. This Indian Ocean archipelago of scattered coral atolls is the undisputed king of the 'one island, one resort' concept, offering unmatched privacy and exclusivity.</p>
      <img src="https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?q=80&w=2000&auto=format&fit=crop" alt="Aerial view of Maldives overwater bungalows" />
      <h2>The Overwater Villa Experience</h2>
      <p>The quintessential Maldivian experience is staying in an overwater villa. Imagine waking up to the gentle sound of the Indian Ocean, sliding open your floor-to-ceiling glass doors, and stepping directly into crystal-clear turquoise waters. Many high-end villas now feature private infinity pools, water slides, and even retractable roofs for stargazing from bed.</p>
      <h2>Under the Surface</h2>
      <p>While relaxing on powdery white sand is a primary draw, the Maldives offers world-class underwater experiences. Snorkeling with gentle manta rays and majestic whale sharks is a transformative experience. Several resorts also feature incredible underwater restaurants and spas, allowing you to dine or relax while surrounded by vibrant marine life.</p>
      <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2000&auto=format&fit=crop" alt="Scuba diving with manta rays" />
      <h2>Bespoke Service</h2>
      <p>What sets the top Maldivian resorts apart is the level of personalized service. Many properties provide a dedicated 'Thakuru' (butler) available 24/7 to handle everything from unpacking your bags to arranging a private castaway picnic on a deserted sandbank. It is this attention to detail that makes a Maldivian vacation truly flawless.</p>
    `
  },
];

export const COMPARISON_FEATURES = [
  { feature: "Personalized itinerary planning", noma: true, creditCard: false, onlineAgency: false },
  { feature: "VIP hotel upgrades & amenities", noma: true, creditCard: true, onlineAgency: false },
  { feature: "24/7 on-trip support", noma: true, creditCard: false, onlineAgency: false },
  { feature: "Exclusive resort access", noma: true, creditCard: false, onlineAgency: false },
  { feature: "Price match guarantee", noma: true, creditCard: false, onlineAgency: true },
  { feature: "Complimentary room upgrades", noma: true, creditCard: true, onlineAgency: false },
  { feature: "Insider destination knowledge", noma: true, creditCard: false, onlineAgency: false },
];

export const PERKS = [
  { title: "Complimentary Upgrades", imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop", description: "Enjoy automatic room upgrades at over 2,000 luxury properties worldwide." },
  { title: "Resort Credits", imageUrl: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&h=400&fit=crop", description: "Receive $100–$500 in resort credits for spa, dining, and experiences." },
  { title: "Early Check-In & Late Checkout", imageUrl: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600&h=400&fit=crop", description: "Arrive on your schedule with priority early check-in and late checkout privileges." },
  { title: "VIP Welcome Amenities", imageUrl: "https://images.unsplash.com/photo-1502899576159-f224dc2349fa?w=600&h=400&fit=crop", description: "Be greeted with a personalized welcome — from champagne to local artisan gifts." },
  { title: "Dedicated Trip Support", imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop", description: "Your advisor is available around the clock, from planning through your return home." },
  { title: "Exclusive Experiences", imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop", description: "Access private tours, chef's tables, and behind-the-scenes cultural experiences." },
];

export const HOW_IT_WORKS_STEPS = [
  { number: "01", title: "Share Your Vision", body: "Tell us your dream destination, travel style, and budget. Our matching system pairs you with the perfect advisor for your trip.", imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80" },
  { number: "02", title: "Get a Tailored Plan", body: "Your advisor crafts a bespoke itinerary with insider access, VIP perks, and every detail handled — from flights to five-star dining.", imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80" },
  { number: "03", title: "Travel with Confidence", body: "Embark on your journey with 24/7 support, knowing every moment has been thoughtfully curated by your dedicated advisor.", imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80" },
];

export const REVIEWS = [
  { id: 1, destination: "Santorini, Greece", clientName: "Amanda R.", date: "October 2025", quote: "Every sunset dinner, every cliffside suite — it was like our advisor read our minds. The best trip we've ever taken.", advisorName: "Elena Papadimitriou", imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80" },
  { id: 2, destination: "Kyoto, Japan", clientName: "David L.", date: "September 2025", quote: "The private temple visits before sunrise and the hidden kaiseki restaurant made this trip truly unforgettable.", advisorName: "Sarah Chen", imageUrl: "https://images.unsplash.com/photo-1554797589-7241bb691973?q=80" },
  { id: 3, destination: "Maasai Mara, Kenya", clientName: "Catherine & Tom W.", date: "August 2025", quote: "We saw the Great Migration from our private conservancy. No crowds, just us and the wildlife. Absolutely magical.", advisorName: "James Okafor", imageUrl: "https://images.unsplash.com/photo-1759129669580-e1e9ae3c078b?q=80" },
  { id: 4, destination: "Amalfi Coast, Italy", clientName: "Rebecca S.", date: "July 2025", quote: "From Ravello to Positano, every villa and restaurant was handpicked perfection. I'm already planning my return.", advisorName: "Sophia Reyes", imageUrl: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800&q=80" },
  { id: 5, destination: "Bora Bora, French Polynesia", clientName: "Mark & Julie P.", date: "November 2025", quote: "The overwater bungalow with a glass floor, private snorkeling excursions — our honeymoon was beyond our wildest dreams.", advisorName: "Emma Laurent", imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80" },
];

export const FOOTER_LINKS = {
  destinations: ["Europe", "Asia", "Africa", "South America", "Caribbean", "Oceania"],
  company: ["About Us", "Careers", "Press", "Blog", "Contact"],
  support: ["Help Center", "Terms of Service", "Privacy Policy", "Accessibility"],
};