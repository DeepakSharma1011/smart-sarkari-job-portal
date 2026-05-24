/**
 * Helper utility to parse job details from Sarkari Result RapidAPI listings.
 */

const FIELD_RULES = [
  { field: 'SSC', dept: 'Staff Selection Commission (SSC)', keywords: ['SSC', 'STAFF SELECTION'] },
  { field: 'UPSC', dept: 'Union Public Service Commission (UPSC)', keywords: ['UPSC', 'UNION PUBLIC'] },
  { field: 'Banking', dept: 'Banking Sector', keywords: ['BANK', 'IBPS', 'SBI', 'HDFC', 'RBI'] },
  { field: 'Railway', dept: 'Railway Recruitment Board (RRB)', keywords: ['RAILWAY', 'RRB', 'RRC', 'METRO', 'RAIL'] },
  { field: 'Police', dept: 'State Police Department', keywords: ['POLICE', 'CONSTABLE', 'WARDER', 'SUB INSPECTOR', 'SI '] },
  { field: 'Defence', dept: 'Ministry of Defence', keywords: ['ARMY', 'NAVY', 'AIR FORCE', 'DEFENCE', 'NDA', 'CDS'] },
  { field: 'Teaching', dept: 'Department of Education', keywords: ['TEACHER', 'PROFESSOR', 'LECTURER', 'CTET', 'SCHOOL', 'UNIVERSITY', 'TGT', 'PGT'] },
  { field: 'State PSC', dept: 'State Public Service Commission', keywords: ['PSC', 'PUBLIC SERVICE COMMISSION'] },
  { field: 'IT & CS', dept: 'Research & Information Technology Dept', keywords: ['ENGINEER', 'SCIENTIST', 'SOFTWARE', 'DEVELOPER', 'COMPUTER', 'PROGRAMMER', 'IT ', 'CSIR'] }
];

const QUAL_RULES = [
  { qual: 'PhD', keywords: ['PHD', 'DOCTORATE'] },
  { qual: 'Post Graduation', keywords: ['POST GRADUATE', 'PG ', 'M.TECH', 'M.SC', 'M.COM', 'MBA', 'MASTER'] },
  { qual: 'Diploma', keywords: ['DIPLOMA', 'POLYTECHNIC'] },
  { qual: 'ITI', keywords: ['ITI'] },
  { qual: '12th', keywords: ['12TH', '10+2', 'INTERMEDIATE', 'CHSL', 'CONSTABLE'] },
  { qual: '10th', keywords: ['10TH', 'MATRIC', 'CLASS IV', 'APPRENTICE', 'MTS', 'ANGANWADI'] }
];

const AGE_RULES = [
  { keywords: ['NDA', 'TES', '10+2 TES'], min: 16, max: 19 },
  { keywords: ['ARMY', 'NAVY', 'AIR FORCE', 'CONSTABLE'], min: 18, max: 25 },
  { keywords: ['BANK PO', 'PO '], min: 20, max: 30 },
  { keywords: ['CGL', 'GRADUATE'], min: 18, max: 32 },
  { keywords: ['PROFESSOR', 'SCIENTIST'], min: 22, max: 45 },
  { keywords: ['APPRENTICE'], min: 15, max: 24 }
];

const FIELD_SKILLS = {
  SSC: ['Reasoning', 'Quantitative Aptitude', 'English', 'General Awareness'],
  UPSC: ['General Studies', 'CSAT', 'Essay Writing'],
  Banking: ['Reasoning', 'Quantitative Aptitude', 'English', 'Banking Awareness'],
  Railway: ['Maths', 'Reasoning', 'General Awareness'],
  Defence: ['Mathematics', 'General Ability', 'English'],
  Teaching: ['Pedagogy', 'Subject Knowledge', 'English'],
  Police: ['General Knowledge', 'Physical Ability', 'Reasoning'],
  'IT & CS': ['Programming', 'Data Structures', 'Database Management', 'Networking']
};

function parseLastDate(lastDateStr) {
  const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  if (!lastDateStr) return defaultDate;
  const cleaned = lastDateStr.trim().toLowerCase();
  if (!cleaned || ['soon', 'announce', 'coming', 'n/a', 'na'].some(k => cleaned.includes(k))) return defaultDate;
  const parsed = new Date(lastDateStr);
  return isNaN(parsed.getTime()) ? defaultDate : parsed;
}

function parseJobDetails(title, link, lastDateStr) {
  const jobName = title.trim();
  const applyLink = link || 'https://www.sarkariresult.com';
  const lastDate = parseLastDate(lastDateStr);
  const upperTitle = jobName.toUpperCase();
  
  let field = 'Other', department = 'Government Department';
  for (const rule of FIELD_RULES) {
    if (rule.keywords.some(k => upperTitle.includes(k))) {
      field = rule.field;
      department = rule.dept;
      if (upperTitle.includes('SBI')) department = 'State Bank of India (SBI)';
      else if (upperTitle.includes('IBPS')) department = 'Institute of Banking Personnel Selection (IBPS)';
      else if (upperTitle.includes('RBI')) department = 'Reserve Bank of India (RBI)';
      else if (upperTitle.includes('CSIR')) department = 'Council of Scientific & Industrial Research (CSIR)';
      break;
    }
  }

  let qualificationRequired = 'Graduation';
  for (const rule of QUAL_RULES) {
    if (rule.keywords.some(k => upperTitle.includes(k))) {
      qualificationRequired = rule.qual;
      break;
    }
  }

  let minAge = 18, maxAge = 35;
  for (const rule of AGE_RULES) {
    if (rule.keywords.some(k => upperTitle.includes(k))) {
      minAge = rule.min;
      maxAge = rule.max;
      break;
    }
  }

  const skillsRequired = FIELD_SKILLS[field] || ['General Knowledge', 'Aptitude'];
  
  let totalVacancies = 100;
  const matchPosts = upperTitle.match(/\((\d+)\s*POSTS?\)/);
  if (matchPosts && matchPosts[1]) {
    totalVacancies = parseInt(matchPosts[1], 10);
  } else {
    totalVacancies = Math.floor(Math.random() * 450) + 50;
  }

  return {
    jobName,
    department,
    description: `Latest government vacancy notification for ${jobName}. Apply online before the deadline.`,
    qualificationRequired,
    minAge,
    maxAge,
    categoryRelaxation: { General: 0, OBC: 3, SC: 5, ST: 5, EWS: 0, PwD: 10 },
    applicationFee: {
      general: field === 'Banking' ? 850 : 100,
      obc: field === 'Banking' ? 850 : 100,
      sc_st: field === 'Banking' ? 175 : 0,
      female: 0,
    },
    lastDate,
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
    status: lastDate < new Date() ? 'expired' : 'active',
  };
}

module.exports = { parseJobDetails };
