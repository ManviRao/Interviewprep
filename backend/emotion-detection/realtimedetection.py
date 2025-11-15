import cv2
import numpy as np
from tensorflow.keras.models import load_model
from collections import Counter
import datetime
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
import io
from PIL import Image

app = Flask(__name__)
CORS(app)

# --- Load pre-trained model ---
model = load_model("emotiondetector.h5")

# --- Load Haar Cascade for face detection ---
haar_file = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
face_cascade = cv2.CascadeClassifier(haar_file)

# --- Emotion Labels ---
emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

# --- Map emotion → confidence level ---
def map_emotion_to_confidence(emotion):
    if emotion in ['Happy', 'Surprise']:
        return "Confident", np.random.randint(80, 100)
    elif emotion == 'Neutral':
        return "Neutral", np.random.randint(60, 80)
    else:
        return "Low Confidence", np.random.randint(30, 60)

def analyze_frame(image_data):
    """Analyze a single frame for emotions"""
    try:
        # Convert base64 to image
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return {
                "dominant": "No Face",
                "confidence": 0,
                "confidence_level": "No Detection",
                "face_detected": False
            }
        
        # Analyze first face found
        x, y, w, h = faces[0]
        face = gray[y:y+h, x:x+w]
        face = cv2.resize(face, (48, 48))
        face = face.astype("float32") / 255.0
        face = np.expand_dims(face, axis=0)
        face = np.expand_dims(face, axis=-1)

        preds = model.predict(face, verbose=0)
        emotion_idx = np.argmax(preds)
        emotion = emotions[emotion_idx]
        confidence_score = float(preds[0][emotion_idx])
        
        confidence_label, confidence_percentage = map_emotion_to_confidence(emotion)
        
        return {
            "dominant": emotion.lower(),
            "confidence": confidence_score,
            "confidence_level": confidence_label,
            "confidence_percentage": confidence_percentage,
            "face_detected": True,
            "all_emotions": {
                emotion: float(score) for emotion, score in zip(emotions, preds[0])
            }
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "dominant": "Error",
            "confidence": 0,
            "face_detected": False
        }

@app.route('/analyze', methods=['POST'])
def analyze_emotion():
    """Endpoint to analyze emotion from image data"""
    try:
        data = request.json
        image_data = data.get('imageData')
        user_id = data.get('userId')
        session_id = data.get('sessionId')
        question_id = data.get('questionId')
        
        if not image_data:
            return jsonify({"error": "No image data provided"}), 400
        
        result = analyze_frame(image_data)
        
        # Add metadata
        result.update({
            "timestamp": datetime.datetime.now().isoformat(),
            "userId": user_id,
            "sessionId": session_id,
            "questionId": question_id
        })
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "emotion-detection"})

if __name__ == '__main__':
    print("🚀 Emotion Detection API starting...")
    app.run(host='0.0.0.0', port=5001, debug=False)