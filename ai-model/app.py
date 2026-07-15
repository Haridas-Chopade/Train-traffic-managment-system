from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

model = joblib.load('model.pkl')

@app.route('/predict', methods=['POST'])
def predict():

    data = request.json

    speed = data['speed']
    trafficDensity = data['trafficDensity']

    prediction = model.predict([[speed, trafficDensity]])

    result = "Delayed" if prediction[0] == 1 else "On Time"

    return jsonify({
        "prediction": result
    })

if __name__ == '__main__':
    app.run(port=5001)