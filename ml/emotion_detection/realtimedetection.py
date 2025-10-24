import cv2
import numpy as np
from tensorflow.keras.models import load_model
import time

# === Load pre-trained CNN model ===
model = load_model("emotiondetector.h5")

# === Haar Cascade for face detection ===
haar_file = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
face_cascade = cv2.CascadeClassifier(haar_file)

# === Original FER7 labels ===
base_emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

# === Map original emotions → interview context emotions ===
emotion_to_interview_state = {
    'Angry': ('Stress', 45),
    'Disgust': ('Uncomfortable', 40),
    'Fear': ('Fear', 35),
    'Happy': ('Confidence', 90),
    'Neutral': ('Calm', 70),
    'Sad': ('Low Confidence', 50),
    'Surprise': ('Alert', 80)
}


def detect_emotion_from_frame(frame):
    """Detects the dominant emotion and maps it to an interview confidence state."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return None, None, None

    results = []
    for (x, y, w, h) in faces:
        face = gray[y:y+h, x:x+w]
        face = cv2.resize(face, (48, 48))
        face = face.astype("float32") / 255.0
        face = np.expand_dims(face, axis=0)
        face = np.expand_dims(face, axis=-1)

        preds = model.predict(face, verbose=0)
        emotion = base_emotions[np.argmax(preds)]

        interview_label, confidence_score = emotion_to_interview_state.get(
            emotion, ('Unknown', 0)
        )
        results.append((emotion, interview_label, confidence_score))

    return results[0] if results else (None, None, None)


def analyze_candidate_emotion(duration=5, save_frame=False):
    """
    Capture webcam for a few seconds while candidate answers,
    then summarize the dominant interview emotion.
    """
    video = cv2.VideoCapture(0)
    captured_emotions = []

    print("\n[INFO] Analyzing candidate emotion during answer...")

    frames_to_capture = int(duration * 5)  # ~5 frames per second
    frame_count = 0

    while frame_count < frames_to_capture:
        ret, frame = video.read()
        if not ret:
            break

        emotion, label, score = detect_emotion_from_frame(frame)
        if label:
            captured_emotions.append((label, score))
            print(f"Detected: {label} ({score}%)")

            # Optional: save one representative frame
            if save_frame and frame_count == 0:
                timestamp = int(time.time())
                cv2.imwrite(f"images/captured/answer_{timestamp}.jpg", frame)

        frame_count += 1
        cv2.waitKey(200)  # capture every 200ms

    video.release()
    cv2.destroyAllWindows()

    if not captured_emotions:
        print("[WARN] No face detected.")
        return None, None

    # Compute dominant emotion
    labels = [lbl for lbl, _ in captured_emotions]
    scores = [scr for _, scr in captured_emotions]

    dominant_label = max(set(labels), key=labels.count)
    avg_score = int(np.mean([scr for lbl, scr in captured_emotions if lbl == dominant_label]))

    print(f"\n[RESULT] Candidate Emotion Summary → {dominant_label} ({avg_score}%)")
    return dominant_label, avg_score


# === Example usage for manual testing ===
if __name__ == "__main__":
    print("\n--- Interview Confidence Analysis ---")
    print("Capture will start for each question.\n")

    while True:
        start = input("Press ENTER to analyze candidate for current question (or type 'exit' to quit): ")
        if start.lower() == "exit":
            break

        label, score = analyze_candidate_emotion(duration=5, save_frame=True)
        if label:
            print(f"→ Emotion after answer: {label} ({score}%)\n")
