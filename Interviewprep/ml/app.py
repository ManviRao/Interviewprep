from fastapi import FastAPI
from pydantic import BaseModel
import torch
from dkt_model import load_model

app = FastAPI()

class DKTRequest(BaseModel):
    userId: int
    history: list
    skill_map: dict

@app.post("/predict")
def predict_mastery(req: DKTRequest):
    history = req.history
    skill_map = req.skill_map

    skills = list(set(skill_map.values()))
    n_skills = len(skills)
    skill2idx = {s:i for i,s in enumerate(skills)}

    seq = []
    for item in history:
        qid = item["questionId"]
        correct = item["isCorrect"]
        skill_id = skill_map[str(qid)]
        x = [0]*(n_skills*2)
        idx = skill2idx[skill_id]
        x[idx] = 1
        x[idx+n_skills] = correct
        seq.append(x)

    x_tensor = torch.tensor([seq], dtype=torch.float) if seq else torch.zeros((1,1,n_skills*2), dtype=torch.float)

    model = load_model(n_skills)
    with torch.no_grad():
        y_pred = model(x_tensor)
        mastery = y_pred[0,-1].tolist()

    return {"skills": skills, "mastery": mastery}
