import React from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts'

interface WritingRadarChartProps {
  taskAchievement: number
  coherenceCohesion: number
  lexicalResource: number
  grammaticalRange: number
}

export const WritingRadarChart: React.FC<WritingRadarChartProps> = ({
  taskAchievement,
  coherenceCohesion,
  lexicalResource,
  grammaticalRange
}) => {
  const data = [
    { subject: 'Task Response', score: taskAchievement, fullMark: 9 },
    { subject: 'Coherence & Cohesion', score: coherenceCohesion, fullMark: 9 },
    { subject: 'Lexical Resource', score: lexicalResource, fullMark: 9 },
    { subject: 'Grammatical Range', score: grammaticalRange, fullMark: 9 }
  ]

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e4e4e7" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#71717a', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={45}
            domain={[0, 9]}
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
          />
          <Radar
            name="Candidate Score"
            dataKey="score"
            stroke="#dc2626"
            fill="#ef4444"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
