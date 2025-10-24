from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
from docx import Document
import json
from rapidfuzz import fuzz
import os
#pip install fastapi uvicorn pdfplumber python-docx rapidfuzz.os and json are built-in, so no need to install them.
#pip install python-multipart

app = FastAPI()

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load skills from JSON
SKILLS_FILE = "skills.json"
ROLE_SKILL_MAP="role-skill.json"

if not os.path.exists(SKILLS_FILE):
    raise FileNotFoundError(f"{SKILLS_FILE} not found! Please create it with a list of skills.")

with open(SKILLS_FILE, "r", encoding="utf-8") as f:
    try:
        SKILLS_LIST = json.load(f)["skills"]
    except json.JSONDecodeError:
        raise ValueError(f"{SKILLS_FILE} contains invalid JSON. Please fix it.")



# Load role-skill mapping
if not os.path.exists(ROLE_SKILL_MAP):
    raise FileNotFoundError(f"{ROLE_SKILL_MAP} not found! Please create it.")

with open(ROLE_SKILL_MAP, "r", encoding="utf-8") as f:
    try:
        ROLE_SKILL_MAP = json.load(f)
    except json.JSONDecodeError:
        raise ValueError(f"{ROLE_SKILL_MAP} contains invalid JSON. Please fix it.")

# ---------------- PDF / DOCX Text Extraction ----------------
def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def extract_text_from_docx(file_path):
    doc = Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text(file_path, file_type):
    if file_type == "pdf":
        return extract_text_from_pdf(file_path)
    elif file_type == "docx":
        return extract_text_from_docx(file_path)
    else:
        return ""

# ---------------- Skill Extraction ----------------
def extract_skills_from_text(text):
    text_lower = text.lower()
    found_skills = set()
    for skill in SKILLS_LIST:
        if fuzz.partial_ratio(skill.lower(), text_lower) >= 80:
            found_skills.add(skill)
    return list(found_skills)


# ---------------- Role-Based Skill Matching ----------------
def get_relevant_skills_for_role(extracted_skills, role):
    role = role.lower()
    if role not in ROLE_SKILL_MAP:
        return []  # unknown role

    role_skills = ROLE_SKILL_MAP[role]
    scored_skills = []

    for skill in extracted_skills:
      for target in role_skills:
        similarity = fuzz.partial_ratio(skill.lower(), target.lower())
        # Match only if similarity is high AND not a substring mismatch
        if similarity >= 90 and not (
            skill.lower() in target.lower() and skill.lower() != target.lower()
        ):
            scored_skills.append((skill, similarity))
            break

    # Sort by similarity and return top 2
    top_skills = [s for s, _ in sorted(scored_skills, key=lambda x: x[1], reverse=True)[:2]]
    return top_skills


# ---------------- API Endpoint ----------------
@app.post("/extract-skills")
async def extract_skills_endpoint(userId: int = Form(...), file: UploadFile = File(...)):
    # Detect file type
    file_type = file.filename.split(".")[-1].lower()
    if file_type not in ["pdf", "docx"]:
        return {"error": "Unsupported file type. Please upload PDF or DOCX."}

    # Save uploaded file temporarily
    os.makedirs("uploads", exist_ok=True)
    temp_path = os.path.join("uploads", f"{userId}_resume.{file_type}")
    contents = await file.read()
    with open(temp_path, "wb") as f:
        f.write(contents)

    # Extract text
    text = extract_text(temp_path, file_type)

    # Extract skills
    skills = extract_skills_from_text(text)

    # Optional: delete temp file after processing
    os.remove(temp_path)

    return {"userId": userId, "skills": skills}

# ---------------- New Endpoint for Role-Based Skill Extraction ----------------
@app.post("/extract-relevant-skills")
async def extract_relevant_skills_endpoint(
    userId: int = Form(...),
    role: str = Form(...),
    file: UploadFile = File(...)
):
    file_type = file.filename.split(".")[-1].lower()
    if file_type not in ["pdf", "docx"]:
        return {"error": "Unsupported file type. Please upload PDF or DOCX."}

    os.makedirs("uploads", exist_ok=True)
    temp_path = os.path.join("uploads", f"{userId}_resume.{file_type}")
    contents = await file.read()
    with open(temp_path, "wb") as f:
        f.write(contents)

    text = extract_text(temp_path, file_type)
    all_skills = extract_skills_from_text(text)
    os.remove(temp_path)

    relevant_skills = get_relevant_skills_for_role(all_skills, role)

    return {
        "userId": userId,
        "role": role,
        "all_skills": all_skills,
        "relevant_skills": relevant_skills
    }

# uvicorn app:app --reload # to run the app