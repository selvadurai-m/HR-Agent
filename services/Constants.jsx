import {
  BriefcaseBusinessIcon,
  Code2Icon,
  User2Icon,
  Component,
  Puzzle,
  Calendar,
  LayoutDashboard,
  List,
  WalletCards,
  Video,
} from 'lucide-react';

export const SideBarOptions = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    path: '/recruiter/dashboard',
  },
  {
    name: 'Scheduled',
    icon: Calendar,
    path: '/recruiter/scheduled-interview',
  },
  {
    name: 'All Interviews',
    icon: List,
    path: '/recruiter/all-interview',
  },
  {
    name: 'Profile',
    icon: User2Icon,
    path: '/recruiter/profile',
  },
  {
    name: 'Billing',
    icon: WalletCards,
    path: '/recruiter/billing',
  },
];

export const SideBarCondidate = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    path: '/candidate/dashboard',
  },
  {
    name: 'Interviews',
    icon: Video,
    path: '/candidate/interviews',
  },
  {
    name: 'Profile',
    icon: User2Icon,
    path: '/candidate/profile',
  },
];

export const InterviewType = [
  {
    name: 'Technical',
    icon: Code2Icon,
  },
  {
    name: 'Behavioral',
    icon: User2Icon,
  },
  {
    name: 'Experience',
    icon: BriefcaseBusinessIcon,
  },
  {
    name: 'Problem Solving',
    icon: Puzzle,
  },
  {
    name: 'Leadership',
    icon: Component,
  },
];

export const QUESTIONS_PROMPT = `You are an expert technical interviewer.
Based on the following inputs, generate a well-structured list of high-quality interview questions including candidate introduction, salary negotiation, and closing questions.

Job Title: {{job_position}}

Job Description:{{job_description}}

Interview Duration: {{duration}}

Interview Type: {{type}}

📝 Your task:

Analyze the job description to identify key responsibilities, required skills, and expected experience.

Generate a list of interview questions depends on interview duration

Adjust the number and depth of questions to match the interview duration or more.

Ensure the questions match the tone and structure of a real-life {{type}} interview.

🧩 IMPORTANT: Return ONLY valid JSON with no additional text. Use this exact format:
{
  "interviewQuestions": [
    {
      "question": "Your question here",
      "type": "Candidate Introduction/Technical/Behavioral/Experience/Problem Solving/Leadership/Salary Negotiation"
    }
  ]
}

Question types should be one of: Candidate Introduction, Technical, Behavioral, Experience, Problem Solving, Leadership, Salary Negotiation, or Closing.

🎯 The goal is to create a structured, relevant, and time-optimized interview plan for a {{job_position}} role.

Remember: Return ONLY the JSON object, no markdown code blocks, no explanations.`;

export const FEEDBACK_PROMPT = `{{conversation}}

Depends on this Interview Conversation between assitant and user, 

Give me feedback for user interview. Give me rating out of 10 for technical Skills, 

Communication, Problem Solving, Experience. Also give me summery in 3 lines 

about the interview and one line to let me know whether is recommended 

for hire or not with message very strictly. Give me response in JSON format

{

    feedback:{

        rating:{

            TechnicalSkills:5,

            Communication:6,

            ProblemSolving:4,

            Experience:7,

            Behavioral:8,

            Analysis:9



        },

        summery:<in 3 Line>,

        Recommendation:'',

        Recommendation Message:''



    }

}

`;

export const DB_TABLES = {
  USERS: process.env.NEXT_PUBLIC_USERS_TABLE_NAME,
  INTERVIEWS: process.env.NEXT_PUBLIC_INTERVIEWS_TABLE_NAME,
  INTERVIEW_RESULTS: process.env.NEXT_PUBLIC_INTERVIEW_RESULTS_TABLE_NAME,
};

// LLM Provider Models
export const GOOGLE_MODELS = {
  QUESTION_GENERATION: process.env.GOOGLE_MODEL_QUESTION_GENERATION,
  ANSWER_EVALUATION: process.env.GOOGLE_MODEL_ANSWER_EVALUATION,
  FEEDBACK: process.env.GOOGLE_MODEL_FEEDBACK,
};

// Alias for compatibility
export const GEMINI_MODELS = GOOGLE_MODELS;

export const OPENROUTER_MODELS = {
  QUESTION_GENERATION:
    process.env.OPENROUTER_MODEL_QUESTION_GENERATION ||
    'deepseek/deepseek-r1:free',
  ANSWER_EVALUATION:
    process.env.OPENROUTER_MODEL_ANSWER_EVALUATION ||
    'deepseek/deepseek-r1:free',
  FEEDBACK:
    process.env.OPENROUTER_MODEL_FEEDBACK || 'deepseek/deepseek-r1:free',
};

export const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openrouter';

export const AZURE_MODELS = {
  QUESTION_GENERATION: process.env.AZURE_OPENAI_MODEL_QUESTION_GENERATION,
  ANSWER_EVALUATION: process.env.AZURE_OPENAI_MODEL_ANSWER_EVALUATION,
  FEEDBACK: process.env.AZURE_OPENAI_MODEL_FEEDBACK,
};

export const OPENAI_MODELS = {
  QUESTION_GENERATION:
    process.env.OPENAI_MODEL_QUESTION_GENERATION || 'gpt-4o-mini',
  ANSWER_EVALUATION:
    process.env.OPENAI_MODEL_ANSWER_EVALUATION || 'gpt-4o-mini',
  FEEDBACK: process.env.OPENAI_MODEL_FEEDBACK || 'gpt-4o-mini',
};

export const ANTHROPIC_MODELS = {
  QUESTION_GENERATION:
    process.env.ANTHROPIC_MODEL_QUESTION_GENERATION ||
    'claude-3-haiku-20240307',
  ANSWER_EVALUATION:
    process.env.ANTHROPIC_MODEL_ANSWER_EVALUATION || 'claude-3-haiku-20240307',
  FEEDBACK: process.env.ANTHROPIC_MODEL_FEEDBACK || 'claude-3-haiku-20240307',
};
