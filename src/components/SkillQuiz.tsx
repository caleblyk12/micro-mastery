import { useEffect, useState } from 'react';
import { supabase } from '../helpers/supabaseClient';

interface Quiz {
  id: number;
  question: string;
  correct_answer: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
}

interface QuizWithOptions extends Quiz {
  options: string[];
}

interface SkillQuizProps {
  skillId: number;
  onComplete: (correctCount: number, resultsArray: any[]) => void;
}

function SkillQuiz({ skillId, onComplete }: SkillQuizProps) {
  //const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [shuffledQuizzes, setShuffledQuizzes] = useState<QuizWithOptions[]>([]);

  useEffect(() => {
    async function fetchQuiz() {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('skill_id', skillId);

      if (data) {
        const withShuffledOptions = data.map((q) => ({
          ...q,
          options: [q.correct_answer, q.wrong_answer_1, q.wrong_answer_2, q.wrong_answer_3]
            .sort(() => Math.random() - 0.5),
        }));
        setShuffledQuizzes(withShuffledOptions);
      } else {
        console.error('Error fetching quizzes:', error?.message);
      }
    }

    fetchQuiz();
  }, [skillId]);

  const handleChange = (id: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);

    const correct = shuffledQuizzes.filter(
      (q) => answers[q.id] === q.correct_answer
    ).length;

    const resultsArray = shuffledQuizzes.map((q) => ({
      questionId: q.id,
      question: q.question,
      selected: answers[q.id],
      correct: q.correct_answer,
      isCorrect: answers[q.id] === q.correct_answer,
    }));

    setTimeout(() => {
      onComplete(correct, resultsArray);
    }, 500);
  };

  if (shuffledQuizzes.length === 0 && !submitted) {
    return (
      <div className="text-center mt-8">
        <p>No quiz available for this skill.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-xl shadow-lg max-w-2xl mx-auto mt-6 mb-[50px]">
      <h2 className="text-xl font-bold mb-4">Quiz</h2>

      {shuffledQuizzes.map((q) => {
        const options = q.options;

        return (
          <div key={q.id} className="mb-6">
            <p className="font-medium mb-2">{q.question}</p>
            {options.map((opt) => (
              <label key={opt} className="block mb-1">
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value={opt}
                  checked={answers[q.id] === opt}
                  disabled={submitted}
                  onChange={() => handleChange(q.id, opt)}
                />
                <span className="ml-2">{opt}</span>
              </label>
            ))}
            {submitted && (
              <p className="text-sm mt-1">
                {answers[q.id] === q.correct_answer
                  ? '✅ Correct'
                  : '❌ Incorrect'}
              </p>
            )}
          </div>
        );
      })}

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white py-2 px-4 rounded-xl mt-4 cursor-pointer hover:bg-blue-800 transition-colors duration-200"
        >
          Submit Quiz
        </button>
      )}
    </div>
  );
}

export default SkillQuiz;