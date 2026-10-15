# MILESTONE — Beginner Investing Education & Goal Planning

> A production-style, responsive web prototype designed for college students in India to turn *"I want to become a millionaire"* into a calm, realistic plan they can understand, explore, and adjust.

---

## 🔒 Non-Transactional Learning & Comparison Guardrails

**This website is strictly for learning and comparing.**
- Users **cannot** buy, sell, open accounts, start SIPs, or transfer money through MILESTONE.
- No transaction buttons exist anywhere on the platform.
- MILESTONE is **not affiliated with, endorsed by, or partnered with** any financial provider, bank, or Asset Management Company (AMC).
- Provider names are shown strictly as **neutral examples for learning**, not recommendations or endorsements.
- Products, terms, fees, and availability can change. Users are instructed to check current official information and seek qualified advice before making real-world financial decisions.

---

## 🌟 What's Included

### 1. Explore Investment Options (7 Beginner-Friendly Choices)
Located in the **Learn** hub (and accessible via Dashboard and Landing page), each option details:
- **What it is**
- **How a beginner might use or encounter it**
- **Main risks and limitations**
- **How easy it is to access the money** (Liquidity assessment)
- **Fees, lock-ins, or other conditions to check**
- **Example providers** (Visually separate neutral block, with official links only; zero ratings, rankings, or "best" badges)

The 7 options include:
1. **Savings accounts:** Instant liquidity via UPI/ATMs, safe emergency buffer, but interest (typically 2.7%–3.5%) lags consumer inflation. *Example providers: SBI, HDFC Bank.*
2. **Fixed deposits (FDs):** Guaranteed fixed rate for a chosen tenure (7 days to 10 years), but returns are taxable, struggle against inflation, and early withdrawals trigger penalties. *Example providers: SBI, HDFC Bank.*
3. **Government securities and bonds:** Sovereign backing with zero credit-default risk; terms and interest rate risks vary. *Example provider: RBI Retail Direct (clearly explained as an official access platform created by the Reserve Bank of India, not an investment company).*
4. **Mutual funds:** Pooled investment across diversified equities/debt managed by an AMC with daily fluctuating NAVs. *Example AMCs: SBI Mutual Fund, HDFC Mutual Fund, ICICI Prudential Mutual Fund.*
5. **Index funds and ETFs:** Passively follow a market benchmark (like Nifty 50) with low expense ratios, but **can and will lose value** when the broad market drops. *Example AMCs: SBI Mutual Fund, HDFC Mutual Fund, ICICI Prudential Mutual Fund (no specific fund scheme recommended).*
6. **Gold:** Traditional store of value whose prices rise and fall; held as Gold ETFs/funds, Sovereign Gold Bonds (SGBs via RBI), or physical hallmark jewelry. *Described as categories, not recommendations.*
7. **SIP (Systematic Investment Plan):** **Clarified as a disciplined METHOD of investing a fixed sum regularly, NOT an investment or asset class.** Carries the underlying fund's market risks and does not guarantee returns.

**Mandatory Note Displayed:**
> *“Provider names are examples for learning, not recommendations or endorsements. Products, terms, fees, and availability can change. Check current official information and consider qualified advice before making financial decisions.”*

---

### 2. Single Top Navigation Bar (Simplified)
- MILESTONE logo
- **How it works** walkthrough
- **Learn** (toggles between the 7 Investment Options and 6 Video Courses)
- Primary button: **Build my plan**
- Account menu (Sign in / User profile)
- **Zero sidebars, duplicate navigation bars, or extra navigators.**

---

### 3. Login & User Account Experience
- Polished modal with **Sign In** and **Create Account** tabs.
- Password visibility toggle (eye icon).
- **Forgot password** flow with simulated reset link feedback.
- Account dropdown in the top bar displaying student name, college, email, and course completion counter.
- Plan parameters and completed courses persist locally in `localStorage`.

---

### 4. Goal Completion Overview
- Clear breakdown: goal target, estimated progress, amount remaining, and estimated timeline.
- The monthly amount is compared with the illustrative amount required to reach the selected goal by the selected deadline; the tracker reports whether the example is on pace.
- Monthly educational example breakdown uses the selected Slower, Middle, or Faster plan's own equity, debt, and gold percentages; category amounts update from the current monthly contribution.
- The estimated final value and growth are calculated category by category using each plan's selected percentages and illustrative annual growth assumptions (equity 15%, debt 7%, gold 8%), then combined. These are educational examples, not forecasts or recommendations.
- SIP is explained as a regular contribution method, not an investment category. Example allocations are not personalized recommendations and do not place transactions.
- **Milestone checkpoints**: 25% (First Safety Net), 50% (Compounding Pivot), 75% (Home Stretch), and 100% (Milestone Reached).
- **What changed since last check-in:** Monthly delta explanation.

---

### 5. Artha Educational In-Product Chatbot
- Floating `💬 Ask Artha` button in bottom-right corner.
- Plain-language answers on savings, FDs, G-Secs, mutual funds, index funds, gold, SIPs, and market dips.
- **Privacy safeguard:** Refuses to ask for or collect passwords, bank details, or sensitive financial information.

---

### 6. Goal-Related Learning Courses
- 6 English-language Khan Academy lessons embedded in the existing course player.
- Video playback, seeking, and speed controls are provided by the embedded video player.
- "Mark as Completed" button persists progress to user account.

---

### 7. Preserved 3D-Inspired Landing Hero
- Isometric HTML5 Canvas with translucent glass steps, student walker, glowing goal beacon, and market dip-and-recovery path.

---

## 💻 Running the Prototype Locally

```bash
# Option 1: Standard Python Server
python3 -m http.server 3000

# Option 2: Node npx serve
npx serve -l 3000 .
```

Visit:
```
http://localhost:3000
```
Use the HTTP URL when playing embedded lessons. Opening `index.html` directly with a `file://` URL may prevent YouTube from streaming video. The network must also allow YouTube video playback.
