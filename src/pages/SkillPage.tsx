import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { supabase } from "../helpers/supabaseClient";
import SkillQuiz from "../components/SkillQuiz.tsx";
import type { Skill } from "./CategoryPage";

function SkillPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    async function fetchSkill() {
      const { data, error } = await supabase.from('skills').select('*').eq('id', id).single();
      if (error) {
        console.error('Error fetching skill:', error.message);
      } else {
        setSkill(data);
      }
    }
    fetchSkill();
  }, [id]);

  const handleDone = () => {
    setShowQuiz(true);
  };

  return (
    <>
      {skill ? (
        <div className='flex flex-col gap-2 items-center mt-[50px]'>
          <div className="w-[700px]">
            <button
              onClick={() => navigate(-1)}
              className="mb-6 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              ← Back
            </button>
          </div>

          <h1 className='text-3xl font-bold mb-4'>{skill.title}</h1>

          <iframe
            width="700"
            height="394"
            src={skill.video_url}
            title={`${skill.title} video tutorial`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>

          {!showQuiz && score === null && (
            <button className='button-default mt-4' onClick={handleDone}>
              I'm done
            </button>
          )}

          {showQuiz && score === null && (
            <SkillQuiz
              skillId={Number(skill.id)}
              onComplete={(correctCount, resultsArray) => {
                setScore(correctCount);
                setUserAnswers(resultsArray);
                setTotalQuestions(resultsArray.length);
                setShowFeedback(true);
              }}
            />
          )}

          {score !== null && showFeedback && (
            <div className="text-center mt-6 mb-[50px]">
              <h2 className="text-xl font-bold mb-4">Quiz Completed</h2>
              <p className="mb-4">You scored {score} out of {totalQuestions}.</p>

                {userAnswers.map((item, index) => (
                <div key={index} className="mb-2">
                    <p>
                    <strong>Q:</strong> {item.question}
                    </p>
                    <p>
                    {item.isCorrect
                        ? <span className="text-green-600">✅ Correct</span>
                        : <span className="text-red-600">❌ Incorrect</span>}
                    </p>
                </div>
                ))}

              {/* Retry or Go to Profile */}
              <div className="mt-4">
                {score < totalQuestions && (
                  <button
                    onClick={() => {
                      setScore(null);
                      setShowQuiz(true);
                      setUserAnswers([]);
                      setShowFeedback(false);
                    }}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-xl mr-4 cursor-pointer hover:bg-yellow-700 transition-colors duration-200"
                  >
                    Retry Quiz
                  </button>
                )}

                <button
                  onClick={async () => {
                    if (score === totalQuestions) {
                      const { data: userData, error: getUserError } = await supabase.auth.getUser();
                      if (getUserError || !userData) {
                        console.error('Error fetching user ID:', getUserError?.message);
                        return;
                      }

                      const { error } = await supabase.from('users_learned_skills').insert({
                        user_id: userData.user.id,
                        skill_id: skill.id
                      });

                      if (error && !error.message.includes('duplicate key')) {
                        console.error('Error recording skill:', error.message);
                      }
                    }

                    navigate('/nav/profile');
                  }}
                  className="bg-blue-700 text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-blue-900 transition-colors duration-200"
                >
                  Go to Profile
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <h1>Loading...</h1>
      )}
    </>
  );
}

export default SkillPage;