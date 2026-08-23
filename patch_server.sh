#!/bin/bash
sed -i -e '/<h3>2. Technical Score Breakdown/,/Power, Data/c\
<h3>2. Technical Score Breakdown (${scoreData}/100 Index Analysis)</h3>\
${sec2Prompt || `Write at least 2-3 substantive paragraphs providing a deep, technical analysis of what their score of ${scoreData}/100 represents across three core architectural dimensions, citing benchmark company examples (e.g., Cisco, SAP, Microsoft) with inline cited source badges:`}\
' server.ts

sed -i -e '/<h3>4. High-Performance Spatial Optimization Roadmap/,/Inclusive Workplace Spatial Guide<\/a>/c\
<h3>4. High-Performance Spatial Optimization Roadmap</h3>\
${sec4Prompt || `Provide a highly detailed bulleted list (<ul><li>) of 3-4 high-impact, actionable spatial interventions. Write at least 3-4 sentences per bullet that the organization can immediately initiate:`}\
' server.ts
