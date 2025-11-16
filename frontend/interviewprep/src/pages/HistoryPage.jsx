import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  FaJava,
  FaReact,
  FaNodeJs,
  FaPython,
  FaCode,
  FaStar,
} from "react-icons/fa";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import Navbar from "@/components/Navbar";

const skillIcons = {
  java: <FaJava className="text-orange-700 text-3xl" />,
  react: <FaReact className="text-blue-500 text-3xl" />,
  node: <FaNodeJs className="text-green-600 text-3xl" />,
  python: <FaPython className="text-yellow-600 text-3xl" />,
  dsa: <FaCode className="text-indigo-600 text-3xl" />,
};

const HistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [skillStats, setSkillStats] = useState({});
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (isToday) return `Today • ${time}`;
    if (isYesterday) return `Yesterday • ${time}`;
    return (
      date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
      ` • ${time}`
    );
  };

  const analyzeSkills = (sessions) => {
    const stats = {};
    sessions.forEach((session) => {
      const skill = session.skill || "Unknown";
      if (!stats[skill]) {
        stats[skill] = {
          count: 0,
          totalAccuracy: 0,
          bestAccuracy: 0,
          worstAccuracy: 100,
          trend: [],
        };
      }
      stats[skill].count += 1;
      stats[skill].totalAccuracy += session.accuracy;
      stats[skill].bestAccuracy = Math.max(stats[skill].bestAccuracy, session.accuracy);
      stats[skill].worstAccuracy = Math.min(stats[skill].worstAccuracy, session.accuracy);
      stats[skill].trend.push({ sessionNumber: session.sessionNumber, accuracy: session.accuracy });
    });

    Object.keys(stats).forEach((skill) => {
      stats[skill].averageAccuracy = Math.round(stats[skill].totalAccuracy / stats[skill].count);
    });

    return stats;
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/sessions/${userId}`);
        let data = res.data.sessions;

        // Oldest → newest for numbering
        const oldest = [...data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        const numbered = oldest.map((s, i) => ({
          ...s,
          sessionNumber: i + 1,
          accuracy: Math.round((s.correct_answers / s.total_questions) * 100),
        }));

        setSessions([...numbered].sort((a, b) => new Date(b.start_time) - new Date(a.start_time)));
        setSkillStats(analyzeSkills(numbered));
      } catch (err) {
        console.error(err);
      }
    };
    fetchSessions();
  }, [userId]);

  const skillGraphData = Object.entries(skillStats).map(([skill, stats]) => ({
    skill,
    averageAccuracy: stats.averageAccuracy,
    bestAccuracy: stats.bestAccuracy,
    worstAccuracy: stats.worstAccuracy,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-purple-50 to-white p-6 pb-20">
      <Navbar />
      <div className="max-w-4xl mx-auto">

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-purple-800 mt-15 mb-8 text-center drop-shadow-md">
          📝 Your Test Report History
        </h2>
<p className="text-center text-purple-600 text-lg mb-10">
  View your session history, track performance trends, and analyze skill-wise progress
</p>

        {/* Skills Overview Graph */}
        {skillGraphData.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-md mb-8 border">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">🎯 Skills Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={skillGraphData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="skill" />
                <YAxis domain={[0, 100]} label={{ value: "Accuracy %", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar dataKey="averageAccuracy" fill="#6D28D9" name="Average Accuracy" />
                <Bar dataKey="bestAccuracy" fill="#10B981" name="Best Accuracy" />
                <Bar dataKey="worstAccuracy" fill="#EF4444" name="Worst Accuracy" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Score Trend Graph */}
        {sessions.length > 1 && (
          <div className="bg-white rounded-xl p-5 shadow-md mb-8 border">
            <h3 className="font-semibold text-lg mb-3">📈 Score Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={[...sessions].sort((a, b) => a.sessionNumber - b.sessionNumber)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sessionNumber" label={{ value: "Session", position: "insideBottom", offset: -5 }} />
                <YAxis domain={[0, 100]} label={{ value: "Accuracy %", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="#6D28D9" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
{sessions.length === 0 ? (
  <p className="text-center text-gray-600">No previous sessions found.</p>
) : (
  <div className="space-y-4">
    {sessions.map((session) => (
      <div
        key={session.session_id}
        className="
          bg-white p-5 rounded-xl shadow-md 
          transition-all duration-200 border border-gray-200
        "
      >
        {/* Top Row */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {skillIcons[session.skill?.toLowerCase()] || (
              <FaStar className="text-yellow-500 text-3xl" />
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Session {session.sessionNumber}
              </h3>
              <p className="text-sm text-gray-500">{formatDate(session.start_time)}</p>
            </div>
          </div>
          <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            {session.skill}
          </span>
        </div>

        {/* Score */}
        <div className="mt-4">
          <span className="font-semibold text-gray-700">Score:</span>
          <span
            className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
              session.accuracy >= 60 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {session.correct_answers} / {session.total_questions}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-3 rounded-full mt-3">
          <div
            className="h-3 bg-purple-600 rounded-full transition-all"
            style={{ width: `${session.accuracy}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-600 mt-1">
          Accuracy: <span className="font-semibold">{session.accuracy}%</span>
        </p>

        {/* View Analytics Button */}
        <div className="mt-4">
          <button
            onClick={() => navigate(`/session/${session.session_id}`)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-500 transition-all"
          >
            View Analytics
          </button>
        </div>
      </div>
    ))}
  </div>
)}

        {/* Detailed Skills Analysis Cards */}
        {Object.keys(skillStats).length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">🎯 Detailed Skills Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(skillStats).map(([skill, stats]) => (
                <div key={skill} className="bg-white p-5 rounded-xl shadow-md border">
                  <div className="flex items-center gap-3 mb-3">
                    {skillIcons[skill.toLowerCase()] || <FaStar className="text-yellow-500 text-3xl" />}
                    <h4 className="text-xl font-semibold">{skill}</h4>
                  </div>
                  <p>Tests Taken: <span className="font-semibold">{stats.count}</span></p>
                  <p>Average Accuracy: <span className="font-semibold">{stats.averageAccuracy}%</span></p>
                  <p>Best Accuracy: <span className="font-semibold">{stats.bestAccuracy}%</span></p>
                  <p>Worst Accuracy: <span className="font-semibold">{stats.worstAccuracy}%</span></p>

                  {/* Mini trend graph per skill */}
                  {stats.trend.length > 1 && (
                    <div className="mt-3 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.trend}>
                          <XAxis dataKey="sessionNumber" hide />
                          <YAxis domain={[0, 100]} hide />
                          <Tooltip />
                          <Line type="monotone" dataKey="accuracy" stroke="#6D28D9" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HistoryPage;
