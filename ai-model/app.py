from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import joblib
import requests
from excel_export import generate_report

app = Flask(__name__)
CORS(app)

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

@app.route("/export-excel", methods=["GET"])
def export_excel():
    try:
        # pull live train data from the Express/MongoDB backend
        resp = requests.get("http://localhost:5000/api/trains", timeout=5)
        resp.raise_for_status()
        trains = resp.json()

        buf = generate_report(trains)
        return send_file(
            buf,
            as_attachment=True,
            download_name="train_traffic_report.xlsx",
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except Exception as e:
        return jsonify({"message": "Failed to generate report", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001)