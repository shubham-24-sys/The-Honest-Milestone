/**
 * MILESTONE - Production-Grade Investing Education & Goal Planning Prototype
 * Indian College Student Context • Calm Editorial Fintech Identity
 * Features:
 * - Single Top-Bar Navigation & Connected Product Journey
 * - Local Account Management with Sign In, Create Account & Password Toggle
 * - Goal Completion Engine: "How close am I, and what could help me reach my goal?"
 * - 25%, 50%, 75% Milestone Checkpoints & Delta Tracker
 * - Explore Investment Options Section (7 beginner-friendly foundational options)
 * - Artha Educational In-Product Chatbot
 * - Goal-Related Learning Courses with Video Player Simulator & Progress Tracking
 * - Three Futures Comparison with Reactive Sliders
 * - Bad-Year Rehearsal & Flexible-Month College Preview
 * 
 * STRICT COMPLIANCE:
 * This prototype is for LEARNING AND COMPARING ONLY.
 * Users cannot buy, sell, open accounts, start SIPs, or transfer money.
 * No transaction buttons, rankings, or provider endorsements.
 */

// Storage Key
const STORAGE_KEY = 'milestone_app_state_v3';

// Initial Application State
const defaultState = {
  // Theme appearance: 'system', 'light', 'dark'
  theme: 'system',

  // Authentication & User Profile
  user: {
    isLoggedIn: true,
    name: 'Aarav Patel',
    email: 'aarav.patel@campus.edu',
    college: '2nd Year CS, Pune',
    memberSince: 'August 2026',
    completedCourses: ['course-1']
  },
  
  // Goal parameters
  goalAmount: 1000000, // ₹10,00,000 (10 Lakhs / Student Millionaire)
  timeHorizonYears: 8,
  monthlyContribution: 3000,
  stipendAmount: 8000,
  comfortLevel: 'moderate', // 'low', 'moderate', 'high'
  selectedScenario: 'middle', // 'slower', 'middle', 'faster'
  
  // Navigation & view state
  activeTab: 'landing', // 'landing', 'setup', 'scenarios', 'receipt', 'dashboard', 'dip', 'flex', 'learn'
  setupStep: 1, // 1 to 4
  learnSubTab: 'options', // 'options' or 'courses'
  optionsFilter: 'all', // 'all', 'cash', 'debt', 'equity', 'gold', 'method'
  
  // Milestone Progress Check-In (Simulated 18 months elapsed)
  simulatedMonthsElapsed: 18,
  lastCheckinDelta: {
    deposited: 3000,
    marketGain: 420,
    daysCloser: 12,
    date: '1st of this month'
  },

  // Market dip simulator state
  dipScenario: {
    dropPercent: 22,
    dropYear: 2,
    actionTaken: 'continue' // 'continue', 'pause', 'increase'
  },
  
  // Flexible month preview state
  flexMonthsPaused: 2,
  flexReducedAmount: 1000,
  flexMode: 'pause', // 'pause' or 'reduced'

  // Artha Chatbot state
  arthaOpen: false,
  chatMessages: [
    { sender: 'artha', text: 'Namaste! I am Artha, your investing education mentor. Ask me anything about your ₹10 Lakh plan, how index funds work, what to do during a market dip, or how savings accounts and FDs compare.', timestamp: 'Just now' }
  ],

  // Course Player State
  activeCourseId: null
};

const PLAN_INPUT_LIMITS = {
  goalAmount: { min: 50000, max: 100000000 },
  timeHorizonYears: { min: 3, max: 15 },
  monthlyContribution: { min: 500, max: 15000 }
};

let planLoadWarning = false;

function isWholeNumberInRange(value, { min, max }) {
  return Number.isSafeInteger(value) && value >= min && value <= max;
}

function normalizeLoadedPlan(loaded) {
  let repaired = false;
  Object.keys(PLAN_INPUT_LIMITS).forEach(key => {
    if (!isWholeNumberInRange(loaded[key], PLAN_INPUT_LIMITS[key])) {
      loaded[key] = defaultState[key];
      repaired = true;
    }
  });

  if (!['low', 'moderate', 'high'].includes(loaded.comfortLevel)) {
    loaded.comfortLevel = defaultState.comfortLevel;
    repaired = true;
  }
  if (!['slower', 'middle', 'faster'].includes(loaded.selectedScenario)) {
    loaded.selectedScenario = defaultState.selectedScenario;
    repaired = true;
  }
  if (!Number.isSafeInteger(loaded.simulatedMonthsElapsed) || loaded.simulatedMonthsElapsed < 0) {
    loaded.simulatedMonthsElapsed = defaultState.simulatedMonthsElapsed;
    repaired = true;
  }
  if (!Number.isFinite(loaded.stipendAmount) || loaded.stipendAmount <= 0) {
    loaded.stipendAmount = defaultState.stipendAmount;
    repaired = true;
  }

  const dip = loaded.dipScenario;
  if (!dip || !Number.isFinite(dip.dropPercent) || dip.dropPercent < 1 || dip.dropPercent > 80) {
    loaded.dipScenario = Object.assign({}, defaultState.dipScenario);
    repaired = true;
  } else if (!['continue', 'pause', 'increase'].includes(dip.actionTaken)) {
    dip.actionTaken = defaultState.dipScenario.actionTaken;
    repaired = true;
  }
  return repaired;
}

// Load saved state or default
let state = (function() {
  let loaded = Object.assign({}, defaultState);
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        Object.assign(loaded, parsed);
      } else {
        planLoadWarning = true;
      }
    }
    if (normalizeLoadedPlan(loaded)) {
      planLoadWarning = true;
    }
    const savedTheme = localStorage.getItem('milestone_theme');
    if (savedTheme) {
      loaded.theme = savedTheme;
    }
  } catch (e) {
    console.warn('LocalStorage error:', e);
    planLoadWarning = true;
  }
  return loaded;
})();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.theme) {
      localStorage.setItem('milestone_theme', state.theme);
    }
    return true;
  } catch (e) {
    console.warn('Failed to save state:', e);
    return false;
  }
}

function persistPlan(showSaved = false) {
  const saved = saveState();
  if (!saved) {
    showToast('Your plan could not be saved on this device. Changes remain active for this visit.');
  } else if (showSaved) {
    showToast('Your plan is saved on this device.');
  }
  return saved;
}

function validatePlanInput(key, value) {
  const limits = PLAN_INPUT_LIMITS[key];
  if (!limits || !isWholeNumberInRange(value, limits)) return false;
  if (key === 'goalAmount') return value % 50000 === 0;
  if (key === 'monthlyContribution') return value % 250 === 0;
  return true;
}

function scenarioForComfort(level) {
  return ({ low: 'slower', moderate: 'middle', high: 'faster' })[level] || 'middle';
}

// Formatting helpers
function formatINR(number) {
  if (number == null || isNaN(number)) return '₹0';
  const rounded = Math.round(number);
  return '₹' + rounded.toLocaleString('en-IN');
}

function formatLakhs(number) {
  if (number >= 10000000) {
    return '₹' + (number / 10000000).toFixed(2) + ' Cr';
  } else if (number >= 100000) {
    return '₹' + (number / 100000).toFixed(1) + ' Lakh';
  } else if (number >= 1000) {
    return '₹' + (number / 1000).toFixed(1) + 'k';
  }
  return formatINR(number);
}

function calculateSIPValue(monthly, annualRatePct, years) {
  const r = annualRatePct / 100 / 12;
  const n = Math.max(0, Math.round(years * 12));
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r);
}

function roundMonthlyContributionUp(amount) {
  return Math.ceil(amount / 250) * 250;
}

function formatGoalTime(years) {
  if (years === null) return 'More than 100 years';
  if (years === 0) return 'Goal reached';
  return `about ${years.toFixed(1)} years`;
}

// Scenario rates
const SCENARIO_RATES = {
  slower: {
    name: 'Slower',
    title: 'Conservative & Steady',
    rateRange: 'About 9.5% p.a.',
    maxDip: '-8%',
    description: 'Prioritizes lower short-term swings. Progress is calmer, requiring a longer horizon or higher contribution.',
    composition: '65% Short-Term Debt / Fixed Income • 35% Broad Market Equity',
    volatilityPill: 'Low Volatility',
    volatilityClass: 'bg-emerald-100 text-emerald-800'
  },
  middle: {
    name: 'Middle',
    title: 'Balanced & Broad',
    rateRange: 'About 11.6% p.a.',
    maxDip: '-18%',
    description: 'Balanced approach mirroring broad diversified index funds (Nifty 50). Noticeable ups and downs, but healthy multi-year compounding.',
    composition: '75% Diversified Index Equity (Nifty 50) • 25% Liquid Buffer',
    volatilityPill: 'Moderate Volatility',
    volatilityClass: 'bg-teal-100 text-teal-800'
  },
  faster: {
    name: 'Faster',
    title: 'Growth-Focused',
    rateRange: 'About 13.4% p.a.',
    maxDip: '-30%',
    description: 'Higher equity exposure seeking faster potential compounding. Accompanied by steeper paper drops during bad market years.',
    composition: '90% Equity (Large + Midcap Index) • 10% Cash Reserve',
    volatilityPill: 'Higher Volatility',
    volatilityClass: 'bg-amber-100 text-amber-800'
  }
};

const PLAN_ALLOCATIONS = {
  slower: {
    name: 'Slower example plan',
    allocations: [
      { category: 'Equity', percent: 30, annualRatePct: 15, description: 'A share of many companies through a broad fund.', risk: 'Its value can fall when markets fall.' },
      { category: 'Debt', percent: 60, annualRatePct: 7, description: 'Loans to governments or companies that may pay interest.', risk: 'Prices, interest rates, and repayment can still carry risk.' },
      { category: 'Gold', percent: 10, annualRatePct: 8, description: 'An example holding linked to the price of gold.', risk: 'Gold prices can rise or fall and do not provide regular income.' }
    ]
  },
  middle: {
    name: 'Middle example plan',
    allocations: [
      { category: 'Equity', percent: 60, annualRatePct: 15, description: 'A share of many companies through a broad fund.', risk: 'Its value can fall when markets fall.' },
      { category: 'Debt', percent: 30, annualRatePct: 7, description: 'Loans to governments or companies that may pay interest.', risk: 'Prices, interest rates, and repayment can still carry risk.' },
      { category: 'Gold', percent: 10, annualRatePct: 8, description: 'An example holding linked to the price of gold.', risk: 'Gold prices can rise or fall and do not provide regular income.' }
    ]
  },
  faster: {
    name: 'Faster example plan',
    allocations: [
      { category: 'Equity', percent: 80, annualRatePct: 15, description: 'A share of many companies through a broad fund.', risk: 'Its value can fall sharply when markets fall.' },
      { category: 'Debt', percent: 10, annualRatePct: 7, description: 'Loans to governments or companies that may pay interest.', risk: 'Prices, interest rates, and repayment can still carry risk.' },
      { category: 'Gold', percent: 10, annualRatePct: 8, description: 'An example holding linked to the price of gold.', risk: 'Gold prices can rise or fall and do not provide regular income.' }
    ]
  }
};

function getScenarioAnnualRate(scenarioKey) {
  const allocations = PLAN_ALLOCATIONS[scenarioKey]?.allocations || PLAN_ALLOCATIONS.middle.allocations;
  return allocations.reduce((rate, item) => rate + item.percent * item.annualRatePct / 100, 0);
}

function calculatePlanSIP(monthly, scenarioKey, years) {
  const allocations = PLAN_ALLOCATIONS[scenarioKey]?.allocations || PLAN_ALLOCATIONS.middle.allocations;
  const value = allocations.reduce((total, item) => {
    const categoryMonthly = monthly * item.percent / 100;
    return total + calculateSIPValue(categoryMonthly, item.annualRatePct, years);
  }, 0);
  return Math.round(value);
}

function calculatePlanMonthlyNeeded(targetGoal, scenarioKey, years, startingBalance = 0) {
  const allocations = PLAN_ALLOCATIONS[scenarioKey]?.allocations || PLAN_ALLOCATIONS.middle.allocations;
  const months = Math.max(0, Math.round(years * 12));
  if (targetGoal <= 0 || months === 0) return targetGoal <= startingBalance ? 0 : null;

  let startingValue = 0;
  let monthlyGrowthFactor = 0;
  allocations.forEach(item => {
    const share = item.percent / 100;
    const monthlyRate = item.annualRatePct / 100 / 12;
    const growth = Math.pow(1 + monthlyRate, months);
    startingValue += startingBalance * share * growth;
    monthlyGrowthFactor += calculateSIPValue(share, item.annualRatePct, years);
  });

  const remainingGoal = targetGoal - startingValue;
  if (remainingGoal <= 0) return 0;
  if (monthlyGrowthFactor <= 0) return null;
  return Math.ceil(remainingGoal / monthlyGrowthFactor);
}

function calculatePlanYearsToGoal(monthly, scenarioKey, targetGoal, startingBalance = 0) {
  const allocations = PLAN_ALLOCATIONS[scenarioKey]?.allocations || PLAN_ALLOCATIONS.middle.allocations;
  if (targetGoal <= startingBalance) return 0;
  if (monthly <= 0 && allocations.every(item => item.annualRatePct <= 0)) return null;

  const balances = allocations.map(item => startingBalance * item.percent / 100);
  for (let month = 1; month <= 1200; month++) {
    allocations.forEach((item, index) => {
      balances[index] = balances[index] * (1 + item.annualRatePct / 100 / 12) +
        monthly * item.percent / 100;
    });
    if (balances.reduce((total, balance) => total + balance, 0) >= targetGoal) return month / 12;
  }
  return null;
}

/* =========================================================================
   EXPLORE INVESTMENT OPTIONS (Educational Data)
   ========================================================================= */
const INVESTMENT_OPTIONS = [
  {
    id: 'savings-accounts',
    name: 'Savings accounts',
    category: 'cash',
    categoryLabel: 'Cash & Everyday Liquidity',
    badgeClass: 'bg-emerald-100 text-emerald-800',
    whatItIs: 'A foundational deposit account held with a commercial bank where you store money safely, earn modest interest, and perform instant day-to-day transactions (UPI, debit card, ATM).',
    howBeginnerUsesIt: 'Managing monthly college stipends, receiving allowances from family, and keeping a ₹5,000 emergency liquid buffer for hostel or laptop emergencies.',
    mainRisks: 'Inflation risk. Interest rates (typically 2.7%–3.5% p.a. in India) are usually lower than retail inflation (5%–6%), meaning your purchasing power gradually decreases over multi-year horizons.',
    liquidity: 'Instant (Highest). Access your funds 24/7 via UPI, debit card, or net banking with zero lock-in.',
    feesAndLockins: 'Check for Monthly Average Balance (MAB) requirements, annual debit card maintenance fees, SMS alert charges, and interest rate slab limits.',
    exampleProviders: [
      { name: 'SBI (State Bank of India)', url: 'https://sbi.co.in' },
      { name: 'HDFC Bank', url: 'https://www.hdfcbank.com' }
    ],
    providerNote: 'Example scheduled commercial banks in India shown for educational reference.'
  },
  {
    id: 'fixed-deposits',
    name: 'Fixed deposits (FDs)',
    category: 'debt',
    categoryLabel: 'Fixed Term & Capital Preservation',
    badgeClass: 'bg-teal-100 text-teal-800',
    whatItIs: 'A term deposit where you lock in a lump-sum amount for a predetermined duration (tenure from 7 days to 10 years) at a fixed, guaranteed interest rate agreed upon upfront.',
    howBeginnerUsesIt: 'Protecting savings earmarked for an expense expected in 1 to 3 years, such as university examination fees, college capstone project costs, or post-grad relocation.',
    mainRisks: 'Fixed returns struggle to outpace inflation after taxes. If market interest rates rise during your tenure, your locked-in rate remains fixed. Interest is fully taxable as per your personal income slab.',
    liquidity: 'Moderate. Money is meant to stay invested until maturity. Premature liquidation is permitted, but the bank reduces your interest payout via an early-withdrawal penalty.',
    feesAndLockins: 'Early withdrawal penalty (typically 0.5%–1% deducted from the applicable tenure rate); Tax Deducted at Source (TDS) if interest exceeds annual limits (Form 15G/15H eligibility).',
    exampleProviders: [
      { name: 'SBI (State Bank of India)', url: 'https://sbi.co.in' },
      { name: 'HDFC Bank', url: 'https://www.hdfcbank.com' }
    ],
    providerNote: 'Example bank providers in India shown for tenure and interest rate comparisons.'
  },
  {
    id: 'g-secs-bonds',
    name: 'Government securities and bonds',
    category: 'debt',
    categoryLabel: 'Sovereign Debt & Fixed Income',
    badgeClass: 'bg-sky-100 text-sky-800',
    whatItIs: 'Debt instruments issued by the Central Government of India or State Governments (such as Treasury Bills / T-Bills for short periods, and dated G-Secs or SDLs for longer periods). Terms, coupon payouts, and maturities vary widely.',
    howBeginnerUsesIt: 'Understanding how sovereign debt works, parking money with zero credit-default risk, or locking in fixed long-term yields as a debt anchor.',
    mainRisks: 'Interest rate risk. Terms and risks vary. If prevailing interest rates rise in the economy, market prices of existing bonds decline. Selling prior to maturity on the secondary market can result in capital loss.',
    liquidity: 'Moderate to Low. Holding until maturity guarantees 100% principal repayment. Selling before maturity depends on buyer liquidity in the secondary debt market.',
    feesAndLockins: 'Zero account opening fees on official government channels. Secondary market trading bid-ask spreads and tenure lock-ins apply.',
    exampleProviders: [
      { name: 'RBI Retail Direct', url: 'https://rbiretaildirect.org.in' }
    ],
    providerNote: 'Important: RBI Retail Direct is an official platform created by the Reserve Bank of India to learn about and access Government of India securities. It is a facilitation platform, not an investment company.'
  },
  {
    id: 'mutual-funds',
    name: 'Mutual funds',
    category: 'equity',
    categoryLabel: 'Pooled Asset Management',
    badgeClass: 'bg-indigo-100 text-indigo-800',
    whatItIs: 'An investment vehicle where an Asset Management Company (AMC) pools capital from numerous retail investors and deploys it across a diversified portfolio of equities, debt, or money market instruments according to a stated scheme strategy.',
    howBeginnerUsesIt: 'Gaining access to a professional, diversified portfolio with as little as ₹500/month, avoiding the concentration risks and research burden of picking individual stocks.',
    mainRisks: 'Market risk. Mutual funds do not provide guaranteed returns. Net Asset Values (NAVs) fluctuate daily, and equity schemes experience paper drawdowns during broader economic contractions.',
    liquidity: 'High to Moderate. Open-ended schemes allow redemption on any business day. Funds are credited to your bank account within T+1 to T+2 business days. ELSS schemes have a mandatory 3-year lock-in.',
    feesAndLockins: 'Total Expense Ratio (TER) — Direct plans have significantly lower fees than Regular plans; exit loads (typically 1% if redeemed within 12 months for equity); capital gains taxation (STCG / LTCG).',
    exampleProviders: [
      { name: 'SBI Mutual Fund', url: 'https://www.sbimf.com' },
      { name: 'HDFC Mutual Fund', url: 'https://www.hdfcfund.com' },
      { name: 'ICICI Prudential Mutual Fund', url: 'https://www.icicipruamc.com' }
    ],
    providerNote: 'Asset Management Companies (AMCs) shown as examples of SEBI-registered fund houses in India. No specific fund scheme is recommended.'
  },
  {
    id: 'index-funds-etfs',
    name: 'Index funds and ETFs',
    category: 'equity',
    categoryLabel: 'Passive Benchmark Tracking',
    badgeClass: 'bg-emerald-100 text-emerald-900',
    whatItIs: 'Passively managed funds designed to replicate the performance and composition of an established market benchmark (such as the Nifty 50 or Sensex 30). Because they follow an index rather than paying active managers to pick stocks, they feature very low management fees.',
    howBeginnerUsesIt: 'Serving as the primary long-term compounding engine for multi-year goals (like our ₹10 Lakhs student plan) without the complexity of selecting individual stock winners.',
    mainRisks: 'Market risk. Index funds aim to mirror their underlying index, meaning they can and will lose value when the broad market drops. They carry zero cash cushion or downside hedging during a market crash.',
    liquidity: 'High. Index mutual funds redeem directly through the AMC in T+1 or T+2 days. ETFs trade on stock exchanges during market hours and require a demat/trading account with exchange market liquidity.',
    feesAndLockins: 'Tracking error (difference between fund return and index return), Expense Ratio (typically very low, 0.05%–0.25% in Direct plans), and exchange brokerage charges for ETFs.',
    exampleProviders: [
      { name: 'SBI Mutual Fund', url: 'https://www.sbimf.com' },
      { name: 'HDFC Mutual Fund', url: 'https://www.hdfcfund.com' },
      { name: 'ICICI Prudential Mutual Fund', url: 'https://www.icicipruamc.com' }
    ],
    providerNote: 'Used only as AMC provider examples that offer index tracking schemes. No specific index fund or ETF is named or recommended.'
  },
  {
    id: 'gold',
    name: 'Gold',
    category: 'gold',
    categoryLabel: 'Precious Commodity & Hedge',
    badgeClass: 'bg-amber-100 text-amber-900',
    whatItIs: 'A traditional commodity and store of value. Gold can be held physically (coins, bars, jewelry) or through regulated financial categories such as Gold ETFs, Gold Mutual Funds, and Sovereign Gold Bonds (SGBs).',
    howBeginnerUsesIt: 'Adding an asset class that historically behaves differently from equities during periods of global inflation, currency weakness, or geopolitical tension.',
    mainRisks: 'Commodity price risk. Gold prices can rise or fall significantly over multi-year stretches. Gold generates no business earnings, dividends, or coupon payments (apart from SGBs\' 2.5% p.a.). Physical gold carries theft and purity risks.',
    liquidity: 'Varies by vehicle. Gold ETFs and Gold funds redeem in 1–2 business days. Physical jewelry has melting/making deductions. SGBs have an 8-year tenure with early exit windows starting from Year 5.',
    feesAndLockins: 'Expense ratio on Gold ETFs/funds (0.2%–0.8%), making charges on physical jewelry (10%–25%), and applicable capital gains tax rules.',
    exampleProviders: [
      { name: 'Gold ETFs & Mutual Funds (Category)', url: 'https://www.amfiindia.com' },
      { name: 'Sovereign Gold Bonds - SGBs (RBI Category)', url: 'https://rbiretaildirect.org.in' }
    ],
    providerNote: 'Described as investment categories, not recommendations. Specific bullion dealers or jewelry brands are not endorsed.'
  },
  {
    id: 'sip',
    name: 'SIP (Systematic Investment Plan)',
    category: 'method',
    categoryLabel: 'Methodology, Not an Investment',
    badgeClass: 'bg-forest-900 text-white',
    whatItIs: 'A SIP is a disciplined METHOD of investing a fixed sum of money at regular intervals (monthly or quarterly), NOT a separate type of investment or asset class. It is a recurring payment mechanism used with eligible mutual funds.',
    howBeginnerUsesIt: 'Automating an investment of ₹1,000 or ₹3,000 two days after your monthly student allowance or internship stipend arrives, building consistent investing habits.',
    mainRisks: 'A SIP does not guarantee positive returns or eliminate market risk. If the underlying mutual fund declines, the value of all accumulated units will fall accordingly.',
    liquidity: 'Liquidity depends entirely on the underlying mutual fund chosen. You can pause, modify, or stop a SIP anytime without penalty. Already purchased units redeem according to the fund\'s rules.',
    feesAndLockins: 'Bank auto-debit mandate setup (NACH/e-mandate), minimum installment requirements (often ₹100 or ₹500), and potential bank penalty charges if auto-debit fails due to insufficient bank balance.',
    exampleProviders: [
      { name: 'SBI Mutual Fund', url: 'https://www.sbimf.com' },
      { name: 'HDFC Mutual Fund', url: 'https://www.hdfcfund.com' },
      { name: 'ICICI Prudential Mutual Fund', url: 'https://www.icicipruamc.com' }
    ],
    providerNote: 'SIP is a payment facility provided by all mutual fund AMCs and scheduled banks in India.'
  }
];

// Course Catalog Data
const COURSES = [
  {
    id: 'course-1',
    title: "What Does It Mean to Buy a Company's Stock?",
    videoTitle: 'What it means to buy a company’s stock',
    videoId: '98qfFzqDKR8',
    videoDuration: '13:47',
    level: 'Beginner',
    category: 'Core Foundations',
    recommendedFor: ['low', 'moderate', 'high'],
    description: 'Learn what buying a share means and how it represents a small ownership stake in a company.',
    thumbnailGrad: 'from-emerald-900 to-teal-900',
    keyTakeaway: 'A share represents part ownership in a company, and its market value can rise or fall.'
  },
  {
    id: 'course-2',
    title: 'Understanding Risk & Volatility',
    videoTitle: 'Implied volatility',
    videoId: 'VIHldsSmASU',
    videoDuration: '5:00',
    level: 'Beginner',
    category: 'Risk Management',
    recommendedFor: ['low', 'moderate'],
    description: 'An introduction to implied volatility and how expectations about price movement affect options prices.',
    thumbnailGrad: 'from-teal-900 to-cyan-950',
    keyTakeaway: 'Implied volatility reflects expected movement in options prices; it does not predict whether a price will rise or fall.'
  },
  {
    id: 'course-3',
    title: 'Compound Interest Basics',
    videoTitle: 'Compound interest introduction',
    videoId: 'Rm6UdfRs3gw',
    videoDuration: '6:38',
    level: 'Beginner',
    category: 'Compounding',
    recommendedFor: ['moderate', 'high'],
    description: 'See how interest can build on both the original amount and interest already earned.',
    thumbnailGrad: 'from-forest-900 to-emerald-950',
    keyTakeaway: 'With compounding, future growth can include returns earned on earlier returns; actual investment returns vary.'
  },
  {
    id: 'course-4',
    title: 'How Investment Value Can Fall',
    videoTitle: 'Wealth destruction 1',
    videoId: 'Q7HbtnOyKMg',
    videoDuration: '10:30',
    level: 'Intermediate',
    category: 'Behavioral Mindset',
    recommendedFor: ['moderate', 'high'],
    description: 'Explore an example of how financial choices and market conditions can reduce wealth.',
    thumbnailGrad: 'from-amber-950 to-stone-900',
    keyTakeaway: 'Investment values can decline, and losses are possible; a past recovery does not guarantee a future one.'
  },
  {
    id: 'course-5',
    title: 'Exchange-Traded Funds Explained',
    videoTitle: 'Exchange traded funds (ETFs)',
    videoId: 'SFdsY9Rdh6w',
    videoDuration: '5:02',
    level: 'Beginner',
    category: 'Asset Classes',
    recommendedFor: ['low', 'moderate', 'high'],
    description: 'Learn the basics of exchange-traded funds. Some ETFs track an index, but ETFs and index funds are not the same thing.',
    thumbnailGrad: 'from-emerald-950 to-stone-950',
    keyTakeaway: 'An ETF is traded on an exchange; its holdings and risks depend on the particular fund.'
  },
  {
    id: 'course-6',
    title: 'A Simple Student Budget Example',
    videoTitle: 'Budget example',
    videoId: 'qQLLDPAEzT0',
    videoDuration: '5:45',
    level: 'Beginner',
    category: 'Student Lifestyle',
    recommendedFor: ['low', 'moderate'],
    description: 'Walk through a sample budget to see how income and expenses can be organized. Your own costs may be different.',
    thumbnailGrad: 'from-teal-950 to-emerald-900',
    keyTakeaway: 'A budget is a flexible example for planning income and expenses, not a rule that fits every student.'
  }
];

// =========================================================================
// THEME CONTROLLER (Light, Dark, System)
// =========================================================================
function setAppTheme(theme) {
  state.theme = theme;
  try {
    localStorage.setItem('milestone_theme', theme);
  } catch (e) {
    console.warn('LocalStorage error saving theme:', e);
  }
  saveState();
  applyCurrentTheme();
  updateThemeControlsUI();
}

function applyCurrentTheme() {
  const theme = state.theme || 'system';
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function updateThemeControlsUI() {
  const theme = state.theme || 'system';
  const modes = ['light', 'dark', 'system'];

  // Desktop buttons
  modes.forEach(m => {
    const btn = document.getElementById(`theme-btn-${m}`);
    if (btn) {
      if (m === theme) {
        btn.classList.add('theme-btn-active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('theme-btn-active');
        btn.setAttribute('aria-pressed', 'false');
      }
    }
  });

  // Mobile buttons
  modes.forEach(m => {
    const mBtn = document.getElementById(`mobile-theme-${m}`);
    if (mBtn) {
      if (m === theme) {
        mBtn.classList.add('theme-btn-active');
        mBtn.setAttribute('aria-pressed', 'true');
      } else {
        mBtn.classList.remove('theme-btn-active');
        mBtn.setAttribute('aria-pressed', 'false');
      }
    }
  });
}

// Watch device setting changes when System theme is active
if (window.matchMedia) {
  const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const updateSystemTheme = () => {
    if ((state.theme || 'system') === 'system') {
      applyCurrentTheme();
      updateThemeControlsUI();
    }
  };

  if (colorSchemeQuery.addEventListener) {
    colorSchemeQuery.addEventListener('change', updateSystemTheme);
  } else if (colorSchemeQuery.addListener) {
    colorSchemeQuery.addListener(updateSystemTheme);
  }
}

// =========================================================================
// NAVIGATION CONTROLLER & PAGE GUARDS
// =========================================================================
const INTERNAL_PAGES = ['dashboard', 'receipt', 'dip', 'flex'];

function navigateTo(tabName, addToHistory = true) {
  // Prevent access to account-only internal pages when signed out
  if (INTERNAL_PAGES.includes(tabName) && (!state.user || !state.user.isLoggedIn)) {
    state.redirectAfterLogin = tabName;
    saveState();
    showToast('Please sign in to access your plan & dashboard.');
    openAuthModal('signin');
    if (INTERNAL_PAGES.includes(state.activeTab)) {
      state.activeTab = 'landing';
      if (window.location.hash !== '#landing') {
        history.replaceState({ tab: 'landing' }, '', '#landing');
      }
      renderApp();
    }
    return;
  }

  state.activeTab = tabName;
  saveState();

  if (addToHistory !== false) {
    const hash = '#' + tabName;
    if (window.location.hash !== hash) {
      history.pushState({ tab: tabName }, '', hash);
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderApp();
}

// Browser Back & Forward button handling
window.addEventListener('popstate', (e) => {
  let targetTab = (e.state && e.state.tab) || (window.location.hash ? window.location.hash.replace('#', '') : 'landing');
  const validTabs = ['landing', 'setup', 'scenarios', 'receipt', 'dashboard', 'dip', 'flex', 'learn'];
  if (!validTabs.includes(targetTab)) {
    targetTab = 'landing';
  }
  navigateTo(targetTab, false);
});

function openInvestmentOptions() {
  state.activeTab = 'learn';
  state.learnSubTab = 'options';
  saveState();
  if (window.location.hash !== '#learn') {
    history.pushState({ tab: 'learn' }, '', '#learn');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderApp();
}

function closeMobileMenu() {
  const m = document.getElementById('mobile-nav-menu');
  if (m) m.classList.add('hidden');
}

// Bind Global DOM events
document.addEventListener('DOMContentLoaded', () => {
  applyCurrentTheme();
  bindGlobalEvents();

  // Read initial route from URL hash
  let initialTab = (window.location.hash ? window.location.hash.replace('#', '') : '') || state.activeTab || 'landing';
  const validTabs = ['landing', 'setup', 'scenarios', 'receipt', 'dashboard', 'dip', 'flex', 'learn'];
  if (!validTabs.includes(initialTab)) {
    initialTab = 'landing';
  }

  // Guard account-only routes on initial direct visit
  if (INTERNAL_PAGES.includes(initialTab) && (!state.user || !state.user.isLoggedIn)) {
    state.redirectAfterLogin = initialTab;
    initialTab = 'landing';
    history.replaceState({ tab: 'landing' }, '', '#landing');
  } else {
    history.replaceState({ tab: initialTab }, '', '#' + initialTab);
  }

  state.activeTab = initialTab;
  renderApp();
  if (planLoadWarning) {
    showToast('Some saved plan details were invalid and have been restored to safe defaults.');
  }
});

function bindGlobalEvents() {
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileMenu = document.getElementById('mobile-nav-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      closeArthaChat();
    }
  });

  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('account-dropdown-menu');
    const trigger = document.getElementById('account-btn-trigger');
    if (dropdown && trigger && !trigger.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
}

function closeAllModals() {
  document.querySelectorAll('.app-modal').forEach(m => m.classList.add('hidden'));
  const coursePlayerContainer = document.getElementById('course-player-container');
  if (coursePlayerContainer) coursePlayerContainer.replaceChildren();
  state.activeCourseId = null;
}

// Main Render Function
function renderApp() {
  // Guard account-only pages if logged out
  if ((!state.user || !state.user.isLoggedIn) && INTERNAL_PAGES.includes(state.activeTab)) {
    state.redirectAfterLogin = state.activeTab;
    state.activeTab = 'landing';
    saveState();
  }

  const views = ['landing', 'setup', 'scenarios', 'receipt', 'dashboard', 'dip', 'flex', 'learn'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === state.activeTab) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  applyCurrentTheme();
  renderTopNavigation();
  updateThemeControlsUI();

  if (state.activeTab === 'setup') renderSetupFlow();
  if (state.activeTab === 'scenarios') renderScenariosView();
  if (state.activeTab === 'receipt') renderReceiptView();
  if (state.activeTab === 'dashboard') renderDashboardView();
  if (state.activeTab === 'dip') renderDipRehearsalView();
  if (state.activeTab === 'flex') renderFlexMonthView();
  if (state.activeTab === 'learn') renderLearnView();

  renderArthaChat();
}

/* =========================================================================
   TOP NAVIGATION & ACCOUNT BAR
   ========================================================================= */
function renderTopNavigation() {
  const primaryNav = document.getElementById('top-primary-nav');
  const mobileNav = document.getElementById('mobile-nav-links');
  const container = document.getElementById('top-nav-account-slot');
  const mobileAuthSlot = document.getElementById('mobile-auth-slot');
  const active = state.activeTab;
  const isAuth = !!(state.user && state.user.isLoggedIn);

  // 1. Primary Desktop Navigation Links
  if (primaryNav) {
    if (isAuth) {
      primaryNav.innerHTML = `
        <button type="button" onclick="navigateTo('landing')"
          class="text-sm font-semibold transition-colors flex items-center gap-1.5 ${active === 'landing' ? 'nav-link-active' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'}">
          <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span>Home</span>
        </button>
        <button type="button" onclick="navigateTo('dashboard')"
          class="text-sm font-semibold transition-colors flex items-center gap-1.5 ${active === 'dashboard' || active === 'dip' || active === 'flex' ? 'nav-link-active' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'}">
          <span>Overview</span>
        </button>
        <button type="button" onclick="navigateTo('receipt')"
          class="text-sm font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${active === 'receipt' ? 'nav-link-active' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'}">
          <span style="white-space: nowrap">My plan</span>
        </button>
        <button type="button" onclick="navigateTo('learn')"
          class="text-sm font-semibold transition-colors flex items-center gap-1.5 ${active === 'learn' ? 'nav-link-active' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'}">
          <span>Learn</span>
          <span class="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">6 Courses</span>
        </button>
        <button type="button" onclick="toggleArthaChat()"
          class="text-sm font-semibold transition-colors flex items-center gap-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Artha</span>
        </button>
      `;
    } else {
      primaryNav.innerHTML = `
        <button type="button" onclick="navigateTo('landing')"
          class="text-sm font-semibold transition-colors flex items-center gap-1.5 ${active === 'landing' ? 'nav-link-active' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'}">
          <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span>Home</span>
        </button>
        <button type="button" onclick="openHowItWorksModal()"
          class="text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors">
          <span>How it works</span>
        </button>
        <button type="button" onclick="navigateTo('learn')"
          class="text-sm font-semibold transition-colors flex items-center gap-1.5 ${active === 'learn' ? 'nav-link-active' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'}">
          <span>Learn</span>
          <span class="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">6 Courses</span>
        </button>
      `;
    }
  }

  // 2. Mobile Navigation Links
  if (mobileNav) {
    if (isAuth) {
      mobileNav.innerHTML = `
        <button type="button" onclick="navigateTo('landing'); closeMobileMenu();" class="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${active === 'landing' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold' : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#162621]'} flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span>Home</span>
        </button>
        <button type="button" onclick="navigateTo('dashboard'); closeMobileMenu();" class="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${active === 'dashboard' || active === 'dip' || active === 'flex' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold' : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#162621]'}">
          Overview
        </button>
        <button type="button" onclick="navigateTo('receipt'); closeMobileMenu();" class="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${active === 'receipt' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold' : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#162621]'}">
          My plan
        </button>
        <button type="button" onclick="navigateTo('learn'); closeMobileMenu();" class="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${active === 'learn' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold' : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#162621]'} flex items-center justify-between">
          <span>Learn (6 Courses)</span>
          <span class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">6 Courses</span>
        </button>
        <button type="button" onclick="toggleArthaChat(); closeMobileMenu();" class="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#162621] flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Artha (AI Mentor)</span>
        </button>
      `;
    } else {
      mobileNav.innerHTML = `
        <button type="button" onclick="navigateTo('landing'); closeMobileMenu();" class="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${active === 'landing' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold' : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#162621]'} flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span>Home</span>
        </button>
        <button type="button" onclick="openHowItWorksModal(); closeMobileMenu();" class="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#162621]">
          How it works
        </button>
        <button type="button" onclick="navigateTo('learn'); closeMobileMenu();" class="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#162621] flex items-center justify-between">
          <span>Learn (6 Video Courses)</span>
          <span class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">6 Courses</span>
        </button>
      `;
    }
  }

  // 3. Right Account / Auth Slot
  if (isAuth) {
    const completedCount = (state.user.completedCourses || []).length;
    if (container) {
      container.innerHTML = `
        <div class="relative">
          <button id="account-btn-trigger" type="button" onclick="toggleAccountDropdown()"
            class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#162621] border border-[#E5E0D5] dark:border-[#243B34] hover:border-emerald-700 text-stone-800 dark:text-stone-200 text-xs font-medium transition-all shadow-sm">
            <div class="w-6 h-6 rounded-full bg-forest-900 dark:bg-emerald-600 text-ivory flex items-center justify-center font-bold text-[11px]">
              ${state.user.name.charAt(0)}
            </div>
            <span class="hidden sm:inline font-semibold text-stone-900 dark:text-stone-100">${state.user.name.split(' ')[0]}</span>
            <svg class="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          <div id="account-dropdown-menu" class="hidden absolute right-0 mt-2 w-64 bg-white dark:bg-[#121F1B] rounded-2xl border border-stone-200 dark:border-[#243B34] shadow-xl py-3 z-50 text-xs text-stone-700 dark:text-stone-300">
            <div class="px-4 py-2 border-b border-stone-100 dark:border-[#1F332C] mb-1">
              <div class="font-bold text-stone-900 dark:text-white text-sm">${state.user.name}</div>
              <div class="text-[11px] text-stone-500 dark:text-stone-400">${state.user.email}</div>
              <div class="text-[11px] text-emerald-800 dark:text-emerald-400 font-medium mt-0.5">${state.user.college}</div>
            </div>

            <div class="px-4 py-2 bg-stone-50/70 dark:bg-[#162621] border-b border-stone-100 dark:border-[#1F332C] flex items-center justify-between text-[11px]">
              <span class="text-stone-600 dark:text-stone-400">Goal: ${formatLakhs(state.goalAmount)}</span>
              <span class="font-semibold text-emerald-800 dark:text-emerald-400">${completedCount} of ${COURSES.length} Courses</span>
            </div>

            <button type="button" onclick="navigateTo('dashboard'); toggleAccountDropdown();" class="w-full text-left px-4 py-2 hover:bg-stone-50 dark:hover:bg-[#162621] font-medium flex items-center gap-2">
              <svg class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              Overview (Active Dashboard)
            </button>

            <button type="button" onclick="navigateTo('receipt'); toggleAccountDropdown();" class="w-full text-left px-4 py-2 hover:bg-stone-50 dark:hover:bg-[#162621] font-medium flex items-center gap-2">
              <svg class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              My Plan Summary & PDF
            </button>

            <button type="button" onclick="openInvestmentOptions(); toggleAccountDropdown();" class="w-full text-left px-4 py-2 hover:bg-stone-50 dark:hover:bg-[#162621] font-medium flex items-center gap-2">
              <svg class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              Explore 7 Investment Options
            </button>

            <button type="button" onclick="navigateTo('learn'); state.learnSubTab = 'courses'; renderLearnView(); toggleAccountDropdown();" class="w-full text-left px-4 py-2 hover:bg-stone-50 dark:hover:bg-[#162621] font-medium flex items-center gap-2">
              <svg class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              Course Library (${completedCount} finished)
            </button>

            <button type="button" onclick="openProfileModal(); toggleAccountDropdown();" class="w-full text-left px-4 py-2 hover:bg-stone-50 dark:hover:bg-[#162621] font-medium flex items-center gap-2">
              <svg class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Account Details & Security
            </button>

            <div class="border-t border-stone-100 dark:border-[#1F332C] mt-1 pt-1">
              <button type="button" onclick="signOutUser()" class="w-full text-left px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 font-semibold flex items-center gap-2">
                <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (mobileAuthSlot) {
      mobileAuthSlot.innerHTML = `
        <div class="px-3 py-2 border-t border-stone-200 dark:border-[#1F332C] flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-stone-900 dark:text-stone-100">${state.user.name}</div>
            <div class="text-[10px] text-stone-500 dark:text-stone-400">${state.user.email}</div>
          </div>
          <button type="button" onclick="signOutUser(); closeMobileMenu();" class="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span>Sign out</span>
          </button>
        </div>
      `;
    }
  } else {
    if (container) {
      container.innerHTML = `
        <button type="button" onclick="openAuthModal('signin')"
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#162621] border border-[#E5E0D5] dark:border-[#243B34] hover:border-emerald-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-all shadow-sm">
          <svg class="w-4 h-4 text-stone-500 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
          <span>Sign in</span>
        </button>
      `;
    }

    if (mobileAuthSlot) {
      mobileAuthSlot.innerHTML = `
        <div class="px-3 py-2 border-t border-stone-200 dark:border-[#1F332C]">
          <button type="button" onclick="openAuthModal('signin'); closeMobileMenu();" class="w-full text-center py-2 rounded-xl bg-stone-100 dark:bg-[#162621] text-xs font-bold text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-[#243B34]">
            Sign in to your account
          </button>
        </div>
      `;
    }
  }

  updateThemeControlsUI();
}

function toggleAccountDropdown() {
  const dropdown = document.getElementById('account-dropdown-menu');
  if (dropdown) dropdown.classList.toggle('hidden');
}

/* =========================================================================
   AUTHENTICATION & USER PROFILE
   ========================================================================= */
function openAuthModal(mode = 'signin') {
  const modal = document.getElementById('modal-auth');
  if (!modal) return;
  modal.classList.remove('hidden');
  switchAuthTab(mode);
}

function switchAuthTab(mode) {
  const tabSignIn = document.getElementById('auth-tab-signin');
  const tabCreate = document.getElementById('auth-tab-create');
  const formSignIn = document.getElementById('auth-form-signin');
  const formCreate = document.getElementById('auth-form-create');
  const formForgot = document.getElementById('auth-form-forgot');

  if (!tabSignIn || !tabCreate) return;
  if (formForgot) formForgot.classList.add('hidden');

  if (mode === 'signin') {
    tabSignIn.classList.add('border-emerald-800', 'text-emerald-900', 'font-bold');
    tabSignIn.classList.remove('border-transparent', 'text-stone-400');
    tabCreate.classList.remove('border-emerald-800', 'text-emerald-900', 'font-bold');
    tabCreate.classList.add('border-transparent', 'text-stone-400');
    formSignIn.classList.remove('hidden');
    formCreate.classList.add('hidden');
  } else {
    tabCreate.classList.add('border-emerald-800', 'text-emerald-900', 'font-bold');
    tabCreate.classList.remove('border-transparent', 'text-stone-400');
    tabSignIn.classList.remove('border-emerald-800', 'text-emerald-900', 'font-bold');
    tabSignIn.classList.add('border-transparent', 'text-stone-400');
    formCreate.classList.remove('hidden');
    formSignIn.classList.add('hidden');
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPassword = (input.type === 'password');
  input.type = isPassword ? 'text' : 'password';
  btn.innerHTML = isPassword
    ? '<svg class="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>'
    : '<svg class="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>';
}

function handleSignInSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('signin-email');
  const passInput = document.getElementById('signin-password');
  const errEl = document.getElementById('signin-error');

  if (!emailInput.value || !emailInput.value.includes('@')) {
    errEl.textContent = 'Please provide a valid college or personal email address.';
    errEl.classList.remove('hidden');
    return;
  }
  if (!passInput.value || passInput.value.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters.';
    errEl.classList.remove('hidden');
    return;
  }

  errEl.classList.add('hidden');
  const nameFromEmail = emailInput.value.split('@')[0].replace(/[._]/g, ' ');
  const capitalizedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

  state.user = {
    isLoggedIn: true,
    name: capitalizedName || 'Aarav Patel',
    email: emailInput.value,
    college: 'Engineering Student, India',
    memberSince: 'October 2026',
    completedCourses: state.user.completedCourses || ['course-1']
  };

  saveState();
  closeAllModals();
  showToast(`Welcome back, ${state.user.name}! Your plan & course progress are synced.`);
  renderApp();
}

function handleCreateAccountSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('create-name');
  const emailInput = document.getElementById('create-email');
  const collegeInput = document.getElementById('create-college');
  const passInput = document.getElementById('create-password');
  const errEl = document.getElementById('create-error');

  if (!nameInput.value.trim()) {
    errEl.textContent = 'Please enter your full name.';
    errEl.classList.remove('hidden');
    return;
  }
  if (!emailInput.value || !emailInput.value.includes('@')) {
    errEl.textContent = 'Please provide a valid email.';
    errEl.classList.remove('hidden');
    return;
  }
  if (!passInput.value || passInput.value.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters.';
    errEl.classList.remove('hidden');
    return;
  }

  errEl.classList.add('hidden');
  state.user = {
    isLoggedIn: true,
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    college: collegeInput.value.trim() || 'College Student, India',
    memberSince: 'October 2026',
    completedCourses: []
  };

  saveState();
  closeAllModals();
  showToast(`Account created! Welcome to MILESTONE, ${state.user.name}.`);
  renderApp();
}

function showForgotPassword() {
  const formSignIn = document.getElementById('auth-form-signin');
  const formCreate = document.getElementById('auth-form-create');
  const formForgot = document.getElementById('auth-form-forgot');
  if (formSignIn) formSignIn.classList.add('hidden');
  if (formCreate) formCreate.classList.add('hidden');
  if (formForgot) formForgot.classList.remove('hidden');
}

function handleForgotPasswordSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value;
  const msg = document.getElementById('forgot-msg');
  if (!email || !email.includes('@')) {
    msg.textContent = 'Please enter a valid email address.';
    msg.className = 'text-xs text-coral-600 block';
    return;
  }
  msg.textContent = `A simulated password reset link has been sent to ${email}. (Demo flow)`;
  msg.className = 'text-xs text-emerald-800 block';
  setTimeout(() => {
    switchAuthTab('signin');
  }, 2400);
}

function signOutUser() {
  state.user = {
    isLoggedIn: false,
    name: 'Guest Explorer',
    email: '',
    college: '',
    memberSince: '',
    completedCourses: []
  };
  state.activeTab = 'landing';
  saveState();
  closeAllModals();
  const dropdown = document.getElementById('account-dropdown-menu');
  if (dropdown) dropdown.classList.add('hidden');
  showToast("You’ve signed out.");
  renderApp();
}

function openProfileModal() {
  const m = document.getElementById('modal-profile');
  if (!m) return;
  const container = document.getElementById('profile-details-container');
  if (container) {
    const currentTheme = state.theme || 'system';
    container.innerHTML = `
      <div class="p-3 rounded-xl bg-stone-50 dark:bg-[#162621] border border-stone-200 dark:border-[#243B34] flex justify-between items-center">
        <span class="text-stone-500 dark:text-stone-400">Full Name:</span>
        <span class="font-bold text-stone-900 dark:text-stone-100">${state.user ? state.user.name : 'Guest Explorer'}</span>
      </div>
      <div class="p-3 rounded-xl bg-stone-50 dark:bg-[#162621] border border-stone-200 dark:border-[#243B34] flex justify-between items-center">
        <span class="text-stone-500 dark:text-stone-400">Email:</span>
        <span class="font-bold text-stone-900 dark:text-stone-100">${state.user && state.user.email ? state.user.email : 'Not signed in'}</span>
      </div>
      <div class="p-3 rounded-xl bg-stone-50 dark:bg-[#162621] border border-stone-200 dark:border-[#243B34] flex justify-between items-center">
        <span class="text-stone-500 dark:text-stone-400">College / Context:</span>
        <span class="font-bold text-stone-900 dark:text-stone-100">${state.user && state.user.college ? state.user.college : 'College Student, India'}</span>
      </div>
      <div class="p-3 rounded-xl bg-stone-50 dark:bg-[#162621] border border-stone-200 dark:border-[#243B34] flex justify-between items-center">
        <span class="text-stone-500 dark:text-stone-400">Member Since:</span>
        <span class="font-bold text-stone-900 dark:text-stone-100">${(state.user && state.user.memberSince) || 'October 2026'}</span>
      </div>
      <div class="p-3 rounded-xl bg-stone-50 dark:bg-[#162621] border border-stone-200 dark:border-[#243B34] flex justify-between items-center">
        <span class="text-stone-500 dark:text-stone-400">Appearance Theme:</span>
        <div class="inline-flex items-center p-0.5 rounded-lg bg-stone-200 dark:bg-stone-800 text-[11px] font-semibold">
          <button type="button" onclick="setAppTheme('light')" class="px-2 py-0.5 rounded ${currentTheme === 'light' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 dark:text-stone-400'}">Light</button>
          <button type="button" onclick="setAppTheme('dark')" class="px-2 py-0.5 rounded ${currentTheme === 'dark' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600 dark:text-stone-400'}">Dark</button>
          <button type="button" onclick="setAppTheme('system')" class="px-2 py-0.5 rounded ${currentTheme === 'system' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' : 'text-stone-600 dark:text-stone-400'}">System</button>
        </div>
      </div>
    `;
  }
  m.classList.remove('hidden');
}

function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-forest-950 text-white text-xs font-semibold shadow-2xl border border-emerald-500/30 transition-all opacity-0 pointer-events-none transform translate-y-2';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove('opacity-0', 'translate-y-2');
  toast.classList.add('pointer-events-none');
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
  }, 3200);
}

/* =========================================================================
   1. GOAL SETUP FLOW (Step-by-Step with Clear Progress)
   ========================================================================= */
function renderSetupFlow() {
  const container = document.getElementById('setup-step-container');
  if (!container) return;

  const stepNum = state.setupStep;
  const titles = [
    'What milestone are you aiming for?',
    'What is your target time horizon?',
    'How much can you comfortably set aside each month?',
    'How do you feel about market ups and downs?'
  ];

  const scenarioKey = SCENARIO_RATES[state.selectedScenario] ? state.selectedScenario : 'middle';
  const selectedScenario = SCENARIO_RATES[scenarioKey];
  const monthlyNeeded = calculatePlanMonthlyNeeded(state.goalAmount, scenarioKey, state.timeHorizonYears);
  const suggestedMonthly = monthlyNeeded === null ? null : roundMonthlyContributionUp(monthlyNeeded);
  const canApplySuggestedMonthly = suggestedMonthly !== null &&
    suggestedMonthly <= PLAN_INPUT_LIMITS.monthlyContribution.max &&
    suggestedMonthly >= PLAN_INPUT_LIMITS.monthlyContribution.min;

  let stepHTML = '';

  if (stepNum === 1) {
    stepHTML = `
      <div class="space-y-6">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">Step 1 of 4 • Goal Amount</span>
          <h2 class="text-2xl sm:text-3xl font-bold font-heading text-stone-900">${titles[0]}</h2>
          <p class="text-stone-600 mt-2 text-sm sm:text-base">For most college students in India, hitting your first ₹10 Lakhs is the benchmark of financial self-reliance. Pick a preset or enter your custom goal.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button type="button" onclick="setGoalAmount(500000)" class="p-4 rounded-xl border text-left transition-all ${state.goalAmount === 500000 ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-700' : 'border-stone-200 bg-white hover:border-emerald-600'}">
            <div class="text-xs font-semibold text-stone-500 uppercase">Emergency & Cushion</div>
            <div class="text-xl font-bold text-stone-900 mt-1 tabular-nums">₹5,00,000</div>
            <div class="text-xs text-stone-600 mt-1">₹5 Lakhs cushion post-college</div>
          </button>

          <button type="button" onclick="setGoalAmount(1000000)" class="p-4 rounded-xl border text-left transition-all ${state.goalAmount === 1000000 ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-700' : 'border-stone-200 bg-white hover:border-emerald-600'}">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-emerald-800 uppercase">Popular</span>
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
            </div>
            <div class="text-xl font-bold text-stone-900 mt-1 tabular-nums">₹10,00,000</div>
            <div class="text-xs text-stone-600 mt-1">The "Student Millionaire" milestone</div>
          </button>

          <button type="button" onclick="setGoalAmount(2500000)" class="p-4 rounded-xl border text-left transition-all ${state.goalAmount === 2500000 ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-700' : 'border-stone-200 bg-white hover:border-emerald-600'}">
            <div class="text-xs font-semibold text-stone-500 uppercase">Higher Studies / Nest Egg</div>
            <div class="text-xl font-bold text-stone-900 mt-1 tabular-nums">₹25,00,000</div>
            <div class="text-xs text-stone-600 mt-1">₹25 Lakhs long-term fund</div>
          </button>
        </div>

        <div class="bg-stone-50 p-4 rounded-xl border border-stone-200">
          <label class="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1" for="custom-goal-input">Or enter a custom amount</label>
          <div class="relative max-w-sm">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-semibold text-lg">₹</span>
            <input id="custom-goal-input" type="number" step="50000" min="50000" max="100000000" value="${state.goalAmount}"
              onchange="setGoalAmount(Number(this.value))"
              class="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-300 rounded-lg text-lg font-bold text-stone-900 tabular-nums focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 outline-none" />
          </div>
          <span class="text-xs text-stone-500 mt-1.5 block">Entered: ${formatLakhs(state.goalAmount)} (${state.goalAmount.toLocaleString('en-IN')} Indian Rupees)</span>
        </div>
      </div>
    `;
  } else if (stepNum === 2) {
    stepHTML = `
      <div class="space-y-6">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">Step 2 of 4 • Time Horizon</span>
          <h2 class="text-2xl sm:text-3xl font-bold font-heading text-stone-900">${titles[1]}</h2>
          <p class="text-stone-600 mt-2 text-sm sm:text-base">Investing is patient work. The longer your time horizon, the more time compounding has to work, and the less short-term dips will sting.</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-stone-600">Selected Horizon:</span>
            <span class="text-2xl font-bold font-heading text-emerald-900 tabular-nums">${state.timeHorizonYears} Years</span>
          </div>
          
          <input type="range" min="3" max="15" step="1" value="${state.timeHorizonYears}"
            oninput="setTimeHorizon(Number(this.value))"
            class="w-full accent-emerald-800 cursor-pointer" />

          <div class="flex justify-between text-xs text-stone-400 font-medium">
            <span>3 Years (Short)</span>
            <span>7-8 Years (College + Early Career)</span>
            <span>15 Years (Long)</span>
          </div>

          <div class="flex flex-wrap gap-2 pt-2">
            ${[3, 5, 8, 10, 12, 15].map(yr => `
              <button type="button" onclick="setTimeHorizon(${yr})" class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${state.timeHorizonYears === yr ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'}">
                ${yr} Years
              </button>
            `).join('')}
          </div>
        </div>

        <div class="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <svg class="w-5 h-5 text-amber-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div>
            <strong class="font-semibold">Student Context:</strong> If you are 19 or 20 today, an 8-year horizon means reaching your milestone before you turn 28. That gives you time to finish college and settle into work.
          </div>
        </div>
      </div>
    `;
  } else if (stepNum === 3) {
    stepHTML = `
      <div class="space-y-6">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">Step 3 of 4 • Monthly Contribution</span>
          <h2 class="text-2xl sm:text-3xl font-bold font-heading text-stone-900">${titles[2]}</h2>
          <p class="text-stone-600 mt-2 text-sm sm:text-base">Start with an amount you can stick to without stressing your semester fees, food, or hostel rent. You can always step it up later.</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold text-stone-500 uppercase">Monthly Contribution</span>
              <div class="text-3xl font-extrabold font-heading text-emerald-900 mt-1 tabular-nums">${formatINR(state.monthlyContribution)}<span class="text-base font-normal text-stone-500"> / month</span></div>
            </div>
            <div class="text-right">
              <span class="text-xs text-stone-500 block">Daily equivalent</span>
              <span class="text-sm font-semibold text-stone-800 tabular-nums">~${formatINR(state.monthlyContribution / 30)} / day</span>
            </div>
          </div>

          <input type="range" min="500" max="15000" step="250" value="${state.monthlyContribution}"
            oninput="setMonthlyContribution(Number(this.value))"
            class="w-full accent-emerald-800 cursor-pointer" />

          <div class="flex justify-between text-xs text-stone-400">
            <span>₹500 (College Pocket)</span>
            <span>₹3,000 (Stipend Share)</span>
            <span>₹15,000 (Early Salary)</span>
          </div>

          <div class="flex flex-wrap gap-2 pt-2">
            ${[500, 1000, 2000, 3000, 5000, 8000].map(amt => `
              <button type="button" onclick="setMonthlyContribution(${amt})" class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${state.monthlyContribution === amt ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'}">
                ${formatINR(amt)}
              </button>
            `).join('')}
          </div>

          <div class="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-stone-700">
            <p>
              To reach ${formatINR(state.goalAmount)} in ${state.timeHorizonYears} years, the ${selectedScenario.name} example estimates about
              <strong class="text-emerald-900">${formatINR(monthlyNeeded)} per month</strong>.
              This is an illustrative estimate, not a guarantee.
            </p>
            ${state.monthlyContribution >= monthlyNeeded
              ? `<p class="mt-2 font-semibold text-emerald-800">Your current amount already meets this estimate.</p>`
              : canApplySuggestedMonthly
                ? `<button type="button" onclick="setMonthlyContribution(${suggestedMonthly})" class="mt-3 px-3 py-2 rounded-lg bg-emerald-800 text-white font-semibold hover:bg-emerald-700">Use ${formatINR(suggestedMonthly)} per month</button>`
                : `<p class="mt-2 text-amber-800">This is above the current monthly amount limit of ${formatINR(PLAN_INPUT_LIMITS.monthlyContribution.max)}. Try a lower goal or a longer time horizon.</p>`}
          </div>
        </div>

        <div class="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="text-xs text-stone-600">
            <span class="font-semibold text-stone-900">Student Stipend Sanity Check:</span> If monthly allowance/stipend is ₹${state.stipendAmount.toLocaleString('en-IN')}, this investment is <span class="font-bold text-emerald-800 tabular-nums">${Math.round((state.monthlyContribution / state.stipendAmount) * 100)}%</span> of cashflow.
          </div>
          <span class="px-2.5 py-1 rounded-md text-[11px] font-semibold ${state.monthlyContribution <= state.stipendAmount * 0.5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} whitespace-nowrap">
            ${state.monthlyContribution <= state.stipendAmount * 0.5 ? 'Healthy Buffer' : 'Tight Margin'}
          </span>
        </div>
      </div>
    `;
  } else if (stepNum === 4) {
    stepHTML = `
      <div class="space-y-6">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">Step 4 of 4 • Comfort with Volatility</span>
          <h2 class="text-2xl sm:text-3xl font-bold font-heading text-stone-900">${titles[3]}</h2>
          <p class="text-stone-600 mt-2 text-sm sm:text-base">Real markets go up and down like the monsoon. Knowing your temperament prevents you from selling at the wrong time.</p>
        </div>

        <div class="grid grid-cols-1 gap-3.5">
          <button type="button" onclick="setComfortLevel('low')" class="p-4 sm:p-5 rounded-2xl border text-left transition-all ${state.comfortLevel === 'low' ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-700' : 'border-stone-200 bg-white hover:border-emerald-600'}">
            <div class="flex items-center justify-between">
              <span class="font-bold text-stone-900">I get uneasy when account values drop</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">Low Tolerance</span>
            </div>
            <p class="text-xs sm:text-sm text-stone-600 mt-1.5">You prefer stability over chasing high returns. A drop of even 10% would stress your exam prep. You value sleeping peacefully at night.</p>
          </button>

          <button type="button" onclick="setComfortLevel('moderate')" class="p-4 sm:p-5 rounded-2xl border text-left transition-all ${state.comfortLevel === 'moderate' ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-700' : 'border-stone-200 bg-white hover:border-emerald-600'}">
            <div class="flex items-center justify-between">
              <span class="font-bold text-stone-900">I can handle normal market dips (Recommended)</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-medium">Moderate Tolerance</span>
            </div>
            <p class="text-xs sm:text-sm text-stone-600 mt-1.5">You understand that equity markets fluctuate 15-20% periodically. As long as the long-term trend compounds, temporary dips don't shake you.</p>
          </button>

          <button type="button" onclick="setComfortLevel('high')" class="p-4 sm:p-5 rounded-2xl border text-left transition-all ${state.comfortLevel === 'high' ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-700' : 'border-stone-200 bg-white hover:border-emerald-600'}">
            <div class="flex items-center justify-between">
              <span class="font-bold text-stone-900">I stay focused on the multi-year horizon</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">Higher Tolerance</span>
            </div>
            <p class="text-xs sm:text-sm text-stone-600 mt-1.5">You are willing to endure steep 25-35% paper drawdowns in exchange for potentially faster wealth growth. You view dips as accumulation opportunities.</p>
          </button>
        </div>
      </div>
    `;
  }

  container.innerHTML = stepHTML;

  const countEl = document.getElementById('setup-step-count');
  if (countEl) countEl.textContent = `Step ${stepNum} of 4`;
  const barEl = document.getElementById('setup-step-bar');
  if (barEl) barEl.style.width = `${stepNum * 25}%`;

  const prevBtn = document.getElementById('setup-prev-btn');
  const nextBtn = document.getElementById('setup-next-btn');
  if (prevBtn) {
    prevBtn.disabled = (state.setupStep === 1);
    prevBtn.classList.toggle('opacity-50', state.setupStep === 1);
  }
  if (nextBtn) {
    nextBtn.textContent = (state.setupStep === 4) ? 'Compare 3 Futures →' : 'Continue →';
  }
}

function setupNextStep() {
  if (state.setupStep < 4) {
    state.setupStep++;
    persistPlan();
    renderSetupFlow();
    window.scrollTo({ top: 80, behavior: 'smooth' });
  } else {
    persistPlan(true);
    navigateTo('scenarios');
  }
}

function setupPrevStep() {
  if (state.setupStep > 1) {
    state.setupStep--;
    saveState();
    renderSetupFlow();
    window.scrollTo({ top: 80, behavior: 'smooth' });
  } else {
    navigateTo('landing');
  }
}

function setGoalAmount(amount) {
  if (!validatePlanInput('goalAmount', amount)) {
    const input = document.getElementById('custom-goal-input');
    if (input) {
      input.setCustomValidity('Enter a whole amount from ₹50,000 to ₹10,00,00,000 in ₹50,000 steps.');
      input.reportValidity();
    } else {
      showToast('Choose a goal from ₹50,000 to ₹10,00,00,000.');
    }
    return;
  }
  const input = document.getElementById('custom-goal-input');
  if (input) input.setCustomValidity('');
  state.goalAmount = amount;
  persistPlan();
  renderSetupFlow();
}

function setTimeHorizon(years) {
  if (!validatePlanInput('timeHorizonYears', years)) {
    showToast('Choose a time horizon from 3 to 15 years.');
    return;
  }
  state.timeHorizonYears = years;
  persistPlan();
  renderSetupFlow();
}

function setMonthlyContribution(amt) {
  if (!validatePlanInput('monthlyContribution', amt)) {
    showToast('Choose a monthly amount from ₹500 to ₹15,000 in ₹250 steps.');
    return;
  }
  state.monthlyContribution = amt;
  persistPlan();
  renderSetupFlow();
}

function setComfortLevel(level) {
  if (!['low', 'moderate', 'high'].includes(level)) {
    showToast('Choose one of the available risk-comfort options.');
    return;
  }
  state.comfortLevel = level;
  state.selectedScenario = scenarioForComfort(level);
  persistPlan();
  renderSetupFlow();
}

/* =========================================================================
   2. “THREE FUTURES” PLAN COMPARISON
   ========================================================================= */
function renderScenariosView() {
  const container = document.getElementById('scenarios-cards-container');
  if (!container) return;

  const scenarios = ['slower', 'middle', 'faster'];
  const years = state.timeHorizonYears;
  const monthly = state.monthlyContribution;
  const goal = state.goalAmount;

  const cardsHTML = scenarios.map(key => {
    const s = SCENARIO_RATES[key];
    const estimatedTotal = calculatePlanSIP(monthly, key, years);
    const totalDeposited = monthly * years * 12;
    const estGrowth = Math.max(0, estimatedTotal - totalDeposited);
    const yearsToGoal = calculatePlanYearsToGoal(monthly, key, goal);
    const isSelected = (state.selectedScenario === key);

    return `
      <div class="relative bg-white rounded-2xl border-2 transition-all p-6 flex flex-col justify-between ${isSelected ? 'border-emerald-700 shadow-lg ring-1 ring-emerald-700/50' : 'border-stone-200 hover:border-stone-300 shadow-sm'}">
        ${isSelected ? `
          <div class="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-emerald-800 text-white text-[11px] font-semibold tracking-wide uppercase shadow-sm">
            Current Selection
          </div>
        ` : ''}

        <div>
          <div class="flex items-start justify-between gap-2 mb-2">
            <div>
              <span class="text-xs font-semibold text-stone-400 uppercase tracking-wider">Scenario ${s.name}</span>
              <h3 class="text-xl font-bold font-heading text-stone-900">${s.title}</h3>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${s.volatilityClass}">
              ${s.volatilityPill}
            </span>
          </div>

          <p class="text-xs sm:text-sm text-stone-600 mb-5 leading-relaxed">
            ${s.description}
          </p>

          <div class="bg-stone-50 rounded-xl p-4 border border-stone-100 space-y-3 mb-5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-stone-500">Illustrative Band:</span>
              <span class="font-semibold text-stone-900 tabular-nums">${s.rateRange}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-stone-500">Estimated Value at ${years} Yrs:</span>
              <span class="font-bold text-stone-900 text-sm tabular-nums">${formatINR(estimatedTotal)}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-stone-500">Est. Time to Reach ${formatLakhs(goal)}:</span>
              <span class="font-bold text-emerald-800 text-sm tabular-nums">${formatGoalTime(yearsToGoal)}</span>
            </div>
            <div class="flex items-center justify-between text-xs pt-1 border-t border-stone-200">
              <span class="text-stone-500">Typical Bad-Year Dip:</span>
              <span class="font-semibold text-amber-900 tabular-nums">${s.maxDip}</span>
            </div>
          </div>

          <div class="space-y-1.5 mb-6 text-xs text-stone-500">
            <div class="flex justify-between">
              <span>Your Contributions:</span>
              <span class="font-medium text-stone-700 tabular-nums">${formatINR(totalDeposited)}</span>
            </div>
            <div class="flex justify-between">
              <span>Potential Growth:</span>
              <span class="font-medium text-emerald-700 tabular-nums">+${formatINR(estGrowth)}</span>
            </div>
            <div class="w-full bg-stone-200 h-2 rounded-full overflow-hidden flex mt-2">
              <div style="width: ${(totalDeposited / estimatedTotal) * 100}%" class="bg-stone-700 h-full" title="Principal Deposited"></div>
              <div style="width: ${(estGrowth / estimatedTotal) * 100}%" class="bg-emerald-500 h-full" title="Estimated Compounding Growth"></div>
            </div>
            <div class="flex justify-between text-[10px] text-stone-400 pt-1">
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-stone-700 inline-block"></span> Principal</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Est. Growth</span>
            </div>
          </div>
        </div>

        <button type="button" onclick="selectScenario('${key}')"
          class="w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${isSelected ? 'bg-emerald-800 text-white shadow-sm' : 'bg-stone-100 text-stone-800 hover:bg-stone-200'}">
          ${isSelected ? 'Selected Scenario ✓' : `Select ${s.name} Scenario`}
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = cardsHTML;

  const slider = document.getElementById('scenarios-monthly-slider');
  const sliderVal = document.getElementById('scenarios-monthly-val');
  if (slider) slider.value = state.monthlyContribution;
  if (sliderVal) sliderVal.textContent = formatINR(state.monthlyContribution);
}

function updateScenariosContribution(val) {
  const amount = Number(val);
  if (!validatePlanInput('monthlyContribution', amount)) {
    showToast('Choose a monthly amount from ₹500 to ₹15,000.');
    renderScenariosView();
    return;
  }
  state.monthlyContribution = amount;
  persistPlan();
  const sliderVal = document.getElementById('scenarios-monthly-val');
  if (sliderVal) sliderVal.textContent = formatINR(state.monthlyContribution);
  renderScenariosView();
}

function selectScenario(scenarioKey) {
  if (!SCENARIO_RATES[scenarioKey]) {
    showToast('That scenario is not available. Choose Slower, Middle, or Faster.');
    return;
  }
  state.selectedScenario = scenarioKey;
  persistPlan(true);
  renderScenariosView();
  navigateTo('receipt');
}

/* =========================================================================
   3. “WHY THIS PLAN?” RECEIPT (Transparent Explanation)
   ========================================================================= */
function renderReceiptView() {
  const container = document.getElementById('receipt-content-container');
  if (!container) return;

  const scenarioKey = SCENARIO_RATES[state.selectedScenario] ? state.selectedScenario : 'middle';
  const s = SCENARIO_RATES[scenarioKey];
  const planAllocation = PLAN_ALLOCATIONS[scenarioKey];
  const years = state.timeHorizonYears;
  const monthly = state.monthlyContribution;
  const goal = state.goalAmount;
  const totalContributions = monthly * Math.round(years * 12);
  const estimatedValue = calculatePlanSIP(monthly, scenarioKey, years);
  const estimatedGrowth = Math.max(0, estimatedValue - totalContributions);
  const yearsToGoal = calculatePlanYearsToGoal(monthly, scenarioKey, goal);
  const monthlyNeeded = calculatePlanMonthlyNeeded(goal, scenarioKey, years);

  container.innerHTML = `
    <div class="max-w-3xl mx-auto space-y-6">
      <div>
        <span class="text-xs font-semibold text-emerald-800 uppercase tracking-widest">My plan</span>
        <h1 class="text-3xl font-bold font-heading text-stone-900 dark:text-stone-100 mt-1">Your plan, made simple</h1>
        <p class="text-sm text-stone-600 dark:text-stone-300 mt-2">Your goal, monthly amount, and a simple example of what they could add up to.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="p-5 rounded-2xl bg-white dark:bg-[#121F1B] border border-stone-200 dark:border-[#243B34]">
          <span class="text-xs text-stone-500 dark:text-stone-400">Your goal</span>
          <strong class="block text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">${formatINR(goal)}</strong>
        </div>
        <div class="p-5 rounded-2xl bg-white dark:bg-[#121F1B] border border-stone-200 dark:border-[#243B34]">
          <span class="text-xs text-stone-500 dark:text-stone-400">Your monthly amount</span>
          <strong class="block text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">${formatINR(monthly)} / month</strong>
        </div>
        <div class="p-5 rounded-2xl bg-white dark:bg-[#121F1B] border border-stone-200 dark:border-[#243B34]">
          <span class="text-xs text-stone-500 dark:text-stone-400">Time you chose</span>
          <strong class="block text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">${years} years</strong>
        </div>
        <div class="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
          <span class="text-xs text-emerald-800 dark:text-emerald-300">Illustrative value after ${years} years</span>
          <strong class="block text-xl font-bold text-emerald-950 dark:text-emerald-100 mt-1">${formatINR(estimatedValue)}</strong>
        </div>
      </div>

      <div class="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121F1B] border border-stone-200 dark:border-[#243B34] space-y-4">
        <h2 class="text-lg font-bold text-stone-900 dark:text-stone-100">How the estimate is worked out</h2>
        <p class="text-sm text-stone-600 dark:text-stone-300">If you add ${formatINR(monthly)} each month for ${years} years:</p>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between gap-4"><span class="text-stone-600 dark:text-stone-300">You would add</span><strong class="text-stone-900 dark:text-stone-100">${formatINR(totalContributions)}</strong></div>
          <div class="flex justify-between gap-4"><span class="text-stone-600 dark:text-stone-300">Possible growth in this example</span><strong class="text-stone-900 dark:text-stone-100">${formatINR(estimatedGrowth)}</strong></div>
          <div class="flex justify-between gap-4 border-t border-stone-200 dark:border-[#243B34] pt-3"><span class="text-stone-600 dark:text-stone-300">Estimated time to your goal at this pace</span><strong class="text-emerald-800 dark:text-emerald-300">${formatGoalTime(yearsToGoal)}</strong></div>
        </div>
        <div class="flex justify-between gap-4 border-t border-stone-200 dark:border-[#243B34] pt-3 text-sm">
          <span class="text-stone-600 dark:text-stone-300">To reach ${formatINR(goal)} in ${years} years, save about</span>
          <strong class="text-emerald-800 dark:text-emerald-300">${formatINR(monthlyNeeded)} / month</strong>
        </div>
        <p class="text-sm font-medium ${estimatedValue < goal ? 'text-amber-800 dark:text-amber-300' : 'text-emerald-800 dark:text-emerald-300'}">
          ${monthlyNeeded > monthly
            ? `At ${formatINR(monthly)} per month, the example reaches ${formatINR(estimatedValue)} by year ${years}, which is ${formatINR(goal - estimatedValue)} short of your goal. About ${formatINR(monthlyNeeded)} per month is needed to meet the chosen timeline under the same assumptions.`
            : `At ${formatINR(monthly)} per month, the example reaches ${formatINR(estimatedValue)} by year ${years}, enough to meet this goal under the same assumptions.`}
        </p>
        <p class="text-xs leading-relaxed text-stone-500 dark:text-stone-400">This illustrative example estimates category growth separately, then adds the results using the selected ${s.name} plan's percentages. It assumes yearly growth of 15% for equity, 7% for debt, and 8% for gold, with monthly contributions added at the end of each month. These assumptions are examples only; actual returns can be higher or lower, including losses. Fees, taxes, and inflation are not included.</p>
      </div>

      <details class="p-5 rounded-2xl bg-white dark:bg-[#121F1B] border border-stone-200 dark:border-[#243B34]">
        <summary class="cursor-pointer font-bold text-stone-900 dark:text-stone-100">Understand this mix</summary>
        <p class="text-xs text-stone-600 dark:text-stone-300 mt-3">${planAllocation.name}: these percentages are an educational example you selected, not a personalized recommendation or an actual portfolio. If your monthly amount were divided this way, the sample amounts would be:</p>
        <div class="space-y-3 mt-3">
          ${planAllocation.allocations.map(item => `
            <div class="p-3 rounded-xl bg-stone-50 dark:bg-[#162621] border border-stone-200 dark:border-[#243B34]">
              <div class="flex justify-between gap-3 text-sm">
                <strong class="text-stone-900 dark:text-stone-100">${item.category} (${item.percent}%)</strong>
                <strong class="shrink-0 text-stone-900 dark:text-stone-100">${formatINR(Math.round(monthly * item.percent / 100))} / month</strong>
              </div>
              <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">Illustrative yearly growth assumption: ${item.annualRatePct}%</p>
              <p class="text-xs text-stone-600 dark:text-stone-300 mt-1">${item.description}</p>
              <p class="text-xs text-amber-800 dark:text-amber-300 mt-1"><strong>Risk:</strong> ${item.risk}</p>
            </div>
          `).join('')}
        </div>
        <p class="text-xs text-stone-500 dark:text-stone-400 mt-3">The examples do not identify specific products, and the percentages are not instructions to invest.</p>
      </details>

      <p class="text-xs text-stone-500 dark:text-stone-400">For learning only—not a promise or financial advice. Real returns vary, and life changes can affect how much you save.</p>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-200 dark:border-[#1F332C]">
        <button type="button" onclick="editAnswersFromReceipt()"
          class="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#162621] font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5">
          <svg class="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          <span>Change my choices</span>
        </button>

        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button type="button" onclick="downloadPlanPDF()"
            class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2">
            <svg class="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span>Download plan</span>
          </button>
          <button type="button" onclick="navigateTo('dip')"
            class="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 font-semibold text-xs sm:text-sm transition-all">
            Try a market dip
          </button>
          <button type="button" onclick="navigateTo('dashboard')"
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-800 dark:bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs sm:text-sm transition-all shadow-sm">
            See my progress
          </button>
        </div>
      </div>
    </div>
  `;
}

function editAnswersFromReceipt() {
  state.setupStep = 1;
  navigateTo('setup');
}

/* =========================================================================
   4. CALM DASHBOARD & GOAL COMPLETION
   ========================================================================= */
function renderDashboardView() {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  const scenarioKey = PLAN_ALLOCATIONS[state.selectedScenario] ? state.selectedScenario : 'middle';
  const s = SCENARIO_RATES[scenarioKey];
  const selectedAllocation = PLAN_ALLOCATIONS[scenarioKey];
  const monthly = state.monthlyContribution;
  const years = state.timeHorizonYears;
  const goal = state.goalAmount;

  const monthsIn = Math.min(state.simulatedMonthsElapsed, years * 12);
  const currentEstimatedValue = calculatePlanSIP(monthly, scenarioKey, monthsIn / 12);
  const progressPercent = Math.min(100, Math.round((currentEstimatedValue / goal) * 100));
  const amountRemaining = Math.max(0, goal - currentEstimatedValue);
  const remainingYears = calculatePlanYearsToGoal(monthly, scenarioKey, goal, currentEstimatedValue);
  const monthlyNeeded = calculatePlanMonthlyNeeded(goal, scenarioKey, years);
  const targetMonthlyContribution = monthlyNeeded === null ? null : roundMonthlyContributionUp(monthlyNeeded);
  const targetBalanceAtMonth = targetMonthlyContribution === null
    ? 0
    : calculatePlanSIP(targetMonthlyContribution, scenarioKey, monthsIn / 12);
  const paceDifference = currentEstimatedValue - targetBalanceAtMonth;
  const previousEstimatedValue = calculatePlanSIP(monthly, scenarioKey, Math.max(0, monthsIn - 1) / 12);
  const modeledMonthlyGrowth = Math.round(currentEstimatedValue - previousEstimatedValue - (monthsIn > 0 ? monthly : 0));
  const previousGoalTime = calculatePlanYearsToGoal(monthly, scenarioKey, goal, previousEstimatedValue);
  const daysCloser = previousGoalTime === null || remainingYears === null
    ? null
    : Math.max(0, Math.round((previousGoalTime - remainingYears) * 365));

  const m25 = goal * 0.25;
  const m50 = goal * 0.50;
  const m75 = goal * 0.75;
  const m100 = goal;

  const passed25 = currentEstimatedValue >= m25;
  const passed50 = currentEstimatedValue >= m50;
  const passed75 = currentEstimatedValue >= m75;

  const slowerFV = calculatePlanSIP(monthly, 'slower', years);
  const middleFV = calculatePlanSIP(monthly, 'middle', years);
  const fasterFV = calculatePlanSIP(monthly, 'faster', years);
  const totalContributions = monthly * Math.round(years * 12);
  const selectedPlanValue = calculatePlanSIP(monthly, scenarioKey, years);
  const selectedPlanGrowth = Math.max(0, selectedPlanValue - totalContributions);
  const chartMonths = Math.max(1, Math.round(years * 12));
  const makeProjectionPath = (key) => Array.from({ length: chartMonths + 1 }, (_, month) => {
    const x = 10 + (580 * month) / chartMonths;
    const value = calculatePlanSIP(monthly, key, month / 12);
    const y = 220 - (185 * Math.min(value, goal)) / Math.max(goal, 1);
    return `${month === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  const slowerPath = makeProjectionPath('slower');
  const middlePath = makeProjectionPath('middle');
  const fasterPath = makeProjectionPath('faster');
  const selectedValue = {
    slower: slowerFV,
    middle: middleFV,
    faster: fasterFV
  }[state.selectedScenario];
  const selectedY = 220 - (185 * Math.min(selectedValue, goal)) / Math.max(goal, 1);
  const chartYears = [...new Set([0, Math.round(years / 3), Math.round((years * 2) / 3), years])];

  container.innerHTML = `
    <div class="max-w-6xl mx-auto space-y-8">
      
      <!-- Top Overview Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Your saved plan
            </span>
            <span class="text-xs text-stone-500">${state.user.name} • ${state.user.college}</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold font-heading text-stone-900">
            Your goal: ${formatLakhs(goal)}
          </h1>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button type="button" onclick="downloadPlanPDF()" class="px-3.5 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5">
            <svg class="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span>Download plan as PDF</span>
          </button>
          <button type="button" onclick="openInvestmentOptions()" class="px-3.5 py-2 rounded-xl bg-white dark:bg-[#162621] border border-[#E5E0D5] dark:border-[#243B34] hover:border-emerald-700 text-stone-800 dark:text-stone-200 font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5">
            <svg class="w-4 h-4 text-emerald-700 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <span>Explore 7 Options</span>
          </button>
          <button type="button" onclick="navigateTo('receipt')" class="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 bg-white dark:bg-[#162621] hover:bg-stone-50 dark:hover:bg-[#1B2F29] font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5">
            <svg class="w-4 h-4 text-stone-500 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span>My plan details</span>
          </button>
          <button type="button" onclick="navigateTo('dip')" class="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 font-semibold text-xs transition-all flex items-center gap-1.5">
            <svg class="w-4 h-4 text-amber-700 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
            <span>Explore Market Dip</span>
          </button>
        </div>
      </div>

      <!-- PRIMARY ANSWER: “HOW CLOSE AM I TO MY GOAL?” -->
      <div class="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-stone-100">
          <div>
            <span class="text-xs font-bold text-emerald-800 uppercase tracking-widest">Your goal at a glance</span>
            <h2 class="text-2xl sm:text-3xl font-bold font-heading text-stone-900 mt-1">
              Your goal is ${formatLakhs(goal)}
            </h2>
            <p class="text-stone-600 text-xs sm:text-sm mt-1 max-w-xl">
              This is an example, not money in an account. If you save <strong class="text-stone-900 font-semibold">${formatINR(monthly)} each month</strong>, the estimate is ${formatGoalTime(remainingYears)} to reach your goal. Real results can be different.
            </p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs shrink-0">
            <div class="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span class="text-stone-500 block text-[11px]">Goal:</span>
              <span class="font-bold text-stone-900 text-sm tabular-nums">${formatINR(goal)}</span>
            </div>
            <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span class="text-emerald-800 block text-[11px]">Example amount so far:</span>
              <span class="font-bold text-emerald-950 text-sm tabular-nums">${formatINR(currentEstimatedValue)}</span>
            </div>
            <div class="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span class="text-stone-500 block text-[11px]">Still needed:</span>
              <span class="font-bold text-stone-800 text-sm tabular-nums">${formatINR(amountRemaining)}</span>
            </div>
          </div>
        </div>

        <!-- MILESTONE CHECKPOINTS: 25%, 50%, 75%, 100% -->
        <div class="space-y-4">
          <div class="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span>Steps toward your goal:</span>
            <span class="text-emerald-800 font-bold tabular-nums">${progressPercent}% in this example (Month ${monthsIn} of ${years * 12})</span>
          </div>

          <div class="p-4 rounded-xl ${monthly >= monthlyNeeded ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'} text-xs">
            <p class="${monthly >= monthlyNeeded ? 'text-emerald-900' : 'text-amber-900'}">
              ${monthly >= monthlyNeeded
                ? `On pace in this illustration: ${formatINR(monthly)} per month meets the estimated ${formatINR(monthlyNeeded)} needed to reach your goal in ${years} years.`
                : `Behind the selected timeline in this illustration: about ${formatINR(monthlyNeeded)} per month is needed to reach your goal in ${years} years. Your current amount is ${formatINR(monthlyNeeded - monthly)} per month below that estimate.`}
            </p>
            <p class="mt-1 text-stone-600">
              By month ${monthsIn}, the example pace is ${formatINR(targetBalanceAtMonth)}; your current example is ${paceDifference >= 0 ? `${formatINR(paceDifference)} ahead` : `${formatINR(Math.abs(paceDifference))} behind`}.
            </p>
            ${targetMonthlyContribution > PLAN_INPUT_LIMITS.monthlyContribution.max
              ? `<p class="mt-1 text-amber-800">The required amount is above the current monthly input limit of ${formatINR(PLAN_INPUT_LIMITS.monthlyContribution.max)}. Try a lower goal or a longer timeline.</p>`
              : monthly < monthlyNeeded
                ? `<button type="button" onclick="editMonthlyContribution()" class="mt-2 font-semibold underline underline-offset-2 text-amber-900">Adjust monthly amount</button>`
                : ''}
          </div>

          <div class="relative py-4">
            <div class="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
              <div style="width: ${progressPercent}%" class="h-full bg-gradient-to-r from-emerald-700 to-emerald-500 transition-all duration-500"></div>
            </div>

            <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-1 pointer-events-none">
              <div class="w-5 h-5 rounded-full bg-emerald-800 border-2 border-white shadow flex items-center justify-center text-[9px] font-bold text-white">✓</div>
              
              <div class="w-6 h-6 rounded-full ${passed25 ? 'bg-emerald-700 text-white' : 'bg-white text-stone-500'} border-2 border-stone-300 shadow flex items-center justify-center text-[10px] font-bold" title="25% Milestone">
                ${passed25 ? '✓' : '25%'}
              </div>

              <div class="w-6 h-6 rounded-full ${passed50 ? 'bg-emerald-700 text-white' : 'bg-white text-stone-500'} border-2 border-stone-300 shadow flex items-center justify-center text-[10px] font-bold" title="50% Milestone">
                ${passed50 ? '✓' : '50%'}
              </div>

              <div class="w-6 h-6 rounded-full ${passed75 ? 'bg-emerald-700 text-white' : 'bg-white text-stone-500'} border-2 border-stone-300 shadow flex items-center justify-center text-[10px] font-bold" title="75% Milestone">
                ${passed75 ? '✓' : '75%'}
              </div>

              <div class="w-7 h-7 rounded-full bg-amber-500 text-white border-2 border-white shadow-md flex items-center justify-center text-[10px] font-extrabold" title="Goal Milestone">
                ★
              </div>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-2 text-center text-[11px] pt-1">
            <div class="space-y-0.5">
              <span class="font-bold text-stone-900 block">25% (${formatLakhs(m25)})</span>
              <span class="text-stone-500 block text-[10px]">First quarter</span>
            </div>
            <div class="space-y-0.5">
              <span class="font-bold text-stone-900 block">50% (${formatLakhs(m50)})</span>
              <span class="text-stone-500 block text-[10px]">Halfway</span>
            </div>
            <div class="space-y-0.5">
              <span class="font-bold text-stone-900 block">75% (${formatLakhs(m75)})</span>
              <span class="text-stone-500 block text-[10px]">Nearly there</span>
            </div>
            <div class="space-y-0.5">
              <span class="font-bold text-amber-900 block">100% (${formatLakhs(m100)})</span>
              <span class="text-stone-500 block text-[10px]">Goal reached</span>
            </div>
          </div>
        </div>

        <!-- WHAT CHANGED SINCE LAST UPDATE? -->
        <div class="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-start gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 shrink-0"></span>
            <div>
              <span class="font-bold text-stone-900 block">How does the example change each month?</span>
              <span class="text-stone-600 block mt-0.5">
                The example adds <strong class="text-stone-800 font-semibold">${formatINR(monthsIn > 0 ? monthly : 0)}</strong> saved and assumes the market changes by <strong class="text-emerald-800 font-semibold">${modeledMonthlyGrowth >= 0 ? '+' : '−'}${formatINR(Math.abs(modeledMonthlyGrowth))}</strong>. This is a calculation only—not an update to a real account${daysCloser === null ? '.' : `; in this example, the goal date moves about <strong class="text-stone-900 font-semibold">${daysCloser} days closer</strong>`}.
              </span>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold whitespace-nowrap">
            Example only
          </span>
        </div>

      </div>

      <section class="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-5" aria-labelledby="monthly-breakdown-title">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <span class="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Educational example only</span>
            <h2 id="monthly-breakdown-title" class="text-xl sm:text-2xl font-bold font-heading text-stone-900 mt-1">Monthly breakdown: ${selectedAllocation.name}</h2>
            <p class="text-xs sm:text-sm text-stone-600 mt-1">You selected this example plan. These percentages are for learning, not a personalized recommendation.</p>
          </div>
          <span class="text-sm font-semibold text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">${formatINR(monthly)} per month</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          ${selectedAllocation.allocations.map(item => `
            <div class="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div class="flex items-center justify-between gap-3">
                <strong class="text-sm text-stone-900">${item.category}</strong>
                <span class="text-xs font-semibold text-emerald-800">${item.percent}%</span>
              </div>
              <strong class="block text-lg text-stone-900 tabular-nums mt-2">${formatINR(Math.round(monthly * item.percent / 100))}<span class="text-xs font-medium text-stone-500"> / month</span></strong>
              <p class="text-xs leading-relaxed text-stone-500 mt-1">Example growth assumption: ${item.annualRatePct}% yearly</p>
              <p class="text-xs leading-relaxed text-stone-600 mt-2">${item.description}</p>
              <p class="text-xs leading-relaxed text-amber-800 mt-2"><strong>Risk:</strong> ${item.risk}</p>
            </div>
          `).join('')}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-stone-100 pt-4 text-xs">
          <div><span class="block text-stone-500">Total added in ${years} years</span><strong class="block text-stone-900 tabular-nums mt-1">${formatINR(totalContributions)}</strong></div>
          <div><span class="block text-stone-500">Estimated growth in this example</span><strong class="block text-emerald-800 tabular-nums mt-1">${formatINR(selectedPlanGrowth)}</strong></div>
          <div><span class="block text-stone-500">Illustrative value after ${years} years</span><strong class="block text-stone-900 tabular-nums mt-1">${formatINR(selectedPlanValue)}</strong></div>
        </div>

        <p class="text-xs leading-relaxed text-stone-600 border-t border-stone-100 pt-4">SIP (Systematic Investment Plan) is a way to contribute regularly; it is not a separate investment category. This example does not place trades or invest money.</p>
      </section>

      <!-- MULTI-PATH PROJECTION CHART SECTION -->
      <div class="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Example growth</span>
            <h2 class="text-xl sm:text-2xl font-bold font-heading text-stone-900 mt-0.5">Three ways the estimate could look</h2>
            <p class="text-xs sm:text-sm text-stone-500 mt-1">Compare your monthly saving over ${years} years. The percentages are assumed yearly growth, not promises.</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button type="button" onclick="quickSwitchScenario('slower')" class="px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${state.selectedScenario === 'slower' ? 'bg-stone-800 text-white border-stone-800' : 'bg-stone-50 text-stone-600 border-stone-200'}">
              Slower (~9.5%)
            </button>
            <button type="button" onclick="quickSwitchScenario('middle')" class="px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${state.selectedScenario === 'middle' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-stone-50 text-stone-600 border-stone-200'}">
              Middle (~11.6%)
            </button>
            <button type="button" onclick="quickSwitchScenario('faster')" class="px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${state.selectedScenario === 'faster' ? 'bg-amber-800 text-white border-amber-800' : 'bg-stone-50 text-stone-600 border-stone-200'}">
              Faster (~13.4%)
            </button>
          </div>
        </div>

        <div class="relative w-full h-72 sm:h-80 bg-stone-50/50 rounded-2xl border border-stone-100 p-4 flex flex-col justify-between overflow-hidden">
          <div class="absolute inset-x-4 top-[15%] border-b border-stone-200/60 flex justify-between text-[10px] text-stone-400">
            <span>Goal: ${formatLakhs(goal)}</span>
          </div>
          <div class="absolute inset-x-4 top-[54%] border-b border-stone-200/40 flex justify-between text-[10px] text-stone-400">
            <span>Midpoint: ${formatLakhs(goal / 2)}</span>
          </div>
          <div class="absolute inset-x-4 bottom-8 border-b border-stone-200/60 flex justify-between text-[10px] text-stone-400">
            <span>Start: ₹0</span>
          </div>

          <svg class="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#10B981" stop-opacity="0.25" />
                <stop offset="100%" stop-color="#10B981" stop-opacity="0.0" />
              </linearGradient>
            </defs>

            <line x1="0" y1="35" x2="600" y2="35" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4 4" />
            <path d="${slowerPath}" fill="none" stroke="#64748B" stroke-width="${state.selectedScenario === 'slower' ? '3.5' : '1.8'}" stroke-dasharray="${state.selectedScenario === 'slower' ? '0' : '3 3'}" class="transition-all" />
            <path d="${middlePath}" fill="none" stroke="#047857" stroke-width="${state.selectedScenario === 'middle' ? '3.5' : '1.8'}" stroke-dasharray="${state.selectedScenario === 'middle' ? '0' : '3 3'}" class="transition-all" />
            <path d="${fasterPath}" fill="none" stroke="#D97706" stroke-width="${state.selectedScenario === 'faster' ? '3.5' : '1.8'}" stroke-dasharray="${state.selectedScenario === 'faster' ? '0' : '3 3'}" class="transition-all" />

            ${state.selectedScenario === 'middle' ? `
              <path d="${middlePath} L 590 220 L 10 220 Z" fill="url(#areaGrad)" />
            ` : ''}

            <circle cx="590" cy="${selectedY}" r="6" fill="#064E3B" stroke="#FAF8F5" stroke-width="2" />
          </svg>

          <div class="flex justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-200">
            ${chartYears.map((year, index) => `<span>${year === 0 ? 'Today' : `Year ${year}`}${index === chartYears.length - 1 && year > 0 ? ' (Goal date)' : ''}</span>`).join('')}
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-stone-500 shrink-0"></span>
            <div>
                <span class="font-semibold text-stone-800">${state.selectedScenario === 'slower' ? 'Slower example (selected):' : 'Slower example:'}</span>
                <span class="text-stone-500 block tabular-nums">Example value: ${formatINR(slowerFV)}</span>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-emerald-700 shrink-0"></span>
            <div>
              <span class="font-semibold text-emerald-950">${state.selectedScenario === 'middle' ? 'Middle example (selected):' : 'Middle example:'}</span>
              <span class="text-emerald-800 block font-bold tabular-nums">Example value: ${formatINR(middleFV)}</span>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-amber-600 shrink-0"></span>
            <div>
              <span class="font-semibold text-amber-950">${state.selectedScenario === 'faster' ? 'Faster example (selected):' : 'Faster example:'}</span>
              <span class="text-amber-800 block tabular-nums">Example value: ${formatINR(fasterFV)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- PRACTICAL NEXT STEP CARD -->
      <div class="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="space-y-2 max-w-xl">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold tracking-wide uppercase">
            A simple first step
          </span>
          <h3 class="text-xl sm:text-2xl font-bold font-heading">
            Set aside money for unexpected expenses first.
          </h3>
          <p class="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
            Keep some money in a bank savings account for urgent costs, like a repair or fee. This can help you avoid needing to withdraw investments at a bad time.
          </p>
        </div>

        <div class="shrink-0 flex flex-col gap-2 w-full sm:w-auto">
          <button type="button" onclick="openStepChecklistModal()" class="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md text-center">
            View 3-Step Setup Checklist
          </button>
          <span class="text-[11px] text-emerald-300 text-center">Zero commitments • Pure education</span>
        </div>
      </div>

      <!-- Persistent Disclaimer Note -->
      <div class="p-4 rounded-xl bg-stone-100 border border-stone-200 text-center text-xs text-stone-600">
        <strong class="font-semibold text-stone-800">For learning only:</strong> These are examples, not a promise or financial advice. Returns can go up or down. Mutual fund investments are subject to market risks. Read all scheme related documents carefully.
      </div>
    </div>
  `;
}

function quickSwitchScenario(key) {
  if (!SCENARIO_RATES[key]) {
    showToast('That scenario is not available. Choose Slower, Middle, or Faster.');
    return;
  }
  state.selectedScenario = key;
  persistPlan(true);
  renderScenariosView();
  renderReceiptView();
  renderDashboardView();
  renderDipRehearsalView();
}

function editMonthlyContribution() {
  state.setupStep = 3;
  navigateTo('setup');
}

function openStepChecklistModal() {
  const m = document.getElementById('modal-checklist');
  if (m) m.classList.remove('hidden');
}

function simulateDipPlan(monthly, scenarioKey, years, goal, dropPercent, action) {
  const allocations = PLAN_ALLOCATIONS[scenarioKey]?.allocations || PLAN_ALLOCATIONS.middle.allocations;
  const horizonMonths = Math.round(years * 12);
  const dropMonth = 24;

  function project(includeDip) {
    const balances = allocations.map(() => 0);
    let valueBeforeDrop = 0;
    let valueAfterDrop = 0;
    let goalMonth = null;
    let finalValue = 0;

    for (let month = 1; month <= 1200; month++) {
      let contribution = monthly;
      if (includeDip && action === 'pause' && month > dropMonth && month <= dropMonth + 6) {
        contribution = 0;
      } else if (includeDip && action === 'increase' && month >= dropMonth && month < dropMonth + 12) {
        contribution += 500;
      }
      allocations.forEach((item, index) => {
        balances[index] = balances[index] * (1 + item.annualRatePct / 100 / 12) +
          contribution * item.percent / 100;
      });
      const totalValue = balances.reduce((total, balance) => total + balance, 0);

      if (month === dropMonth) {
        valueBeforeDrop = totalValue;
        if (includeDip) {
          balances.forEach((balance, index) => {
            balances[index] = balance * (1 - dropPercent / 100);
          });
          valueAfterDrop = balances.reduce((total, balance) => total + balance, 0);
        }
      }

      const currentValue = balances.reduce((total, balance) => total + balance, 0);
      if (goalMonth === null && currentValue >= goal) goalMonth = month;
      if (month === horizonMonths) finalValue = currentValue;
    }

    return { valueBeforeDrop, valueAfterDrop, goalMonth, finalValue };
  }

  const baseline = project(false);
  const simulated = project(true);
  let goalShiftMonths = null;
  if (baseline.goalMonth !== null && simulated.goalMonth !== null) {
    goalShiftMonths = baseline.goalMonth < dropMonth
      ? 0
      : simulated.goalMonth - baseline.goalMonth;
  }

  return {
    normalYear2: baseline.valueBeforeDrop,
    dippedYear2: simulated.valueAfterDrop,
    finalValue: simulated.finalValue,
    goalShiftMonths
  };
}

/* =========================================================================
   5. BAD-YEAR REHEARSAL (“Explore a Market Dip”)
   ========================================================================= */
function renderDipRehearsalView() {
  const container = document.getElementById('dip-rehearsal-content');
  if (!container) return;

  const scenarioKey = SCENARIO_RATES[state.selectedScenario] ? state.selectedScenario : 'middle';
  const s = SCENARIO_RATES[scenarioKey];
  const monthly = state.monthlyContribution;
  const years = state.timeHorizonYears;
  const dropPct = state.dipScenario.dropPercent;
  const action = state.dipScenario.actionTaken;
  const projection = simulateDipPlan(monthly, scenarioKey, years, state.goalAmount, dropPct, action);
  const normalYear2 = Math.round(projection.normalYear2);
  const dippedYear2 = Math.round(projection.dippedYear2);
  const dropAmount = Math.max(0, normalYear2 - dippedYear2);
  const finalRecoveredValue = Math.round(projection.finalValue);
  const delayMonths = projection.goalShiftMonths;
  const actionAdvice = action === 'continue'
    ? `This example keeps your ₹${monthly.toLocaleString('en-IN')}/month contribution unchanged and applies a one-time ${dropPct}% simulated decline to the balance at the end of Year 2.`
    : action === 'pause'
      ? `This example pauses the ₹${monthly.toLocaleString('en-IN')}/month contribution for six months after the simulated Year 2 decline, then resumes it.`
      : `This example adds ₹500/month for 12 months starting with the simulated Year 2 decline. Only use extra savings if they fit your budget.`;
  const timelineLabel = delayMonths === null
    ? 'Not reached in this 100-year simulation'
    : delayMonths > 0
      ? `About ${delayMonths} months later`
      : delayMonths < 0
        ? `About ${Math.abs(delayMonths)} months earlier`
        : 'No change in this estimate';

  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-8">
      
      <div class="flex items-center justify-between pb-3 border-b border-stone-200">
        <button type="button" onclick="navigateTo('dashboard')" class="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          Return to Dashboard
        </button>
        <span class="text-xs text-stone-500 font-medium">Educational Stress Testing</span>
      </div>

      <div class="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-semibold uppercase">Stress Test</span>
            <span class="text-xs text-amber-800 font-medium">Educational simulation • Not a prediction</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold font-heading text-stone-900">What if the market drops -${dropPct}% in Year 2?</h2>
          <p class="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Explore one hypothetical decline in an educational example. Markets do not follow a schedule, and this simulation does not predict what will happen.
          </p>
        </div>
        <div class="shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
          <span class="text-xs text-stone-500">Selected Model:</span>
          <span class="px-3 py-1 rounded-lg bg-white border border-stone-200 font-bold text-xs text-stone-800">${s.name} Scenario</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Estimated Normal Year 2</span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div>
            <div class="text-xs text-stone-400">Total Invested in 24 Months:</div>
            <div class="text-sm font-semibold text-stone-700 tabular-nums">${formatINR(monthly * 24)}</div>
            <div class="text-xs text-stone-400 mt-2">Illustrative value before simulated decline:</div>
            <div class="text-2xl font-bold text-stone-900 tabular-nums">${formatINR(normalYear2)}</div>
          </div>
          <p class="text-xs text-stone-500">Illustrative estimate using about ${getScenarioAnnualRate(scenarioKey).toFixed(1)}% blended annual growth before the simulated decline; actual returns vary and can be negative.</p>
        </div>

        <div class="bg-white rounded-2xl p-6 border-2 border-amber-500/40 shadow-sm space-y-4 bg-gradient-to-b from-white to-amber-50/20">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-amber-800 uppercase tracking-wider">Simulated -${dropPct}% decline</span>
            <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">Simulation</span>
          </div>
          <div>
            <div class="text-xs text-stone-400">Illustrative value after decline:</div>
            <div class="text-2xl font-bold text-amber-900 tabular-nums">${formatINR(dippedYear2)}</div>
            <div class="text-xs text-coral-600 text-amber-800 mt-1 font-medium">Temporary paper decline: -${formatINR(dropAmount)}</div>
          </div>
          <div class="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-600">
            <strong>Key Understanding:</strong> The example reduces the value of the holdings; it does not guarantee a recovery. Selling would convert them at the then-current value.
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
        <h3 class="text-base font-bold font-heading text-stone-900">What would you choose to do during the dip?</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button type="button" onclick="setDipAction('continue')"
            class="p-4 rounded-xl border text-left transition-all ${action === 'continue' ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-700' : 'border-stone-200 hover:border-stone-300'}">
            <div class="text-xs font-bold text-stone-900 mb-1">Stay Steady & Continue SIP</div>
            <div class="text-xs text-stone-600">Keep investing ₹${monthly.toLocaleString('en-IN')}/mo calmly.</div>
          </button>

          <button type="button" onclick="setDipAction('pause')"
            class="p-4 rounded-xl border text-left transition-all ${action === 'pause' ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-700' : 'border-stone-200 hover:border-stone-300'}">
            <div class="text-xs font-bold text-stone-900 mb-1">Pause Out of Caution</div>
            <div class="text-xs text-stone-600">Stop SIP temporarily until markets stabilize.</div>
          </button>

          <button type="button" onclick="setDipAction('increase')"
            class="p-4 rounded-xl border text-left transition-all ${action === 'increase' ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-700' : 'border-stone-200 hover:border-stone-300'}">
            <div class="text-xs font-bold text-stone-900 mb-1">Opportunistic Top-Up</div>
            <div class="text-xs text-stone-600">Add an extra ₹500/mo to buy more low-price units.</div>
          </button>
        </div>

        <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <div class="font-bold text-stone-900 mb-1">Simulated Outcome:</div>
          <p>${actionAdvice}</p>
          <div class="mt-3 pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span class="text-xs text-stone-500 block">Est. Final Value at Year ${years}:</span>
              <span class="font-bold text-stone-900 text-base tabular-nums">${formatINR(finalRecoveredValue)}</span>
            </div>
            <div>
              <span class="text-xs text-stone-500 block">Estimated goal timing vs. no dip:</span>
              <span class="font-semibold text-emerald-800 text-sm tabular-nums">${timelineLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
        <button type="button" onclick="openDipSimulatorHelpModal()"
          class="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs sm:text-sm transition-all">
          See the impact breakdown
        </button>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button type="button" onclick="navigateTo('setup')"
            class="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs sm:text-sm transition-all">
            Try a different contribution
          </button>
          <button type="button" onclick="navigateTo('dashboard')"
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest-900 text-white hover:bg-forest-800 font-semibold text-xs sm:text-sm transition-all shadow-sm">
            Return to my plan
          </button>
        </div>
      </div>
    </div>
  `;
}

function setDipAction(action) {
  if (!['continue', 'pause', 'increase'].includes(action)) {
    showToast('Choose one of the available dip responses.');
    return;
  }
  state.dipScenario.actionTaken = action;
  persistPlan();
  renderDipRehearsalView();
}

function openDipSimulatorHelpModal() {
  const modal = document.getElementById('modal-dip-explanation');
  if (modal) modal.classList.remove('hidden');
}

/* =========================================================================
   6. FLEXIBLE-MONTH PREVIEW (College Life Simulation)
   ========================================================================= */
function renderFlexMonthView() {
  const container = document.getElementById('flex-month-content');
  if (!container) return;

  const originalMonthly = state.monthlyContribution;
  const pausedMonths = state.flexMonthsPaused;
  const isPaused = (state.flexMode === 'pause');
  const tempAmount = isPaused ? 0 : state.flexReducedAmount;
  const missingContr = (originalMonthly - tempAmount) * pausedMonths;
  const delayDays = Math.round((missingContr / originalMonthly) * 30 * 1.15);

  container.innerHTML = `
    <div class="max-w-3xl mx-auto space-y-6">
      
      <div class="flex items-center justify-between pb-3 border-b border-stone-200">
        <button type="button" onclick="navigateTo('dashboard')" class="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          Return to Dashboard
        </button>
        <span class="text-xs text-stone-500 font-medium">Flexible Lifestyle Simulation</span>
      </div>

      <div class="bg-teal-50/70 border border-teal-200 rounded-2xl p-5 sm:p-6">
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 text-xs font-semibold uppercase mb-2">College Reality Check</span>
        <h2 class="text-2xl font-bold font-heading text-stone-900">What if you need to pause during exams or semester fees?</h2>
        <p class="text-stone-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
          College life isn't robotic. Between semester tuition, festival travel home, or intense exam months, you might need to temporarily scale back your monthly ₹${originalMonthly.toLocaleString('en-IN')}. Here is how that actually impacts your long-term goal.
        </p>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
        <div class="space-y-4">
          <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider">Choose your temporary flexibility adjustment:</label>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" onclick="setFlexMode('pause')"
              class="p-4 rounded-xl border text-left transition-all ${state.flexMode === 'pause' ? 'border-teal-700 bg-teal-50/60 ring-2 ring-teal-700' : 'border-stone-200 hover:border-stone-300'}">
              <div class="font-bold text-stone-900 text-sm">Full Pause (₹0 / month)</div>
              <p class="text-xs text-stone-500 mt-1">Keep 100% of your funds for semester fees or urgent project costs.</p>
            </button>

            <button type="button" onclick="setFlexMode('reduced')"
              class="p-4 rounded-xl border text-left transition-all ${state.flexMode === 'reduced' ? 'border-teal-700 bg-teal-50/60 ring-2 ring-teal-700' : 'border-stone-200 hover:border-stone-300'}">
              <div class="font-bold text-stone-900 text-sm">Reduced SIP (₹1,000 / month)</div>
              <p class="text-xs text-stone-500 mt-1">Keep the discipline alive with a light pocket-friendly sum.</p>
            </button>
          </div>

          <div class="pt-3">
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="font-semibold text-stone-700">Duration of adjustment:</span>
              <span class="font-bold text-teal-800 tabular-nums">${pausedMonths} Months (e.g., Exam Season)</span>
            </div>
            <input type="range" min="1" max="6" step="1" value="${pausedMonths}"
              oninput="setFlexMonths(Number(this.value))"
              class="w-full accent-teal-800 cursor-pointer" />
            <div class="flex justify-between text-[11px] text-stone-400 mt-1">
              <span>1 Month</span>
              <span>2 Months (Semester Exams)</span>
              <span>6 Months (Summer Break)</span>
            </div>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
            <span class="text-xs font-bold uppercase tracking-wider text-stone-700">Reassuring Verdict</span>
          </div>
          
          <div class="text-sm sm:text-base font-semibold text-stone-900">
            Pausing for ${pausedMonths} months delays your milestone by only <span class="text-emerald-800 font-bold tabular-nums">~${delayDays} days</span> (less than 2 months)!
          </div>

          <p class="text-xs text-stone-600 leading-relaxed">
            Your long-term compounding is powered by years of consistency, not perfection. Taking a planned break during tough exam months does NOT ruin your plan. You can resume with zero guilt.
          </p>

          <div class="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div class="p-3 rounded-lg bg-white border border-stone-200">
              <span class="text-stone-400 block text-[11px]">Uncontributed Total:</span>
              <span class="font-bold text-stone-800 text-sm tabular-nums">${formatINR(missingContr)}</span>
            </div>
            <div class="p-3 rounded-lg bg-white border border-stone-200">
              <span class="text-stone-400 block text-[11px]">Original Timeline:</span>
              <span class="font-bold text-emerald-800 text-sm tabular-nums">${state.timeHorizonYears} Years</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button type="button" onclick="restoreOriginalContribution()"
            class="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2">
            <svg class="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Restore original contribution
          </button>

          <button type="button" onclick="navigateTo('dashboard')"
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest-900 text-white hover:bg-forest-800 font-semibold text-xs sm:text-sm transition-all shadow-sm">
            Save & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  `;
}

function setFlexMode(mode) {
  state.flexMode = mode;
  saveState();
  renderFlexMonthView();
}

function setFlexMonths(months) {
  state.flexMonthsPaused = months;
  saveState();
  renderFlexMonthView();
}

function restoreOriginalContribution() {
  state.flexMonthsPaused = 2;
  state.flexMode = 'pause';
  saveState();
  renderFlexMonthView();
}

/* =========================================================================
   7. LEARN & COMPARE CENTER (Options Comparison & Video Courses)
   ========================================================================= */
function switchLearnSubTab(subTab) {
  state.learnSubTab = subTab;
  saveState();
  renderLearnView();
}

function setOptionsFilter(filter) {
  state.optionsFilter = filter;
  saveState();
  renderLearnView();
}

function renderLearnView() {
  const container = document.getElementById('learn-content-container');
  if (!container) return;

  const isOptionsTab = (state.learnSubTab === 'options');
  const completed = state.user.completedCourses || [];

  // Filter investment options
  const filter = state.optionsFilter || 'all';
  const filteredOptions = INVESTMENT_OPTIONS.filter(opt => {
    if (filter === 'all') return true;
    return opt.category === filter;
  });

  // Render Investment Options HTML
  const optionsCardsHTML = filteredOptions.map(opt => {
    return `
      <div class="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm hover:border-emerald-600 transition-all flex flex-col justify-between space-y-6">
        <div>
          <!-- Header & Category Badge -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div>
              <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${opt.badgeClass} mb-1">
                ${opt.categoryLabel}
              </span>
              <h3 class="text-xl font-bold font-heading text-stone-900">
                ${opt.name}
              </h3>
            </div>
          </div>

          <!-- 1. What it is -->
          <div class="space-y-1 mb-4">
            <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">What it is</span>
            <p class="text-xs sm:text-sm text-stone-700 leading-relaxed">${opt.whatItIs}</p>
          </div>

          <!-- 2. How a beginner might use or encounter it -->
          <div class="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1 mb-4">
            <span class="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              How a student uses or encounters it
            </span>
            <p class="text-xs text-stone-600 leading-relaxed">${opt.howBeginnerUsesIt}</p>
          </div>

          <!-- 3. Main risks and limitations -->
          <div class="space-y-1 mb-4">
            <span class="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Main risks & limitations
            </span>
            <p class="text-xs text-stone-600 leading-relaxed">${opt.mainRisks}</p>
          </div>

          <!-- 4. How easy to access money & Fees / Conditions -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 mb-5">
            <div class="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span class="text-stone-400 block text-[10px] font-bold uppercase">Liquidity & Access</span>
              <span class="font-medium text-stone-800 block mt-0.5 leading-snug">${opt.liquidity}</span>
            </div>
            <div class="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span class="text-stone-400 block text-[10px] font-bold uppercase">Conditions to check</span>
              <span class="font-medium text-stone-800 block mt-0.5 leading-snug">${opt.feesAndLockins}</span>
            </div>
          </div>
        </div>

        <!-- 5. Example Providers (VISUALLY SEPARATE & NEUTRAL LABEL) -->
        <div class="pt-4 border-t border-stone-200">
          <div class="p-4 rounded-2xl bg-stone-50/90 border border-stone-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                Example Providers
              </span>
              <span class="text-[10px] text-stone-400">Learning only • No endorsement</span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              ${opt.exampleProviders.map(p => `
                <a href="${p.url}" target="_blank" rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:border-emerald-700 text-stone-800 text-xs font-semibold shadow-xs transition-colors group">
                  <span>${p.name}</span>
                  <svg class="w-3 h-3 text-stone-400 group-hover:text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
              `).join('')}
            </div>

            <p class="text-[11px] text-stone-500 italic leading-snug pt-0.5">
              ${opt.providerNote}
            </p>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <button type="button" onclick="sendArthaMessage('Tell me more about ${opt.name} and how it works for students.'); toggleArthaChat();"
              class="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
              <span>Ask Artha about ${opt.name} →</span>
            </button>
            <span class="text-[10px] text-stone-400">General education</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Render Video Courses HTML
  const coursesHTML = COURSES.map(course => {
    const isDone = completed.includes(course.id);
    const isRecommended = course.recommendedFor.includes(state.comfortLevel);

    return `
      <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between hover:border-emerald-600 transition-all group">
        <div class="h-36 bg-gradient-to-br ${course.thumbnailGrad} p-4 flex flex-col justify-between relative overflow-hidden">
          <div class="flex items-center justify-between z-10">
            <span class="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
              ${course.category}
            </span>
            ${isRecommended ? `
              <span class="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold">
                Recommended For You
              </span>
            ` : ''}
          </div>

          <div class="z-10 flex items-center justify-between text-white text-xs">
            <span class="font-medium">${course.videoDuration} • ${course.level}</span>
            <div class="w-8 h-8 rounded-full bg-white/20 group-hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow">
              <svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-base font-bold font-heading text-stone-900 group-hover:text-emerald-900 transition-colors">
              ${course.title}
            </h3>
            <p class="text-xs text-stone-600 mt-2 leading-relaxed">
              ${course.description}
            </p>
          </div>

          <div class="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
            <span class="text-xs font-semibold ${isDone ? 'text-emerald-700' : 'text-stone-400'} flex items-center gap-1">
              ${isDone ? '✓ Completed' : 'Not started'}
            </span>

            <button type="button" onclick="openCoursePlayer('${course.id}')"
              class="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-forest-900 hover:text-white text-stone-800 text-xs font-semibold transition-all">
              ${isDone ? 'Re-watch Lesson' : 'Start Course →'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="max-w-6xl mx-auto space-y-8">
      
      <!-- Top Learn Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase mb-1">
            Learning & Comparison Hub
          </span>
          <h1 class="text-3xl font-bold font-editorial text-stone-900">
            Learn, Compare & Understand
          </h1>
          <p class="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
            Explore 7 foundational investment options in everyday language, or watch short video lessons connected to your college milestone.
          </p>
        </div>

        <!-- Sub-Tab Switcher (Options vs Courses) -->
        <div class="flex items-center p-1 bg-stone-100 rounded-2xl border border-stone-200 text-xs font-semibold">
          <button type="button" onclick="switchLearnSubTab('options')"
            class="px-4 py-2 rounded-xl transition-all ${isOptionsTab ? 'bg-forest-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'}">
            Explore Investment Options (7)
          </button>
          <button type="button" onclick="switchLearnSubTab('courses')"
            class="px-4 py-2 rounded-xl transition-all ${!isOptionsTab ? 'bg-forest-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'}">
            Video Courses (${completed.length}/${COURSES.length})
          </button>
        </div>
      </div>

      <!-- =========================================================================
           TAB 1: EXPLORE INVESTMENT OPTIONS (7 CHOICES)
           ========================================================================= -->
      ${isOptionsTab ? `
        <div class="space-y-6">
          
          <!-- MANDATORY PROMINENT EDUCATIONAL BANNER -->
          <div class="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300/80 text-xs sm:text-sm text-stone-800 space-y-1.5 shadow-sm">
            <div class="flex items-center gap-2 font-bold text-amber-950 text-sm">
              <svg class="w-5 h-5 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Learning & Comparing Only • No Transactions</span>
            </div>
            <p class="text-stone-700 leading-relaxed">
              This website is for <strong>learning and comparing only</strong>. Users must not and cannot buy, sell, open accounts, start SIPs, or transfer money through MILESTONE. MILESTONE is not affiliated with, endorsed by, or acting as an agent for any financial provider, bank, or AMC.
            </p>
          </div>

          <!-- Category Filter Bar -->
          <div class="flex items-center justify-between flex-wrap gap-2 pt-1 pb-2">
            <div class="flex items-center gap-1.5 flex-wrap text-xs">
              <span class="text-stone-400 font-semibold uppercase text-[10px] mr-1">Filter by category:</span>
              <button type="button" onclick="setOptionsFilter('all')" class="px-3 py-1.5 rounded-lg border font-medium transition-all ${filter === 'all' ? 'bg-forest-900 text-white border-forest-900' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}">
                All (7)
              </button>
              <button type="button" onclick="setOptionsFilter('cash')" class="px-3 py-1.5 rounded-lg border font-medium transition-all ${filter === 'cash' ? 'bg-forest-900 text-white border-forest-900' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}">
                Cash & Savings
              </button>
              <button type="button" onclick="setOptionsFilter('debt')" class="px-3 py-1.5 rounded-lg border font-medium transition-all ${filter === 'debt' ? 'bg-forest-900 text-white border-forest-900' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}">
                FDs & G-Secs
              </button>
              <button type="button" onclick="setOptionsFilter('equity')" class="px-3 py-1.5 rounded-lg border font-medium transition-all ${filter === 'equity' ? 'bg-forest-900 text-white border-forest-900' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}">
                Mutual & Index Funds
              </button>
              <button type="button" onclick="setOptionsFilter('gold')" class="px-3 py-1.5 rounded-lg border font-medium transition-all ${filter === 'gold' ? 'bg-forest-900 text-white border-forest-900' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}">
                Gold
              </button>
              <button type="button" onclick="setOptionsFilter('method')" class="px-3 py-1.5 rounded-lg border font-medium transition-all ${filter === 'method' ? 'bg-forest-900 text-white border-forest-900' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}">
                SIP Method
              </button>
            </div>

            <span class="text-xs text-stone-400 font-medium">Showing ${filteredOptions.length} of 7 options</span>
          </div>

          <!-- Cards Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            ${optionsCardsHTML}
          </div>

          <!-- MANDATORY BOTTOM NOTE -->
          <div class="p-5 rounded-2xl bg-[#EFECE3]/80 border border-[#E5E0D5] text-xs text-stone-700 text-center space-y-1">
            <strong class="font-bold text-stone-900 block">Notice Regarding Example Providers:</strong>
            <p class="max-w-3xl mx-auto leading-relaxed">
              “Provider names are examples for learning, not recommendations or endorsements. Products, terms, fees, and availability can change. Check current official information and consider qualified advice before making financial decisions.”
            </p>
          </div>
        </div>
      ` : `
        <!-- =========================================================================
             TAB 2: VIDEO COURSES LIBRARY
             ========================================================================= -->
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${coursesHTML}
          </div>

          <div class="p-4 rounded-xl bg-stone-100 border border-stone-200 text-center text-xs text-stone-600">
            All courses are educational modules provided for basic financial literacy. No securities or stocks are recommended.
          </div>
        </div>
      `}

    </div>
  `;
}

function openCoursePlayer(courseId) {
  state.activeCourseId = courseId;

  const modal = document.getElementById('modal-course-player');
  if (!modal) return;
  modal.classList.remove('hidden');
  renderCoursePlayerModal();
}

function renderCoursePlayerModal() {
  const container = document.getElementById('course-player-container');
  if (!container || !state.activeCourseId) return;

  const course = COURSES.find(c => c.id === state.activeCourseId);
  if (!course) return;

  const isDone = (state.user.completedCourses || []).includes(course.id);

  container.innerHTML = `
    <div class="space-y-5">
      <div class="video-player-container rounded-2xl shadow-lg">
        <iframe
          class="w-full h-full"
          src="https://www.youtube-nocookie.com/embed/${course.videoId}?hl=en&amp;cc_lang_pref=en&amp;cc_load_policy=1"
          title="${course.videoTitle} - English video lesson from Khan Academy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          loading="eager">
        </iframe>
      </div>

      <div class="space-y-4">
        <div>
          <span class="text-xs font-semibold text-emerald-800 uppercase tracking-wider">${course.category} • ${course.videoDuration} • English</span>
          <h2 class="text-xl font-bold font-heading text-stone-900 mt-0.5">${course.title}</h2>
          <p class="text-xs sm:text-sm text-stone-600 mt-1">${course.description}</p>
          <p class="text-xs text-stone-500 mt-2">Video: ${course.videoTitle} · Khan Academy</p>
        </div>

        <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-950">
          <strong class="font-bold block mb-1">Key Takeaway:</strong>
          ${course.keyTakeaway}
        </div>

        <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
          Playback controls are in the video. Open this app over HTTP or HTTPS (not as a local file) and allow YouTube video playback on your network. An internet connection is required, and a video may be unavailable if its owner changes access settings. These lessons are for general education.
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-stone-200">
        <button type="button" onclick="toggleCourseCompletion('${course.id}')"
          class="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${isDone ? 'bg-stone-100 text-stone-700 hover:bg-stone-200' : 'bg-emerald-800 text-white hover:bg-emerald-900 shadow-sm'}">
          ${isDone ? 'Mark as Incomplete' : '✓ Mark Lesson as Completed'}
        </button>

        <button type="button" onclick="closeAllModals()" class="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs sm:text-sm font-semibold">
          Close Player
        </button>
      </div>
    </div>
  `;
}

function toggleCourseCompletion(courseId) {
  if (!state.user.completedCourses) state.user.completedCourses = [];
  const idx = state.user.completedCourses.indexOf(courseId);
  if (idx > -1) {
    state.user.completedCourses.splice(idx, 1);
    showToast('Course marked incomplete.');
  } else {
    state.user.completedCourses.push(courseId);
    showToast('Course completed! Progress saved to your account.');
  }
  saveState();
  renderCoursePlayerModal();
  renderLearnView();
  renderTopNavigation();
}

/* =========================================================================
   8. ARTHA CHATBOT ENGINE (Friendly & Grounded)
   ========================================================================= */
function toggleArthaChat() {
  state.arthaOpen = !state.arthaOpen;
  renderArthaChat();
}

function closeArthaChat() {
  state.arthaOpen = false;
  renderArthaChat();
}

function renderArthaChat() {
  const launcher = document.getElementById('artha-launcher-btn');
  const windowEl = document.getElementById('artha-chat-window');
  if (!launcher || !windowEl) return;

  if (state.arthaOpen) {
    windowEl.classList.remove('hidden');
    launcher.classList.add('hidden');
    renderArthaMessages();
  } else {
    windowEl.classList.add('hidden');
    launcher.classList.remove('hidden');
  }
}

function renderArthaMessages() {
  const container = document.getElementById('artha-messages-scroll');
  if (!container) return;

  container.innerHTML = state.chatMessages.map(msg => {
    const isBot = (msg.sender === 'artha');
    return `
      <div class="flex flex-col ${isBot ? 'items-start' : 'items-end'} mb-3">
        <div class="max-w-[85%] p-3 text-xs leading-relaxed ${isBot ? 'chat-bubble-bot' : 'chat-bubble-user'}">
          ${msg.text}
        </div>
        <span class="text-[10px] text-stone-400 mt-1 px-1">${msg.timestamp}</span>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function sendArthaMessage(text) {
  const input = document.getElementById('artha-chat-input');
  const query = text || (input ? input.value.trim() : '');
  if (!query) return;

  if (input) input.value = '';

  state.chatMessages.push({
    sender: 'user',
    text: query,
    timestamp: 'Just now'
  });
  renderArthaMessages();

  setTimeout(() => {
    const reply = generateArthaAnswer(query);
    state.chatMessages.push({
      sender: 'artha',
      text: reply,
      timestamp: 'Just now'
    });
    renderArthaMessages();
  }, 450);
}

function generateArthaAnswer(rawQuery) {
  const q = rawQuery.toLowerCase();

  // Strict Security & Privacy check
  if (q.includes('password') || q.includes('card') || q.includes('bank account') || q.includes('otp') || q.includes('credential')) {
    return "I am an educational AI mentor. I will never ask for, collect, or store your passwords, bank details, or personal credentials. Please keep that information strictly confidential.";
  }

  // Transactions check (strictly no transaction execution)
  if (q.includes('buy') || q.includes('invest now') || q.includes('open account') || q.includes('transfer money') || q.includes('start sip now')) {
    return "MILESTONE is strictly for learning and comparing. You cannot execute transactions, open accounts, buy securities, or transfer money through this prototype. Provider names shown in our guides are neutral examples for education only.";
  }

  // Savings accounts
  if (q.includes('saving') || q.includes('savings account')) {
    return "Savings accounts offer immediate access to your money via UPI and ATMs with high capital safety, but interest rates (typically 2.7%–3.5%) generally lag behind consumer inflation in India. They are ideal for everyday college cash and your emergency buffer (e.g. ₹5,000). Example providers include SBI and HDFC Bank.";
  }

  // Fixed Deposits (FDs)
  if (q.includes('fd') || q.includes('fixed deposit')) {
    return "Fixed deposits lock in a lump-sum amount for a chosen tenure at a guaranteed fixed rate. They are capital-safe up to DICGC insurance limits, but withdrawing early triggers an early-withdrawal penalty and returns struggle against inflation. Example providers include SBI and HDFC Bank.";
  }

  // Government Securities / Bonds / RBI Retail Direct
  if (q.includes('g-sec') || q.includes('government security') || q.includes('bond') || q.includes('rbi retail direct') || q.includes('t-bill')) {
    return "Government securities (G-Secs and T-Bills) carry sovereign backing from the Government of India. RBI Retail Direct is an official platform created by the Reserve Bank of India to learn about and access these securities directly; note that RBI Retail Direct is a facilitation platform, not an investment company.";
  }

  // Index Funds & ETFs
  if (q.includes('index fund') || q.includes('etf') || q.includes('nifty')) {
    return "Index funds and ETFs aim to mirror the performance of a market benchmark like the Nifty 50 with very low expense ratios. However, they can and will lose value whenever the broader market declines, offering zero downside hedging during a crash. Example AMCs include SBI Mutual Fund, HDFC Mutual Fund, and ICICI Prudential Mutual Fund.";
  }

  // Mutual Funds
  if (q.includes('mutual fund') && !q.includes('sip')) {
    return "Mutual funds pool money from many investors into a diversified basket of equities or debt managed by an Asset Management Company (AMC). They carry market risk and daily fluctuating NAVs. Example AMCs in India include SBI Mutual Fund, HDFC Mutual Fund, and ICICI Prudential Mutual Fund.";
  }

  // Gold
  if (q.includes('gold') || q.includes('sgb')) {
    return "Gold acts as a traditional store of value and hedge, but its price can rise or fall significantly. It can be held through Gold ETFs/funds, Sovereign Gold Bonds (SGBs issued via RBI), or physical hallmark jewelry. These are categories, not recommendations.";
  }

  // SIP (Systematic Investment Plan)
  if (q.includes('sip')) {
    return "A SIP is a disciplined METHOD of investing a fixed sum regularly, NOT a separate type of investment or asset class. It is used with eligible mutual funds to average out purchase costs over time, but it does not guarantee positive returns or prevent market losses.";
  }

  // Plan Status & Current Goal
  if (q.includes('goal') || q.includes('how close') || q.includes('progress') || q.includes('my plan')) {
    const scenarioKey = PLAN_ALLOCATIONS[state.selectedScenario] ? state.selectedScenario : 'middle';
    const estFV = calculatePlanSIP(state.monthlyContribution, scenarioKey, state.timeHorizonYears);
    const monthlyNeeded = calculatePlanMonthlyNeeded(state.goalAmount, scenarioKey, state.timeHorizonYears);
    return `Your goal is ${formatINR(state.goalAmount)} in ${state.timeHorizonYears} years. At ${formatINR(state.monthlyContribution)} per month, this educational example estimates ${formatINR(estFV)} using the selected plan's category percentages and growth assumptions. To reach the goal in that time under the same assumptions, it estimates about ${formatINR(monthlyNeeded)} per month. You can change your choices in My plan.`;
  }

  // Market Dip / Crash
  if (q.includes('dip') || q.includes('crash') || q.includes('correction') || q.includes('drop') || q.includes('bad year')) {
    return "Market pullbacks of 15% to 20% are normal every 2–3 years in India. During a dip, your units don't vanish—only their price quotes drop. Continuing your monthly SIP actually purchases more units at discounted prices through Rupee-Cost Averaging. Check out our 'Staying Calm During a Market Dip' course in Learn!";
  }

  // Milestones (25%, 50%, 75%)
  if (q.includes('25%') || q.includes('50%') || q.includes('75%') || q.includes('milestone')) {
    return "We break your goal into 4 stages: 25% (First Safety Net), 50% (Compounding Pivot Point where gains start outpacing deposits), 75% (Home Stretch), and 100% (Milestone Reached). Each milestone celebrates consistency rather than speed.";
  }

  // Exam Pause / Flexible month
  if (q.includes('exam') || q.includes('pause') || q.includes('flexible') || q.includes('semester') || q.includes('stop')) {
    return "You can pause or reduce your SIP during tough university exam months or semester fee periods! Our Flexible-Month Preview shows that taking a 2-month planned pause only shifts your final 8-year target by ~48 days without harming your compounding discipline.";
  }

  // Default polite educational response
  return "That is a great question. As an educational mentor, I can help clarify investing concepts, your displayed goal numbers, or our learning courses and investment options comparison. Remember, I offer financial education to help you think through trade-offs, not personalized stock tips or investment advice.";
}

/* =========================================================================
   DEMO RESET HELPER
   ========================================================================= */
function resetDemo() {
  state.goalAmount = 1000000;
  state.timeHorizonYears = 8;
  state.monthlyContribution = 3000;
  state.comfortLevel = 'moderate';
  state.selectedScenario = 'middle';
  state.setupStep = 1;
  state.flexMonthsPaused = 2;
  state.flexMode = 'pause';
  state.learnSubTab = 'options';
  state.optionsFilter = 'all';
  saveState();
  showToast('Demo reset to initial student baseline.');
  navigateTo('landing');
}

/* =========================================================================
   PDF GENERATOR & DOWNLOAD SYSTEM
   ========================================================================= */
function downloadPlanPDF() {
  try {
    const s = SCENARIO_RATES[state.selectedScenario] || SCENARIO_RATES.middle;
    const years = state.timeHorizonYears || 8;
    const monthly = state.monthlyContribution || 3000;
    const goal = state.goalAmount || 1000000;
    const totalDeposited = monthly * years * 12;
    const scenarioKey = PLAN_ALLOCATIONS[state.selectedScenario] ? state.selectedScenario : 'middle';
    const estimatedValue = calculatePlanSIP(monthly, scenarioKey, years);
    const yearsToGoal = calculatePlanYearsToGoal(monthly, scenarioKey, goal);

    const todayStr = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const pdfString = generateBinaryPlanPdf({
      date: todayStr,
      goal: goal,
      goalFormatted: `Rs. ${(goal / 100000).toFixed(1)} Lakhs (INR ${goal.toLocaleString('en-IN')})`,
      years: years,
      monthly: monthly,
      monthlyFormatted: `Rs. ${monthly.toLocaleString('en-IN')}`,
      scenarioName: s.name,
      scenarioTitle: s.title,
      scenarioRate: getScenarioAnnualRate(scenarioKey),
      volatility: s.volatilityPill || 'Moderate volatility',
      totalDeposited: totalDeposited,
      totalDepositedFormatted: `Rs. ${totalDeposited.toLocaleString('en-IN')}`,
      estimatedValue: estimatedValue,
      estimatedValueFormatted: `Rs. ${estimatedValue.toLocaleString('en-IN')}`,
      yearsToGoal: formatGoalTime(yearsToGoal)
    });

    const blob = new Blob([pdfString], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `milestone-plan-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);

    showToast('Plan downloaded as PDF!');
  } catch (err) {
    console.error('PDF generation error:', err);
    showPdfErrorModal(err.message || 'Download was blocked by browser');
  }
}

function showPdfErrorModal(detail) {
  let modal = document.getElementById('modal-pdf-fallback');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-pdf-fallback';
    modal.className = 'app-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="bg-white dark:bg-[#121F1B] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-stone-200 dark:border-[#243B34] shadow-2xl space-y-4">
      <div class="flex items-center gap-3 text-amber-700 dark:text-amber-400">
        <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <h3 class="text-lg font-bold font-heading text-stone-900 dark:text-white">PDF Generation Notice</h3>
      </div>
      <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
        Could not generate the PDF directly in this browser environment: <span class="font-mono text-[11px] text-amber-800 dark:text-amber-300">${detail}</span>.
      </p>
      <p class="text-xs text-stone-500 dark:text-stone-400">
        You can use your browser's Print dialog (File &gt; Print &gt; Save as PDF) to save this page cleanly.
      </p>
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-[#243B34]">
        <button type="button" onclick="document.getElementById('modal-pdf-fallback').classList.add('hidden')" class="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#162621]">
          Dismiss
        </button>
        <button type="button" onclick="document.getElementById('modal-pdf-fallback').classList.add('hidden'); window.print();" class="px-5 py-2.5 rounded-xl bg-forest-900 dark:bg-emerald-600 text-white text-xs font-bold shadow-sm">
          Print / Save via Browser
        </button>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
}

function generateBinaryPlanPdf(data) {
  const W = 595;
  const H = 842;
  const M = 40;
  const contentW = W - (M * 2);

  function escapePdf(str) {
    return String(str || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  let stream = '';

  function setFill(r, g, b) { stream += `${r} ${g} ${b} rg\n`; }
  function setStroke(r, g, b) { stream += `${r} ${g} ${b} RG\n`; }
  function rect(x, y, w, h, fill = true, stroke = false) {
    stream += `${x} ${y} ${w} ${h} re ${fill && stroke ? 'B' : fill ? 'f' : 'S'}\n`;
  }
  function text(font, size, x, y, str, r = 0, g = 0, b = 0) {
    setFill(r, g, b);
    stream += `BT\n/${font} ${size} Tf\n${x} ${y} Td\n(${escapePdf(str)}) Tj\nET\n`;
  }

  // 1. Header Banner
  setFill(0.027, 0.22, 0.17); // Forest #07382B
  rect(M, H - 95, contentW, 55, true, false);

  text('F2', 17, M + 16, H - 65, 'MILESTONE  |  INVESTMENT PLAN ROADMAP', 1, 1, 1);
  text('F1', 9, M + 16, H - 80, 'Beginner Investing Education & Goal Planning for Indian College Students', 0.8, 0.95, 0.9);
  text('F1', 8.5, W - M - 145, H - 80, `Generated: ${data.date}`, 0.8, 0.95, 0.9);

  // 2. Goal Amount & Timeframe Card
  let curY = H - 110;
  setFill(0.97, 0.97, 0.96);
  setStroke(0.85, 0.84, 0.82);
  rect(M, curY - 70, contentW, 70, true, true);

  text('F2', 11, M + 14, curY - 20, '1. Plan Parameters & Target Goal', 0.05, 0.2, 0.15);
  
  const colW = contentW / 3;
  // Col 1: Goal Amount
  text('F1', 8, M + 14, curY - 38, 'TARGET GOAL MILESTONE', 0.45, 0.45, 0.45);
  text('F2', 13, M + 14, curY - 55, data.goalFormatted, 0.03, 0.22, 0.17);

  // Col 2: Time Horizon
  text('F1', 8, M + colW + 14, curY - 38, 'TARGET TIMEFRAME', 0.45, 0.45, 0.45);
  text('F2', 13, M + colW + 14, curY - 55, `${data.years} Years`, 0.03, 0.22, 0.17);

  // Col 3: Monthly Contribution
  text('F1', 8, M + (colW * 2) + 14, curY - 38, 'MONTHLY CONTRIBUTION', 0.45, 0.45, 0.45);
  text('F2', 13, M + (colW * 2) + 14, curY - 55, `${data.monthlyFormatted} / month`, 0.03, 0.22, 0.17);

  // 3. Illustrative Scenario & Assumptions
  curY -= 88;
  setFill(1, 1, 1);
  setStroke(0.85, 0.84, 0.82);
  rect(M, curY - 105, contentW, 105, true, true);

  text('F2', 11, M + 14, curY - 20, `2. Selected Scenario: ${data.scenarioName} (${data.scenarioTitle})`, 0.05, 0.2, 0.15);
  text('F1', 8.5, M + 14, curY - 36, `Modeled Rate: ~${data.scenarioRate}% p.a. illustrative growth  |  Volatility Profile: ${data.volatility}`, 0.35, 0.35, 0.35);
  
  // Stats row
  setFill(0.96, 0.98, 0.97);
  rect(M + 14, curY - 92, contentW - 28, 44, true, false);
  
  text('F1', 7.5, M + 24, curY - 56, 'TOTAL DEPOSITED OVER TIMELINE', 0.4, 0.4, 0.4);
  text('F2', 11, M + 24, curY - 74, data.totalDepositedFormatted, 0.1, 0.1, 0.1);

  text('F1', 7.5, M + 195, curY - 56, 'ESTIMATED COMPOUNDING VALUE', 0.4, 0.4, 0.4);
  text('F2', 11, M + 195, curY - 74, data.estimatedValueFormatted, 0.04, 0.5, 0.3);

  text('F1', 7.5, M + 365, curY - 56, 'ESTIMATED YEARS TO GOAL', 0.4, 0.4, 0.4);
  text('F2', 11, M + 365, curY - 74, data.yearsToGoal, 0.03, 0.22, 0.17);

  // 4. Progress / Scenario Visual
  curY -= 125;
  setFill(1, 1, 1);
  setStroke(0.85, 0.84, 0.82);
  rect(M, curY - 135, contentW, 135, true, true);

  text('F2', 11, M + 14, curY - 20, '3. Progress & Scenario Visual Breakdown', 0.05, 0.2, 0.15);
  text('F1', 8, M + 14, curY - 34, 'Comparing user principal contributions vs compounding growth towards milestone goal:', 0.4, 0.4, 0.4);

  // Vector Progress Visual
  const barY = curY - 72;
  const barW = contentW - 28;
  const barH = 22;
  
  // Total goal background bar
  setFill(0.91, 0.91, 0.89);
  rect(M + 14, barY, barW, barH, true, false);

  // Deposited bar
  const depFraction = Math.min(1, data.totalDeposited / data.goal);
  const depW = Math.max(8, barW * depFraction);
  setFill(0.2, 0.32, 0.28);
  rect(M + 14, barY, depW, barH, true, false);

  // Growth bar
  const growthAmount = Math.max(0, data.estimatedValue - data.totalDeposited);
  const growthFraction = Math.min(1 - depFraction, growthAmount / data.goal);
  const growthW = Math.max(0, barW * growthFraction);
  setFill(0.08, 0.65, 0.45);
  rect(M + 14 + depW, barY, growthW, barH, true, false);

  // Legend
  setFill(0.2, 0.32, 0.28);
  rect(M + 14, barY - 20, 9, 9, true, false);
  text('F1', 7.5, M + 28, barY - 13, `Principal Deposited: ${data.totalDepositedFormatted}`, 0.25, 0.25, 0.25);

  setFill(0.08, 0.65, 0.45);
  rect(M + 185, barY - 20, 9, 9, true, false);
  text('F1', 7.5, M + 199, barY - 13, `Est. Compounding Growth: +Rs. ${growthAmount.toLocaleString('en-IN')}`, 0.25, 0.25, 0.25);

  setFill(0.85, 0.84, 0.82);
  rect(M + 360, barY - 20, 9, 9, true, false);
  text('F1', 7.5, M + 374, barY - 13, `Target Goal: ${data.goalFormatted}`, 0.25, 0.25, 0.25);

  text('F1', 7.5, M + 14, barY - 40, '* Note: Compounding starts gradually in early college years before visibly accelerating in later phases.', 0.5, 0.5, 0.5);

  // 5. Short explanation of uncertainty and market-dip rehearsal example
  curY -= 155;
  setFill(0.99, 0.98, 0.95);
  setStroke(0.92, 0.84, 0.7);
  rect(M, curY - 110, contentW, 110, true, true);

  text('F2', 11, M + 14, curY - 20, '4. Uncertainty & Market-Dip Rehearsal Explanation', 0.6, 0.25, 0.05);
  
  text('F2', 8, M + 14, curY - 38, 'Market Uncertainty:', 0.2, 0.2, 0.2);
  text('F1', 8, M + 115, curY - 38, 'Real-world markets do not grow along straight mathematical lines. Multi-year fluctuations occur.', 0.3, 0.3, 0.3);

  text('F2', 8, M + 14, curY - 54, 'Inflation Impact:', 0.2, 0.2, 0.2);
  text('F1', 8, M + 115, curY - 54, 'Purchasing power declines over a decade. Long-term diversified assets help outpace consumer price increases.', 0.3, 0.3, 0.3);

  text('F2', 8, M + 14, curY - 70, 'Market-Dip Rehearsal:', 0.2, 0.2, 0.2);
  text('F1', 8, M + 115, curY - 70, 'In our simulated -22% pullback at Year 2, staying invested preserves unit count and reaps recovery compounding.', 0.3, 0.3, 0.3);

  text('F2', 8, M + 14, curY - 86, 'Exam & Budget Pauses:', 0.2, 0.2, 0.2);
  text('F1', 8, M + 115, curY - 86, 'Pausing 2 months for college finals delays an 8-year plan by only ~48 days without sacrificing principal.', 0.3, 0.3, 0.3);

  // 6. Mandatory Regulatory & Educational Disclaimer Box
  curY -= 130;
  setFill(0.95, 0.96, 0.95);
  setStroke(0.75, 0.82, 0.78);
  rect(M, curY - 56, contentW, 56, true, true);

  text('F2', 9, M + 14, curY - 20, 'MANDATORY EDUCATIONAL NOTICE & DISCLAIMER', 0.05, 0.25, 0.2);
  text('F2', 9.5, M + 14, curY - 36, "Illustrative estimates only. Returns aren't guaranteed.", 0.75, 0.15, 0.05);
  text('F1', 7.5, M + 14, curY - 48, 'MILESTONE is strictly a non-transactional educational simulator. No banking or investment services are provided.', 0.4, 0.4, 0.4);

  // 7. Footer
  text('F1', 7.5, M, 24, 'MILESTONE Educational Prototype  |  Sample inputs and simulated mathematical models only  |  Confidential to student session', 0.5, 0.5, 0.5);
  text('F1', 7.5, W - M - 60, 24, 'Page 1 of 1', 0.5, 0.5, 0.5);

  // Assembly
  const objects = [
    null,
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>`,
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  for (let i = 1; i < objects.length; i++) {
    offsets[i] = pdf.length;
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return pdf;
}
