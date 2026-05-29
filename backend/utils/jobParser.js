/**
 * Helper utility to parse job details from Sarkari Result RapidAPI listings.
 * This utility converts raw job titles and details into structured objects
 * that our database and frontend can easily understand.
 */

// 1. Configuration rules to map title keywords to Field, Department, and Skills
const FIELD_CONFIG = {
  SSC: {
    keywords: ["SSC", "STAFF"],
    dept: "Staff Selection Commission (SSC)",
    skills: [
      "Reasoning",
      "Quantitative Aptitude",
      "English",
      "General Awareness",
    ],
  },
  UPSC: {
    keywords: ["UPSC", "UNION PUBLIC"],
    dept: "Union Public Service Commission (UPSC)",
    skills: ["General Studies", "CSAT", "Essay Writing"],
  },
  Banking: {
    keywords: ["BANK", "IBPS", "SBI", "RBI"],
    dept: "Banking Sector",
    skills: [
      "Reasoning",
      "Quantitative Aptitude",
      "English",
      "Banking Awareness",
    ],
  },
  Railway: {
    keywords: ["RAILWAY", "RRB", "RRC", "METRO"],
    dept: "Railway Recruitment Board (RRB)",
    skills: ["Maths", "Reasoning", "General Awareness"],
  },
  Police: {
    keywords: ["POLICE", "CONSTABLE", "SI ", "SUB INSPECTOR"],
    dept: "State Police Department",
    skills: ["General Knowledge", "Physical Ability", "Reasoning"],
  },
  Defence: {
    keywords: ["ARMY", "NAVY", "AIR FORCE", "DEFENCE", "NDA"],
    dept: "Ministry of Defence",
    skills: ["Mathematics", "General Ability", "English"],
  },
  Teaching: {
    keywords: ["TEACH", "SCHOOL", "PROFESSOR", "LECTURE", "TGT", "PGT"],
    dept: "Department of Education",
    skills: ["Pedagogy", "Subject Knowledge", "English"],
  },
  "State PSC": {
    keywords: ["PSC", "PUBLIC SERVICE"],
    dept: "State Public Service Commission",
    skills: ["General Studies", "General Knowledge", "Aptitude"],
  },
  "IT & CS": {
    keywords: ["ENGINEER", "SCIENTIST", "SOFTWARE", "COMPUTER", "IT ", "CSIR"],
    dept: "Research & Information Technology Dept",
    skills: [
      "Programming",
      "Data Structures",
      "Database Management",
      "Networking",
    ],
  },
};

// 2. Configuration rules to map title keywords to required Qualification
const QUAL_CONFIG = [
  { qual: "PhD", keywords: ["PHD", "DOCTORATE"] },
  {
    qual: "Post Graduation",
    keywords: ["POST GRADUATE", "M.TECH", "M.SC", "M.COM", "MASTER"],
  },
  { qual: "Diploma", keywords: ["DIPLOMA", "POLYTECHNIC"] },
  { qual: "ITI", keywords: ["ITI"] },
  { qual: "12th", keywords: ["12TH", "10+2", "INTERMEDIATE"] },
  { qual: "10th", keywords: ["10TH", "MATRIC", "APPRENTICE", "MTS"] },
];

// 3. Configuration rules to map title keywords to Age limits
const AGE_CONFIG = [
  { keywords: ["NDA", "TES"], min: 16, max: 19 },
  { keywords: ["ARMY", "NAVY", "AIR FORCE", "CONSTABLE"], min: 18, max: 25 },
  { keywords: ["BANK PO", "PO "], min: 20, max: 30 },
  { keywords: ["CGL", "GRADUATE"], min: 18, max: 32 },
  { keywords: ["PROFESSOR", "SCIENTIST"], min: 22, max: 45 },
  { keywords: ["APPRENTICE"], min: 18, max: 24 },
];

/**
 * Helper to parse the deadline date. Defaults to 30 days from now if not valid/not announced.
 */
function parseLastDate(lastDateStr) {
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  if (!lastDateStr) return thirtyDaysFromNow;

  const cleaned = lastDateStr.trim().toLowerCase();
  if (
    !cleaned ||
    ["soon", "announce", "coming", "n/a", "na"].some((k) => cleaned.includes(k))
  ) {
    return thirtyDaysFromNow;
  }

  const parsedDate = new Date(lastDateStr);
  return isNaN(parsedDate.getTime()) ? thirtyDaysFromNow : parsedDate;
}

const STATE_MAPPINGS = {
  "Uttar Pradesh": ["UTTAR PRADESH", "UP ", " U.P.", "UPPBPB"],
  Delhi: ["DELHI", "DSSSB"],
  Bihar: ["BIHAR", "BPSC", "BC ECE"],
  "Madhya Pradesh": ["MADHYA PRADESH", "MP ", " M.P.", "MPPEB"],
  Rajasthan: ["RAJASTHAN", "RSMSSB", "RPSC"],
  Haryana: ["HARYANA", "HSSC", "HPSC"],
  Punjab: ["PUNJAB", "PPSC", "PSSSB"],
  Gujarat: ["GUJARAT", "GPSC", "GSSSB"],
  Maharashtra: ["MAHARASHTRA", "MPSC"],
  Karnataka: ["KARNATAKA", "KPSC", "KEA"],
  Kerala: ["KERALA", "KPSC"],
  "Tamil Nadu": ["TAMIL NADU", "TNPSC", "TRB"],
  "Andhra Pradesh": ["ANDHRA PRADESH", "APPSC"],
  Telangana: ["TELANGANA", "TSPSC"],
  "West Bengal": ["WEST BENGAL", "WBPSC", "WBP"],
  Odisha: ["ODISHA", "OPSC", "OSSC"],
  Assam: ["ASSAM", "APSC"],
  Jharkhand: ["JHARKHAND", "JPSC", "JSSC"],
  Chhattisgarh: ["CHHATTISGARH", "CGPSC"],
  Uttarakhand: ["UTTARAKHAND", "UKPSC", "UKSSSC"],
  "Himachal Pradesh": ["HIMACHAL", "HPPSC", "HPSSSB"],
};

/**
 * Main function to build the complete job object from the Sarkari Result API response.
 */
function parseJobDetails(title, link, lastDateStr) {
  const jobName = title.replace(/\s+/g, " ").trim();
  const applyLink = link || "https://www.sarkariresult.com";
  let lastDate = parseLastDate(lastDateStr);

  // If the job title specifies an older year, set lastDate to the past
  const currentYear = new Date().getFullYear();
  const yearMatch = jobName.match(/\b(20\d{2})\b/);
  let notificationYear = currentYear;
  if (yearMatch) {
    notificationYear = parseInt(yearMatch[1], 10);
    if (notificationYear < currentYear) {
      lastDate = new Date(`${notificationYear}-12-31T23:59:59Z`);
    }
  }

  const upperTitle = jobName.toUpperCase();

  // Determine state-specific settings
  let state = "";
  let allIndia = true;
  let domicileRequired = false;

  for (const [stateName, keywords] of Object.entries(STATE_MAPPINGS)) {
    if (keywords.some((kw) => upperTitle.includes(kw))) {
      state = stateName;
      allIndia = false;
      domicileRequired = true;
      break;
    }
  }

  // 1. Determine Field, Department & Skills (Default to "Other" and basic skills)
  let field = "Other";
  let department = "Government Department";
  let skillsRequired = ["General Knowledge", "Aptitude"];

  for (const [key, value] of Object.entries(FIELD_CONFIG)) {
    if (value.keywords.some((kw) => upperTitle.includes(kw))) {
      field = key;
      department = value.dept;
      skillsRequired = value.skills;
      break;
    }
  }

  // 2. Determine Qualification (Default to "Graduation")
  let qualificationRequired = "Graduation";
  for (const rule of QUAL_CONFIG) {
    if (rule.keywords.some((kw) => upperTitle.includes(kw))) {
      qualificationRequired = rule.qual;
      break;
    }
  }

  // 3. Determine Age Limit (Default to 18-35)
  let minAge = 18;
  let maxAge = 35;
  for (const rule of AGE_CONFIG) {
    if (rule.keywords.some((kw) => upperTitle.includes(kw))) {
      minAge = rule.min;
      maxAge = rule.max;
      break;
    }
  }

  // Special overrides for Banking Apprentice jobs
  if (field === "Banking" && upperTitle.includes("APPRENTICE")) {
    qualificationRequired = "Graduation";
    minAge = 20;
    maxAge = 28;
  }

  // 4. Calculate total vacancies (Extract from title if present, otherwise generate random)
  let totalVacancies = 100;
  const matchPosts = upperTitle.match(/\((\d+)\s*POSTS?\)/);
  if (matchPosts && matchPosts[1]) {
    totalVacancies = parseInt(matchPosts[1], 10);
  } else {
    totalVacancies = Math.floor(Math.random() * 450) + 50;
  }

  const isActive = lastDate >= new Date();

  // Return the structured job object matching our DB Schema
  return {
    title: jobName,
    department,
    description: `Latest government vacancy notification for ${jobName}. Apply online before the deadline.`,
    qualification: qualificationRequired,
    min_age: minAge,
    max_age: maxAge,
    categoryRelaxation: { General: 0, OBC: 3, SC: 5, ST: 5, EWS: 0, PwD: 10 },
    applicationFee: {
      general: 100,
      obc: 100,
      sc_st: 0,
      female: 0,
    },
    last_date: lastDate,
    vacancyDetails: {
      total: totalVacancies,
      general: Math.floor(totalVacancies * 0.4),
      obc: Math.floor(totalVacancies * 0.27),
      sc: Math.floor(totalVacancies * 0.15),
      st: Math.floor(totalVacancies * 0.08),
      ews: Math.floor(totalVacancies * 0.1),
    },
    skillsRequired,
    field,
    applyLink,
    state,
    domicileRequired,
    all_india: allIndia,
    notification_year: notificationYear,
    is_active: isActive,
    status: isActive ? "active" : "expired",
  };
}

module.exports = { parseJobDetails };
