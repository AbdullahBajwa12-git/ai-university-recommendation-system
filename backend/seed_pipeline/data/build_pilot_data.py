import csv
from datetime import datetime

TIMESTAMP = datetime.utcnow().isoformat() + "Z"
SOURCE = "PILOT_V1_MANUAL"
VERIFIED_BY = "auto_gen_v1"

# 50 Universities
UNIS = [
    ("UNI_USA_MIT", "Massachusetts Institute of Technology", "United States", "Cambridge", "North America", 1, "PRIVATE", 0.04, "https://mit.edu"),
    ("UNI_USA_STANFORD", "Stanford University", "United States", "Stanford", "North America", 3, "PRIVATE", 0.04, "https://stanford.edu"),
    ("UNI_USA_HARVARD", "Harvard University", "United States", "Cambridge", "North America", 4, "PRIVATE", 0.03, "https://harvard.edu"),
    ("UNI_USA_UCB", "University of California, Berkeley", "United States", "Berkeley", "North America", 27, "PUBLIC", 0.11, "https://berkeley.edu"),
    ("UNI_USA_UTEXAS", "University of Texas at Austin", "United States", "Austin", "North America", 72, "PUBLIC", 0.31, "https://utexas.edu"),
    ("UNI_USA_NYU", "New York University", "United States", "New York", "North America", 39, "PRIVATE", 0.12, "https://nyu.edu"),
    ("UNI_USA_MICHIGAN", "University of Michigan", "United States", "Ann Arbor", "North America", 25, "PUBLIC", 0.20, "https://umich.edu"),
    ("UNI_USA_GEORGIA", "Georgia Institute of Technology", "United States", "Atlanta", "North America", 88, "PUBLIC", 0.16, "https://gatech.edu"),
    ("UNI_USA_ASU", "Arizona State University", "United States", "Tempe", "North America", 216, "PUBLIC", 0.88, "https://asu.edu"),
    ("UNI_USA_SJSU", "San Jose State University", "United States", "San Jose", "North America", 400, "PUBLIC", 0.67, "https://sjsu.edu"),
    ("UNI_CAN_TORONTO", "University of Toronto", "Canada", "Toronto", "North America", 21, "PUBLIC", 0.43, "https://utoronto.ca"),
    ("UNI_CAN_UBC", "University of British Columbia", "Canada", "Vancouver", "North America", 34, "PUBLIC", 0.52, "https://ubc.ca"),
    ("UNI_CAN_MCGILL", "McGill University", "Canada", "Montreal", "North America", 30, "PUBLIC", 0.46, "https://mcgill.ca"),
    ("UNI_CAN_WATERLOO", "University of Waterloo", "Canada", "Waterloo", "North America", 112, "PUBLIC", 0.53, "https://uwaterloo.ca"),
    ("UNI_CAN_ALBERTA", "University of Alberta", "Canada", "Edmonton", "North America", 111, "PUBLIC", 0.58, "https://ualberta.ca"),
    ("UNI_GBR_OXFORD", "University of Oxford", "United Kingdom", "Oxford", "Europe", 3, "PUBLIC", 0.17, "https://ox.ac.uk"),
    ("UNI_GBR_CAMBRIDGE", "University of Cambridge", "United Kingdom", "Cambridge", "Europe", 2, "PUBLIC", 0.21, "https://cam.ac.uk"),
    ("UNI_GBR_ICL", "Imperial College London", "United Kingdom", "London", "Europe", 6, "PUBLIC", 0.15, "https://imperial.ac.uk"),
    ("UNI_GBR_EDINBURGH", "University of Edinburgh", "United Kingdom", "Edinburgh", "Europe", 22, "PUBLIC", 0.10, "https://ed.ac.uk"),
    ("UNI_GBR_MANCHESTER", "University of Manchester", "United Kingdom", "Manchester", "Europe", 32, "PUBLIC", 0.56, "https://manchester.ac.uk"),
    ("UNI_DEU_TUM", "Technical University of Munich", "Germany", "Munich", "Europe", 37, "PUBLIC", 0.08, "https://tum.de"),
    ("UNI_DEU_LMU", "LMU Munich", "Germany", "Munich", "Europe", 54, "PUBLIC", 0.16, "https://lmu.de"),
    ("UNI_DEU_HEIDELBERG", "Heidelberg University", "Germany", "Heidelberg", "Europe", 87, "PUBLIC", 0.16, "https://uni-heidelberg.de"),
    ("UNI_DEU_RWTH", "RWTH Aachen University", "Germany", "Aachen", "Europe", 106, "PUBLIC", 0.10, "https://rwth-aachen.de"),
    ("UNI_FRA_SORBONNE", "Sorbonne University", "France", "Paris", "Europe", 59, "PUBLIC", 0.10, "https://sorbonne-universite.fr"),
    ("UNI_FRA_POLYTECHNIQUE", "Ecole Polytechnique", "France", "Palaiseau", "Europe", 65, "PUBLIC", 0.05, "https://polytechnique.edu"),
    ("UNI_NLD_DELFT", "TU Delft", "Netherlands", "Delft", "Europe", 47, "PUBLIC", 0.10, "https://tudelft.nl"),
    ("UNI_NLD_AMSTERDAM", "University of Amsterdam", "Netherlands", "Amsterdam", "Europe", 53, "PUBLIC", 0.04, "https://uva.nl"),
    ("UNI_CHE_ETH", "ETH Zurich", "Switzerland", "Zurich", "Europe", 7, "PUBLIC", 0.27, "https://ethz.ch"),
    ("UNI_CHE_EPFL", "EPFL", "Switzerland", "Lausanne", "Europe", 36, "PUBLIC", 0.21, "https://epfl.ch"),
    ("UNI_SGP_NUS", "National University of Singapore", "Singapore", "Singapore", "Asia", 8, "PUBLIC", 0.05, "https://nus.edu.sg"),
    ("UNI_SGP_NTU", "Nanyang Technological University", "Singapore", "Singapore", "Asia", 26, "PUBLIC", 0.36, "https://ntu.edu.sg"),
    ("UNI_JPN_TOKYO", "University of Tokyo", "Japan", "Tokyo", "Asia", 28, "PUBLIC", 0.34, "https://u-tokyo.ac.jp"),
    ("UNI_JPN_KYOTO", "Kyoto University", "Japan", "Kyoto", "Asia", 46, "PUBLIC", 0.40, "https://kyoto-u.ac.jp"),
    ("UNI_CHN_TSINGHUA", "Tsinghua University", "China", "Beijing", "Asia", 25, "PUBLIC", 0.02, "https://tsinghua.edu.cn"),
    ("UNI_CHN_PEKING", "Peking University", "China", "Beijing", "Asia", 17, "PUBLIC", 0.02, "https://pku.edu.cn"),
    ("UNI_IND_IITB", "IIT Bombay", "India", "Mumbai", "Asia", 149, "PUBLIC", 0.01, "https://iitb.ac.in"),
    ("UNI_IND_IITD", "IIT Delhi", "India", "New Delhi", "Asia", 197, "PUBLIC", 0.01, "https://iitd.ac.in"),
    ("UNI_KOR_SNU", "Seoul National University", "South Korea", "Seoul", "Asia", 41, "PUBLIC", 0.15, "https://snu.ac.kr"),
    ("UNI_KOR_KAIST", "KAIST", "South Korea", "Daejeon", "Asia", 56, "PUBLIC", 0.20, "https://kaist.ac.kr"),
    ("UNI_AUS_MELBOURNE", "University of Melbourne", "Australia", "Melbourne", "Oceania", 14, "PUBLIC", 0.70, "https://unimelb.edu.au"),
    ("UNI_AUS_SYDNEY", "University of Sydney", "Australia", "Sydney", "Oceania", 19, "PUBLIC", 0.30, "https://sydney.edu.au"),
    ("UNI_AUS_UNSW", "UNSW Sydney", "Australia", "Sydney", "Oceania", 19, "PUBLIC", 0.60, "https://unsw.edu.au"),
    ("UNI_AUS_MONASH", "Monash University", "Australia", "Melbourne", "Oceania", 42, "PUBLIC", 0.40, "https://monash.edu"),
    ("UNI_NZL_AUCKLAND", "University of Auckland", "New Zealand", "Auckland", "Oceania", 68, "PUBLIC", 0.45, "https://auckland.ac.nz"),
    ("UNI_ZAF_CAPE", "University of Cape Town", "South Africa", "Cape Town", "Africa", 173, "PUBLIC", 0.50, "https://uct.ac.za"),
    ("UNI_ZAF_WITS", "Wits University", "South Africa", "Johannesburg", "Africa", 264, "PUBLIC", 0.55, "https://wits.ac.za"),
    ("UNI_BRA_USP", "University of Sao Paulo", "Brazil", "Sao Paulo", "South America", 85, "PUBLIC", 0.08, "https://usp.br"),
    ("UNI_MEX_UNAM", "UNAM", "Mexico", "Mexico City", "North America", 93, "PUBLIC", 0.10, "https://unam.mx"),
    ("UNI_ARG_UBA", "University of Buenos Aires", "Argentina", "Buenos Aires", "South America", 95, "PUBLIC", 0.50, "https://uba.ar"),
]

# Supported Currencies ONLY (USD, EUR, GBP, AUD, CAD, INR, CNY)
# Map format: Country -> (Normalized_Currency, Normalized_Amount, Original_Currency, Original_Amount)
CURRENCY_MAP = {
    "United States": ("USD", 45000, "USD", 45000),
    "Canada": ("CAD", 35000, "CAD", 35000),
    "United Kingdom": ("GBP", 25000, "GBP", 25000),
    "Germany": ("EUR", 1500, "EUR", 1500),
    "France": ("EUR", 4000, "EUR", 4000),
    "Netherlands": ("EUR", 18000, "EUR", 18000),
    "Switzerland": ("USD", 25000, "CHF", 22000), # Preserved CHF
    "Singapore": ("USD", 30000, "SGD", 40000), # Preserved SGD
    "Japan": ("USD", 15000, "JPY", 2000000), # Preserved JPY
    "China": ("CNY", 40000, "CNY", 40000),
    "India": ("INR", 200000, "INR", 200000),
    "South Korea": ("USD", 10000, "KRW", 13000000), # Preserved KRW
    "Australia": ("AUD", 40000, "AUD", 40000),
    "New Zealand": ("AUD", 35000, "NZD", 38000), # Preserved NZD
    "South Africa": ("USD", 8000, "ZAR", 150000), # Preserved ZAR
    "Brazil": ("USD", 5000, "BRL", 25000),
    "Mexico": ("USD", 6000, "MXN", 100000),
    "Argentina": ("USD", 4000, "ARS", 1500000)
}

FIELDS = ["Computer Science", "Business Administration", "General Engineering", "Medicine", "Design", "Law", "Psychology", "History"]
LEVELS = ["Masters", "Bachelors", "PhD", "Diploma", "Certificate"]

with open("c:/FYP/edu-helper/backend/seed_pipeline/data/institutions.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["institution_id","university_name","country","city","continent","qs_ranking","institution_type","acceptance_rate","website","logo_url","data_source","verified_by","last_verified_at"])
    for u in UNIS:
        writer.writerow([u[0], u[1], u[2], u[3], u[4], u[5] or "", u[6], u[7], u[8], "", SOURCE, VERIFIED_BY, TIMESTAMP])

with open("c:/FYP/edu-helper/backend/seed_pipeline/data/programs.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["program_id","institution_id","program_name","field_of_study","study_level","duration_months","tuition_amount","tuition_currency","original_tuition_amount","original_currency","min_cgpa","min_ielts","min_gre","data_source","verified_by","last_verified_at"])

    prog_id_counter = 1
    for u_idx, u in enumerate(UNIS):
        uid = u[0]
        country = u[2]
        cur, amt, orig_cur, orig_amt = CURRENCY_MAP.get(country, ("USD", 20000, "USD", 20000))

        # Deterministically assign 3 fields to each university to cover all fields evenly
        assigned_fields = [FIELDS[u_idx % len(FIELDS)], FIELDS[(u_idx + 1) % len(FIELDS)], FIELDS[(u_idx + 2) % len(FIELDS)]]

        for i, field in enumerate(assigned_fields):
            level = LEVELS[i % len(LEVELS)]
            pid = f"PROG_{prog_id_counter}"
            prog_id_counter += 1

            pname = f"{level} in {field}"
            cgpa = 3.0 + (i * 0.2)
            ielts = 6.0 + (i * 0.5)
            gre = 320 if field in ["Computer Science", "Engineering"] else ""

            # Vary tuition deterministically
            final_amt = amt + (i * 1000)
            final_orig_amt = orig_amt + (i * 1000)

            writer.writerow([pid, uid, pname, field, level, 24, final_amt, cur, final_orig_amt, orig_cur, cgpa, ielts, gre, SOURCE, VERIFIED_BY, TIMESTAMP])

print("Deterministic CSVs generated successfully.")
