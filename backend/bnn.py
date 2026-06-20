import os
import json
import requests

# ----------------------------------------------------------------------
# 1. CONFIGURE YOUR API KEY
# ----------------------------------------------------------------------
API_KEY = os.getenv("OPENAI_API_KEY", "YOUR_API_KEY_HERE")
API_URL = "https://api.openai.com/v1/chat/completions"

# ----------------------------------------------------------------------
# 2. Define the student's profile variables
# ----------------------------------------------------------------------
name = "Jane Doe"
gmail = "jane.doe@example.com"
country = "India"
nationality = "Indian"
current_education_level = "Bachelor's (4th year)"
test_score = "GRE: 325, TOEFL: 110"
gap_years = 0
cgpa = 3.8
publications = 2
interested_continent = "Europe"
interested_country = "Germany"

# ----------------------------------------------------------------------
# 3. Build the system and user messages
# ----------------------------------------------------------------------
system_prompt = (
    "You are an expert university admissions counselor. "
    "Given a student's profile, recommend a list of suitable universities. "
    "For each university, provide: university name, contact email, "
    "admission chances (as a percentage), a brief reason, and the application deadline. "
    "Output the response in **valid JSON** format with a top-level key 'universities' "
    "that contains an array of objects. Each object must have the fields: "
    "'name', 'email', 'chances', 'reason', 'deadline'."
    "You have to list atleast 10 universities or more"
)

user_message = f"""
Student Profile:
- Name: {name}
- Email: {gmail}
- Country: {country}
- Nationality: {nationality}
- Current Education Level: {current_education_level}
- Test Scores: {test_score}
- Gap Years: {gap_years}
- CGPA: {cgpa}
- Number of Publications: {publications}
- Interested Continent: {interested_continent}
- Interested Country: {interested_country}

Based on this profile, recommend 3–5 universities that fit this student.
"""

# ----------------------------------------------------------------------
# 4. Build the HTTP request payload
# ----------------------------------------------------------------------
payload = {
    "model": "gpt-4o",                     # or "gpt-3.5-turbo"
    "messages": [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ],
    "temperature": 0.3,
    "response_format": {"type": "json_object"}
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

# ----------------------------------------------------------------------
# 5. Send the request to the OpenAI API
# ----------------------------------------------------------------------
try:
    response = requests.post(API_URL, headers=headers, json=payload)
    response.raise_for_status()            # raises an error for HTTP 4xx/5xx

    result = response.json()
    # Extract the assistant's reply
    content = result["choices"][0]["message"]["content"]
    data = json.loads(content)

    # ------------------------------------------------------------------
    # 6. Print each university's details
    # ------------------------------------------------------------------
    universities = data.get("universities", [])
    if not universities:
        print("No universities found in the response.")
    else:
        print("\n--- Recommended Universities ---\n")
        for idx, uni in enumerate(universities, 1):
            print(f"{idx}. University Name: {uni.get('name', 'N/A')}")
            print(f"   Email: {uni.get('email', 'N/A')}")
            print(f"   Chances: {uni.get('chances', 'N/A')}")
            print(f"   Reason: {uni.get('reason', 'N/A')}")
            print(f"   Deadline: {uni.get('deadline', 'N/A')}")
            print("-" * 40)

except requests.exceptions.RequestException as e:
    print(f"HTTP request failed: {e}")
except json.JSONDecodeError:
    print("Failed to parse JSON from the API response. Raw content:")
    print(content)
except KeyError as e:
    print(f"Unexpected response structure from OpenAI: missing key {e}")
    print("Full response:", json.dumps(result, indent=2))
except Exception as e:
    print(f"An unexpected error occurred: {e}")