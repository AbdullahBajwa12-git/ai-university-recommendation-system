STUDY_DESTINATIONS = {
    "Europe": [
        "Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina",
        "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia",
        "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland",
        "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg",
        "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia",
        "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia",
        "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine",
        "United Kingdom", "Vatican City"
    ],
    "North America": [
        "USA", "Canada", "Mexico"
    ],
    "Oceania": [
        "Australia", "New Zealand"
    ],
    "Asia": [
        "China", "Japan", "South Korea", "Singapore", "Malaysia", "Hong Kong"
    ],
    "Middle East": [
        "UAE", "Turkey", "Saudi Arabia"
    ],
    "Africa": [
        "South Africa", "Egypt", "Morocco", "Ghana", "Tunisia", "Kenya", "Rwanda"
    ],
    "Latin America": [
        "Brazil", "Chile", "Argentina"
    ]
}

ALL_DESTINATIONS = [c for group in STUDY_DESTINATIONS.values() for c in group]

STUDY_LEVELS = ["Bachelors", "Masters", "PhD"]

SUGGESTED_FIELDS_OF_STUDY = [
    "Computer Science", "Artificial Intelligence", "Data Science",
    "Software Engineering", "Electrical Engineering", "Mechanical Engineering",
    "Civil Engineering", "Business Administration", "Finance", "Economics",
    "Medicine", "Public Health", "Law", "Architecture",
    "Environmental Science", "Physics", "Mathematics", "Chemistry",
    "Biology", "Psychology",
]

CONTINENT_TO_COUNTRIES = STUDY_DESTINATIONS
