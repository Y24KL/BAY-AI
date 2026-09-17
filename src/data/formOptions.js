export const COURSES = [
  ["Create Mobile Apps with AI", "Build working apps without writing code"],
  ["Create Realistic Photoshoots with AI", "Studio-quality images with no studio"],
  ["Create Stunning Graphic Designs with AI", "Brand work, flyers, product visuals"],
  ["Create Animation Movies with AI", "Animated stories from a script"],
  ["Create Real Movies with AI", "Live-action scenes and full productions"],
  ["Learn AI VFX", "Explosions, chases and effects shots"],
  ["Learn How to Make Great Music with AI", "Beats, vocals and finished tracks"],
];

export const WORK = [
  "Student",
  "Employed",
  "Self-employed / Business owner",
  "Unemployed, looking for opportunities",
  "Civil servant",
  "Youth corps member",
];

export const LEVELS = [
  "Complete beginner — I have never used design or AI tools",
  "Basic — I am comfortable with a smartphone and social media",
  "Intermediate — I have used Canva, Photoshop or ChatGPT",
  "Advanced — I work in tech, design, media or software",
  "Professional — I already earn from tech or creative work",
];

export const GADGETS = [
  "Windows laptop",
  "MacBook",
  "Android phone",
  "iPhone",
  "Tablet or iPad",
  "Desktop computer",
  "I have no device yet",
];

export const MODES = [
  ["On-site at Ebitari Hotel, Yenagoa", "Attend in person for the full week"],
  ["Online", "Join every session remotely"],
  ["Either one works for me", ""],
];

export const STARTER = ["Yes, I want a starter pack", "No, I am fine without one"];

export const GROUP_LINK = "https://chat.whatsapp.com/F1ovN2T6kaFFKxsgRuPQy1?s=cl&p=i&mlu=4&ilr=4";
export const NOTIFY_EMAIL = "opujoedou@gmail.com";
export const NOTIFY_PHONE = "2348152093040";
export const BANK = { bank: "Parallex Bank", name: "Joseph Opuene", account: "2000033733", amount: "50,000" };

export function emptyForm() {
  return {
    fullname: "", email: "", phone: "", dob: "", gender: "",
    nationality: "Nigerian", stateorigin: "", address: "",
    work: "", occupation: "", orgname: "",
    level: "", gadgets: [], internet: "", starter: "", starterwhat: "",
    courses: [], mode: "", why: "", after: "", special: "",
    payername: "", payref: "", paydate: "", payamount: "50,000",
    dec1: false, dec2: false,
  };
}
