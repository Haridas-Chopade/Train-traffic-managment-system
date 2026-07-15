import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    loadAnalytics();

    const interval = setInterval(
      loadAnalytics,
      10000
    );

    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/analytics"
      );

      setAnalytics(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const COLORS = [
    "#22c55e",
    "#f59e0b",
    "#ef4444",
  ];

  const trafficData = [
    { hour: "06 AM", trains: 5 },
    { hour: "09 AM", trains: 12 },
    { hour: "12 PM", trains: 18 },
    { hour: "03 PM", trains: 15 },
    { hour: "06 PM", trains: 20 },
    { hour: "09 PM", trains: 10 },
  ];

  return (
    <div>
      <h1
        style={{
          color: "white",
          marginBottom: "20px",
        }}
      >
        📊 Railway Analytics Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3,1fr)",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        {analytics.map((item, index) => (
          <div
            key={index}
            style={{
              background: "#111827",
              color: "white",
              padding: "20px",
              borderRadius: "15px",
            }}
          >
            <h2>{item.value}</h2>
            <p>{item.name} Trains</p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          marginTop: "30px",
        }}
      >
        <div
          style={{
            background: "#111827",
            padding: "20px",
            borderRadius: "12px",
            color: "white",
          }}
        >
          <h2>Train Status Overview</h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <PieChart>
              <Pie
                data={analytics}
                dataKey="value"
                outerRadius={100}
                label
              >
                {analytics.map(
                  (entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            background: "#111827",
            padding: "20px",
            borderRadius: "12px",
            color: "white",
          }}
        >
          <h2>Traffic Density</h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <BarChart data={trafficData}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />

              <Bar
                dataKey="trains"
                fill="#3b82f6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          background: "#111827",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <h2>🤖 AI Insights</h2>

        <p>
          ✔ Active trains monitored:
          {" "}
          {analytics[0]?.value || 0}
        </p>

        <p>
          ⚠ Delayed trains:
          {" "}
          {analytics[1]?.value || 0}
        </p>

        <p>
          🚨 Critical alerts:
          {" "}
          {analytics[2]?.value || 0}
        </p>

        <p>
          📈 AI confidence score:
          92%
        </p>
      </div>
    </div>
  );
}