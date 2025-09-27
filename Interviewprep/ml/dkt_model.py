import torch
import torch.nn as nn
import os

class DKT(nn.Module):
    def __init__(self, n_skills, hidden_size=100):
        super(DKT, self).__init__()
        self.lstm = nn.LSTM(input_size=n_skills*2, hidden_size=hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, n_skills)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.fc(out)
        return torch.sigmoid(out)

MODEL_PATH = "dkt_model.pth"

def load_model(n_skills):
    model = DKT(n_skills)
    if os.path.exists(MODEL_PATH):
        model.load_state_dict(torch.load(MODEL_PATH))
    model.eval()
    return model
