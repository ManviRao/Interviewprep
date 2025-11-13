import sys
import os
import json
from sklearn.metrics import precision_score, recall_score, f1_score,accuracy_score

# --- Allow import from parent directory (so it can import app.py) ---
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import extract_text, extract_skills_from_text

# --- File paths ---
TEST_FILE = os.path.join(os.path.dirname(__file__), "test_data.json")
TEST_RESUME_DIR = os.path.join(os.path.dirname(__file__), "test_resumes")

# --- Check if test file exists ---
if not os.path.exists(TEST_FILE):
    raise FileNotFoundError(f"{TEST_FILE} not found! Please create it with test cases.")

# --- Load test cases ---
with open(TEST_FILE, "r", encoding="utf-8") as f:
    TEST_CASES = json.load(f)

# --- Prepare containers for metrics ---
y_true_all, y_pred_all = [], []

print("\n🔍 Starting Skill Extraction Accuracy Evaluation...\n")

# --- Iterate through test cases ---
for test in TEST_CASES:
    resume_path = os.path.join(TEST_RESUME_DIR, test["resume_file"])
    file_type = resume_path.split(".")[-1]

    if not os.path.exists(resume_path):
        print(f"⚠️ Missing resume file: {resume_path}")
        continue

    # --- Extract text and skills from resume ---
    text = extract_text(resume_path, file_type)
    extracted_skills = extract_skills_from_text(text)

    # --- Create binary labels for expected vs extracted skills ---
    y_true = [1 for _ in test["expected_skills"]]
    y_pred = [1 if skill in extracted_skills else 0 for skill in test["expected_skills"]]
    y_true_all.extend(y_true)
    y_pred_all.extend(y_pred)

    # --- Print detailed result for this resume ---
    print(f"=== Testing Resume (UserID: {test['userId']}) ===")
    print("📄 Resume File:         ", test["resume_file"])
    print("✅ Expected Skills:      ", test["expected_skills"])
    print("🧠 Extracted Skills:     ", extracted_skills)

    # --- Debugging details: find missed / extra skills ---
    missed = [s for s in test["expected_skills"] if s not in extracted_skills]
    extra = [s for s in extracted_skills if s not in test["expected_skills"]]
    if missed:
        print("❌ Missed Skills:        ", missed)
    if extra:
        print("⚠️  Extra Skills:         ", extra)
    print("-" * 70)

from fuzzywuzzy import fuzz
import re

def normalize_skill(skill):
    return re.sub(r"[.\-_/ ]", "", skill.lower())

def fuzzy_match(skill, extracted, threshold=85):
    return any(fuzz.ratio(normalize_skill(skill), normalize_skill(s)) >= threshold for s in extracted)

# --- Compute improved metrics ---
f1_scores, precisions, recalls, accuracies = [], [], [], []

print("\n📊 --- Improved Skill Extraction Evaluation (with fuzzy matching) ---\n")

for test in TEST_CASES:
    resume_path = os.path.join(TEST_RESUME_DIR, test["resume_file"])
    file_type = resume_path.split(".")[-1]

    if not os.path.exists(resume_path):
        print(f"⚠️ Missing resume file: {resume_path}")
        continue

    # Extract text and skills
    text = extract_text(resume_path, file_type)
    extracted_skills = extract_skills_from_text(text)
    expected = test["expected_skills"]

    # Compute matches
    matched = [s for s in expected if fuzzy_match(s, extracted_skills)]
    intersection = len(matched)
    recall = intersection / len(expected)
    precision = intersection / len(extracted_skills) if extracted_skills else 0
    f1 = 2 * precision * recall / (precision + recall + 1e-10)
    union = len(set(expected)) + len(set(extracted_skills)) - intersection
    accuracy = intersection / union if union != 0 else 0  # Jaccard-based accuracy

    # Store metrics
    f1_scores.append(f1)
    precisions.append(precision)
    recalls.append(recall)
    accuracies.append(accuracy)

    # Print per resume
    print(f"=== Resume: {test['resume_file']} ===")
    print(f"Precision: {precision:.2f}, Recall: {recall:.2f}, F1: {f1:.2f}, Accuracy: {accuracy:.2f}")
    print("-" * 60)

# --- Print average metrics ---
if f1_scores:
    print("\n📊 --- Average Metrics Across All Resumes ---")
    print(f"Average Precision: {sum(precisions)/len(precisions):.2f}")
    print(f"Average Recall:    {sum(recalls)/len(recalls):.2f}")
    print(f"Average F1 Score:  {sum(f1_scores)/len(f1_scores):.2f}")
    print(f"Average Accuracy:  {sum(accuracies)/len(accuracies):.2f}")
else:
    print("⚠️ No valid test cases found or missing resumes.")
