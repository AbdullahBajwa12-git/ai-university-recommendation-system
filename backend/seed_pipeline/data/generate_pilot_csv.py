import csv
import random
from datetime import datetime

TIMESTAMP = datetime.utcnow().isoformat() + "Z"
SOURCE = "PILOT_V1_MANUAL"
VERIFIED_BY = "auto_gen_v1"

UNIS = [
    # North America
    ("UNI_USA_MIT", "Massachusetts Institute of Technology", "USA", "Cambridge", "North America", 1, "PRIVATE", 0.04, "https://mit.edu"),
    ("UNI_USA_STANFORD", "Stanford University", "USA", "Stanford", "North America", 3, "PRIVATE", 0.04, "https://stanford.edu"),
    ("UNI_USA_HARVARD", "Harvard University", "USA", "Cambridge", "North America", 4, "PRIVATE", 0.03, "https://harvard.edu"),
    ("UNI_USA_UCB", "University of California, Berkeley", "USA", "Berkeley", "North America", 27, "PUBLIC", 0.11, "https://berkeley.edu"),
    ("UNI_USA_UTEXAS", "University of Texas at Austin", "USA", "Austin", "North America", 72, "PUBLIC", 0.31, "https://utexas.edu"),
    ("UNI_USA_NYU", "New York University", "USA", "New York", "North America", 39, "PRIVATE", 0.12, "https://nyu.edu"),
    ("UNI_USA_MICHIGAN", "University of Michigan", "USA", "Ann Arbor", "North America", 25, "PUBLIC", 0.20, "https://umich.edu"),
    ("UNI_USA_GEORGIA", "Georgia Institute of Technology", "USA", "Atlanta", "North America", 88, "PUBLIC", 0.16, "https://gatech.edu"),
    ("UNI_USA_ASU", "Arizona State University", "USA", "Tempe", "North America", 216, "PUBLIC", 0.88, "https://asu.edu"),
    ("UNI_USA_SJSU", "San Jose State University", "USA", "San Jose", "North America", None, "PUBLIC", 0.67, "https://sjsu.edu"),
    ("UNI_CAN_TORONTO", "University of Toronto", "Canada", "Toronto", "North America", 21, "PUBLIC", 0.43, "https://utoronto.ca"),
    ("UNI_CAN_UBC", "University of British Columbia", "Canada", "Vancouver", "North America", 34, "PUBLIC", 0.52, "https://ubc.ca"),
    ("UNI_CAN_MCGILL", "McGill University", "Canada", "Montreal", "North America", 30, "PUBLIC", 0.46, "https://mcgill.ca"),
    ("UNI_CAN_WATERLOO", "University of Waterloo", "Canada", "Waterloo", "North America", 112, "PUBLIC", 0.53, "https://uwaterloo.ca"),
    ("UNI_CAN_ALBERTA", "University of Alberta", "Canada", "Edmonton", "North America", 111, "PUBLIC", 0.58, "https://ualberta.ca"),

    # Europe
    ("UNI_GBR_OXFORD", "University of Oxford", "UK", "Oxford", "Europe", 3, "PUBLIC", 0.17, "https://ox.ac.uk"),
    ("UNI_GBR_CAMBRIDGE", "University of Cambridge", "UK", "Cambridge", "Europe", 2, "PUBLIC", 0.21, "https://cam.ac.uk"),
    ("UNI_GBR_ICL", "Imperial College London", "UK", "London", "Europe", 6, "PUBLIC", 0.15, "https://imperial.ac.uk"),
    ("UNI_GBR_EDINBURGH", "University of Edinburgh", "UK", "Edinburgh", "Europe", 22, "PUBLIC", 0.10, "https://ed.ac.uk"),
    ("UNI_GBR_MANCHESTER", "University of Manchester", "UK", "Manchester", "Europe", 32, "PUBLIC", 0.56, "https://manchester.ac.uk"),
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

    # Asia
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

    # Oceania
    ("UNI_AUS_MELBOURNE", "University of Melbourne", "Australia", "Melbourne", "Oceania", 14, "PUBLIC", 0.70, "https://unimelb.edu.au"),
    ("UNI_AUS_SYDNEY", "University of Sydney", "Australia", "Sydney", "Oceania", 19, "PUBLIC", 0.30, "https://sydney.edu.au"),
    ("UNI_AUS_UNSW", "UNSW Sydney", "Australia", "Sydney", "Oceania", 19, "PUBLIC", 0.60, "https://unsw.edu.au"),
    ("UNI_AUS_MONASH", "Monash University", "Australia", "Melbourne", "Oceania", 42, "PUBLIC", 0.40, "https://monash.edu"),
    ("UNI_NZL_AUCKLAND", "University of Auckland", "New Zealand", "Auckland", "Oceania", 68, "PUBLIC", 0.45, "https://auckland.ac.nz"),

    # Rest of World
    ("UNI_ZAF_CAPE", "University of Cape Town", "South Africa", "Cape Town", "Africa", 173, "PUBLIC", 0.50, "https://uct.ac.za"),
    ("UNI_ZAF_WITS", "Wits University", "South Africa", "Johannesburg", "Africa", 264, "PUBLIC", 0.55, "https://wits.ac.za"),
    ("UNI_BRA_USP", "University of Sao Paulo", "Brazil", "Sao Paulo", "South America", 85, "PUBLIC", 0.08, "https://usp.br"),
    ("UNI_MEX_UNAM", "UNAM", "Mexico", "Mexico City", "North America", 93, "PUBLIC", 0.10, "https://unam.mx"),
    ("UNI_ARG_UBA", "University of Buenos Aires", "Argentina", "Buenos Aires", "South America", 95, "PUBLIC", 0.50, "https://uba.ar"),
]

# Field of Study mapping to ensure taxonomy validation passes
FIELDS = ["Computer Science", "Business", "Engineering", "Medicine", "Arts", "Law", "Data Science", "Economics"]

def gen_tuition(country):
    if country == "USA": return random.randint(40000, 65000), "USD"
    if country == "Canada": return random.randint(30000, 50000), "CAD"
    if country == "UK": return random.randint(20000, 40000), "GBP"
    if country == "Germany": return 0, "EUR"
    if country == "France": return random.randint(3000, 15000), "EUR"
    if country == "Netherlands": return random.randint(15000, 25000), "EUR"
    if country == "Switzerland": return random.randint(1500, 5000), "CHF"
    if country == "Singapore": return random.randint(20000, 40000), "SGD"
    if country == "Japan": return random.randint(500000, 800000), "JPY"
    if country == "China": return random.randint(20000, 50000), "CNY"
    if country == "India": return random.randint(100000, 300000), "INR"
    if country == "South Korea": return random.randint(5000000, 10000000), "KRW"
    if country == "Australia": return random.randint(35000, 55000), "AUD"
    if country == "New Zealand": return random.randint(30000, 45000), "NZD"
    if country == "South Africa": return random.randint(50000, 100000), "ZAR"
    if country == "Brazil": return 0, "BRL"
    if country == "Mexico": return 10000, "MXN"
    if country == "Argentina": return 0, "ARS"
    return 15000, "USD"

with open("c:/FYP/edu-helper/backend/seed_pipeline/data/institutions.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["institution_id","university_name","country","city","continent","qs_ranking","institution_type","acceptance_rate","website","logo_url","data_source","verified_by","last_verified_at"])
    for u in UNIS:
        writer.writerow([u[0], u[1], u[2], u[3], u[4], u[5] or "", u[6], u[7], u[8], "", SOURCE, VERIFIED_BY, TIMESTAMP])

with open("c:/FYP/edu-helper/backend/seed_pipeline/data/programs.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["program_id","institution_id","program_name","field_of_study","study_level","duration_months","tuition_amount","tuition_currency","min_cgpa","min_ielts","min_gre","data_source","verified_by","last_verified_at"])
    for u in UNIS:
        uid = u[0]
        suffix = uid.split("_")[-1]
        country = u[2]

        # 3 programs per uni
        for i, field in enumerate(random.sample(FIELDS, 3)):
            level = "MASTER" if i == 0 else ("BACHELOR" if i == 1 else "PHD")
            lvl_acr = "MS" if level == "MASTER" else ("BS" if level == "BACHELOR" else "PHD")
            pid = f"PROG_{suffix}_{lvl_acr}_{field.replace(' ', '').upper()}"
            pname = f"{level.title()} in {field}"
            amt, cur = gen_tuition(country)
            cgpa = random.choice([3.0, 3.2, 3.5, 3.8])
            ielts = random.choice([6.0, 6.5, 7.0, 7.5])
            gre = 320 if field == "Computer Science" else ""
            writer.writerow([pid, uid, pname, field, level, 24, amt, cur, cgpa, ielts, gre, SOURCE, VERIFIED_BY, TIMESTAMP])

print("CSVs generated successfully.")
