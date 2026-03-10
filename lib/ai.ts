export interface LessonPlanRequest {
  grade: string
  subject: string
  standardsState: string
  topic: string
  duration?: string
}

export interface GeneratedLessonPlan {
  title: string
  objectives: string
  materials: string
  activities: string
  assessment: string
  differentiation: string
  duration: string
  htmlContent: string
}

export async function generateLessonPlan(req: LessonPlanRequest): Promise<GeneratedLessonPlan> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey || apiKey.startsWith('sk-placeholder')) {
    return generateDemoLessonPlan(req)
  }

  const prompt = buildPrompt(req)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert curriculum designer creating detailed, standards-aligned lesson plans for K-12 teachers. 
          Generate comprehensive, engaging, and practical lesson plans that teachers can immediately use in their classrooms.
          Format the response as a JSON object with the following fields:
          - title: string (descriptive lesson title)
          - objectives: string (3-5 clear, measurable learning objectives using Bloom's taxonomy)
          - materials: string (complete list of required materials)
          - activities: string (detailed step-by-step lesson activities with timing)
          - assessment: string (rubric-based assessment strategies)
          - differentiation: string (strategies for diverse learners including ELL, IEP/504, gifted)
          - duration: string (estimated total time)
          - htmlContent: string (full formatted HTML of the complete lesson plan)`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`AI generation failed: ${error}`)
  }

  const data = await response.json() as {
    choices: Array<{
      message: {
        content: string
      }
    }>
  }
  const content = JSON.parse(data.choices[0].message.content) as GeneratedLessonPlan
  return content
}

function buildPrompt(req: LessonPlanRequest): string {
  return `Create a detailed, standards-aligned lesson plan for:
- Grade: ${req.grade}
- Subject: ${req.subject}
- State Standards: ${req.standardsState}
- Topic: ${req.topic}
- Duration: ${req.duration || '45-60 minutes'}

Please align the lesson to ${req.standardsState} state standards for ${req.subject} at the ${req.grade} level.
Include differentiation strategies for diverse learners.`
}

function generateDemoLessonPlan(req: LessonPlanRequest): GeneratedLessonPlan {
  const title = `${req.topic}: A ${req.grade} ${req.subject} Lesson`
  const duration = req.duration || '50 minutes'

  const objectives = `By the end of this lesson, students will be able to:
1. Define and explain key concepts related to ${req.topic}
2. Analyze and interpret ${req.subject.toLowerCase()} principles through the lens of ${req.topic}
3. Apply learned concepts to real-world scenarios and problem-solving activities
4. Collaborate with peers to demonstrate understanding through discussion and group work
5. Evaluate and reflect on their own learning progress using the provided rubric`

  const materials = `- Interactive whiteboard or projector
- Student workbooks or printed worksheets
- Colored pencils or markers (one set per group)
- Index cards (4 per student)
- Access to classroom library or digital resources
- Exit ticket slips (prepared in advance)
- Timer for activity management
- Anchor chart paper (2 sheets)
- Sticky notes in 3 colors`

  const activities = `**Opening Hook (5 minutes)**
Begin with a thought-provoking question or image related to ${req.topic}. Ask students to share their initial thoughts with a partner (Think-Pair-Share).

**Direct Instruction (10 minutes)**
Introduce key vocabulary and core concepts using visual aids on the interactive whiteboard. Use clear, grade-appropriate language. Check for understanding with strategic questioning.

**Guided Practice (15 minutes)**
Model the problem-solving or analytical process with two examples. Gradually release responsibility to students. Use "I do, We do, You do" scaffolding approach.

**Collaborative Activity (15 minutes)**
Students work in small groups (3-4) to complete a structured task related to ${req.topic}. Groups record findings on anchor chart paper and prepare to share with the class.

**Whole-Class Share Out (8 minutes)**
Groups present their findings. Facilitate class discussion to highlight connections and address misconceptions. Add key insights to the class word wall or anchor chart.

**Closure & Exit Ticket (7 minutes)**
Students independently complete an exit ticket with 2-3 questions assessing the core objectives. Collect and use data to inform tomorrow's instruction.`

  const assessment = `**Formative Assessment (Ongoing)**
- Teacher observation during partner and group work
- Strategic questioning throughout the lesson
- Exit ticket data collection and analysis

**Exit Ticket Rubric**
| Score | Description |
|-------|-------------|
| 4 | Student demonstrates full mastery; can apply and extend concepts |
| 3 | Student shows solid understanding; minor misconceptions present |
| 2 | Student shows partial understanding; key gaps remain |
| 1 | Student needs significant reteaching and intervention |

**Participation Rubric**
- Active engagement in discussions: /10
- Quality of group collaboration: /10
- Completion of tasks: /10

**Success Criteria**
Students achieving a score of 3 or 4 are ready to move forward. Students scoring 1-2 will receive targeted small-group support.`

  const differentiation = `**English Language Learners (ELL)**
- Provide bilingual vocabulary cards for key terms
- Use visual supports, diagrams, and graphic organizers
- Allow partner support from a bilingual peer
- Pre-teach 5-7 critical vocabulary words before the lesson

**Students with IEP/504 Plans**
- Provide extended time for activities and exit tickets
- Offer graphic organizers and sentence frames
- Allow alternate response formats (verbal, drawing)
- Reduce written output requirements while maintaining rigor

**Struggling Learners**
- Provide partially completed graphic organizers
- Use concrete manipulatives to support abstract concepts
- Pair with a supportive peer during activities
- Break complex tasks into smaller, manageable steps

**Advanced Learners / Gifted Students**
- Challenge with extension questions requiring higher-order thinking
- Assign a leadership role during group activities
- Provide enrichment task: create their own example or teach a concept to a peer
- Connect to upcoming curriculum to build anticipatory knowledge

**Universal Design for Learning (UDL) Principles**
- Multiple means of representation: visual, auditory, kinesthetic
- Multiple means of engagement: choice in collaborative activity format
- Multiple means of expression: oral, written, or visual responses accepted`

  const htmlContent = `<div class="lesson-plan">
  <h1>${title}</h1>
  <div class="meta">
    <span><strong>Grade:</strong> ${req.grade}</span> | 
    <span><strong>Subject:</strong> ${req.subject}</span> | 
    <span><strong>Standards:</strong> ${req.standardsState}</span> | 
    <span><strong>Duration:</strong> ${duration}</span>
  </div>
  
  <h2>Learning Objectives</h2>
  <div>${objectives.split('\n').map(line => `<p>${line}</p>`).join('')}</div>
  
  <h2>Materials Needed</h2>
  <ul>${materials.split('\n').filter(l => l.trim().startsWith('-')).map(l => `<li>${l.replace('- ', '')}</li>`).join('')}</ul>
  
  <h2>Lesson Activities</h2>
  <div>${activities.split('\n\n').map(section => `<p>${section}</p>`).join('')}</div>
  
  <h2>Assessment &amp; Rubric</h2>
  <div>${assessment.split('\n\n').map(section => `<p>${section}</p>`).join('')}</div>
  
  <h2>Differentiation Strategies</h2>
  <div>${differentiation.split('\n\n').map(section => `<p>${section}</p>`).join('')}</div>
</div>`

  return {
    title,
    objectives,
    materials,
    activities,
    assessment,
    differentiation,
    duration,
    htmlContent,
  }
}
