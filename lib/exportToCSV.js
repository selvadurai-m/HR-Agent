import { saveAs } from 'file-saver';
import Papa from 'papaparse';

const exportToCSV = (candidates) => {
  const data = candidates.map((c) => {
    // Feedback may be directly in conversation_transcript OR nested under .feedback
    const transcript = c.conversation_transcript || {};
    const feedback = transcript?.feedback || transcript;
    const rating = feedback?.rating || {};

    // Calculate overall score from ratings
    const ratingValues = Object.values(rating).filter(
      (v) => typeof v === 'number'
    );
    const overallScore =
      ratingValues.length > 0
        ? Math.round(
            ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
          )
        : 0;

    return {
      Name: c.fullname || c.userName || 'Unknown',
      Email: c.email || '',
      CompletedAt: c.completed_at || '',
      OverallScore: `${overallScore}/10`,
      TechnicalSkills: rating.TechnicalSkills || rating.technicalSkills || 0,
      Communication: rating.Communication || rating.communication || 0,
      ProblemSolving: rating.ProblemSolving || rating.problemSolving || 0,
      Experience: rating.Experience || rating.experience || 0,
      Behavioral: rating.Behavioral || rating.behavioral || 0,
      Thinking:
        rating.Thinking ||
        rating.Analysis ||
        rating.thinking ||
        rating.analysis ||
        0,
      Recommendation:
        feedback?.Recommendation || feedback?.recommendation || '',
      RecommendationMessage:
        feedback?.RecommendationMessage ||
        feedback?.['Recommendation Message'] ||
        feedback.recommendationMessage ||
        '',
      Summary: Array.isArray(feedback.summery || feedback.summary)
        ? (feedback.summery || feedback.summary).join('; ')
        : feedback.summery || feedback.summary || '',
    };
  });

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'interview_candidates.csv');
};

export default exportToCSV;
