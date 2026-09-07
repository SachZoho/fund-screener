"""
Generates a realistic dataset of ~180 Indian mutual funds and writes src/data/funds.js
Run: python generate_funds.py
"""
import json, random, os

random.seed(42)

AMCS = [
    ("HDFC", "HDFC Mutual Fund"),
    ("SBI", "SBI Mutual Fund"),
    ("ICICI", "ICICI Prudential Mutual Fund"),
    ("Axis", "Axis Mutual Fund"),
    ("Kotak", "Kotak Mahindra Mutual Fund"),
    ("Mirae", "Mirae Asset Mutual Fund"),
    ("Nippon", "Nippon India Mutual Fund"),
    ("DSP", "DSP Mutual Fund"),
    ("UTI", "UTI Mutual Fund"),
    ("Franklin", "Franklin Templeton Mutual Fund"),
    ("Quant", "Quant Mutual Fund"),
    ("PGIM", "PGIM India Mutual Fund"),
    ("Parag", "Parag Parikh Mutual Fund"),
    ("Motilal", "Motilal Oswal Mutual Fund"),
    ("Edelweiss", "Edelweiss Mutual Fund"),
    ("Tata", "Tata Mutual Fund"),
    ("Aditya Birla", "Aditya Birla Sun Life Mutual Fund"),
    ("Invesco", "Invesco Mutual Fund"),
    ("LIC", "LIC Mutual Fund"),
    ("Bandhan", "Bandhan Mutual Fund"),
]

# category templates: (category, subcategory, baseReturn, vol, drawdown, expense, benchmark)
CATS = [
    ("Equity", "Large Cap",        14.5, 18,  -22, 1.7, "NIFTY 50 TRI"),
    ("Equity", "Large & Mid Cap",  16.0, 21,  -28, 1.9, "NIFTY LargeMidcap 250 TRI"),
    ("Equity", "Mid Cap",          19.0, 26,  -35, 1.9, "NIFTY Midcap 150 TRI"),
    ("Equity", "Small Cap",        22.5, 32,  -44, 2.1, "NIFTY Smallcap 250 TRI"),
    ("Equity", "Flexi Cap",        17.5, 23,  -30, 1.8, "NIFTY 500 TRI"),
    ("Equity", "Multi Cap",        18.0, 24,  -32, 1.9, "NIFTY 500 TRI"),
    ("Equity", "ELSS",             15.5, 20,  -26, 1.6, "NIFTY 50 TRI"),
    ("Equity", "Focused",          16.5, 22,  -29, 1.8, "NIFTY 500 TRI"),
    ("Equity", "Sectoral - Tech",  18.0, 28,  -38, 2.0, "NIFTY IT TRI"),
    ("Equity", "Sectoral - Pharma",16.0, 22,  -30, 2.0, "NIFTY Pharma TRI"),
    ("Equity", "Index Fund",       13.5, 17,  -21, 0.4, "NIFTY 50 TRI"),
    ("Hybrid", "Aggressive",       13.0, 14,  -16, 1.5, "NIFTY 50 TRI"),
    ("Hybrid", "Balanced",         10.5, 9,   -9,  1.3, "CRISI Hybrid 35+65 TRI"),
    ("Hybrid", "Conservative",     8.0,  5,   -4,  1.1, "CRISI Hybrid 15+85 TRI"),
    ("Debt",   "Corporate Bond",   7.5,  3,   -2,  0.5, "CRISIL Corporate Bond TRI"),
    ("Debt",   "Liquid",           6.2,  0.8, -0.2,0.2, "CRISIL Liquid Fund TRI"),
    ("Debt",   "Short Duration",   7.8,  3.5, -3,  0.6, "CRISIL Short Duration TRI"),
    ("Debt",   "Gilt",             8.0,  6,   -7,  0.7, "CRISIL Gilt TRI"),
]

funds = []
fid = 1
for amcShort, amcFull in AMCS:
    chosen = random.sample(CATS, k=min(9, len(CATS)))
    for cat, sub, baseR, vol, dd, exp, bench in chosen:
        r1 = round(baseR + random.uniform(-7, 8), 1)
        r3 = round(baseR + random.uniform(-5, 6), 1)
        r5 = round(baseR + random.uniform(-4, 5), 1) if random.random() > 0.15 else None
        maxdd = round(dd + random.uniform(-4, 4), 1)
        expense = round(max(0.15, exp + random.uniform(-0.25, 0.25)), 2)
        age = round(random.uniform(2.5, 22), 1)
        aum = round(random.uniform(120, 38000), 0)
        nav = round(random.uniform(9, 240), 2)
        std = round(max(0.4, vol + random.uniform(-3, 3)), 1)
        sharpe = round(random.uniform(0.4, 2.2), 2)
        sortino = round(sharpe + random.uniform(0.1, 1.0), 2)
        alpha = round(random.uniform(-2.5, 6.5), 2)
        beta = round(random.uniform(0.55, 1.25), 2)
        rating = random.choices([5,4,3,2,1], weights=[2,3,3,1,1])[0]
        minInv = random.choice([100, 500, 1000, 5000])
        cons = round(
            0.35 * min(100, (sharpe/2.2)*100) +
            0.30 * min(100, (1 - abs(maxdd)/50)*100) +
            0.20 * min(100, max(0, (r3+5)/25)*100) +
            0.15 * min(100, (age/22)*100), 1)
        name = f"{amcShort} {sub} Fund"
        if sub.startswith("Sectoral"):
            name = f"{amcShort} {sub.split(' - ')[1]} Fund"
        if sub == "Index Fund":
            name = f"{amcShort} Nifty 50 Index Fund"
        funds.append({
            "id": fid, "name": name, "amc": amcFull, "amcShort": amcShort,
            "category": cat, "subCategory": sub, "benchmark": bench,
            "nav": nav, "aum": aum, "expenseRatio": expense, "fundAgeYears": age,
            "returns1Y": r1, "returns3Y": r3, "returns5Y": r5,
            "maxDrawdown": maxdd, "volatility": std,
            "sharpeRatio": sharpe, "sortinoRatio": sortino,
            "alpha": alpha, "beta": beta, "rating": rating,
            "minimumInvestment": minInv, "consistencyScore": cons,
        })
        fid += 1

funds.sort(key=lambda f: f["consistencyScore"], reverse=True)
for i, f in enumerate(funds, 1):
    f["id"] = i

out = "src/data/funds.js"
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, "w") as f:
    f.write("// Auto-generated realistic dataset of Indian mutual funds (illustrative, not live NAVs).\n")
    f.write(f"// {len(funds)} funds across {len(CATS)} categories.\n")
    f.write("export const FUNDS = ")
    f.write(json.dumps(funds, indent=2))
    f.write(";\n")

print(f"Wrote {len(funds)} funds to {out}")
