import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../helpers/supabaseClient";
import SkillQuiz from "../components/SkillQuiz";

interface Skill {
  id: number;
  title: string;
  video_url: string;
  category_id: number;
}

function MysteryPage() {
  const [currentMysterySkill, setCurrentMysterySkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userErrorMessage, setUserErrorMessage] = useState('');
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [totalQuizQuestions, setTotalQuizQuestions] = useState(0);
  const [quizUserAnswers, setQuizUserAnswers] = useState<any[]>([]);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);

  const navigate = useNavigate();

  //loads skill on component mount, checking local storage first
  useEffect(() => {
    const cachedSkill = localStorage.getItem("mysterySkill");
    if (cachedSkill) {
      setCurrentMysterySkill(JSON.parse(cachedSkill));
      setIsLoading(false);
    } else {
      fetchNewMysterySkill();
    }
  }, []);

  //fetches a new mystery skill from supabase for the current user
  const fetchNewMysterySkill = async () => {
    setIsLoading(true);
    const { data: userSessionData, error: userSessionError } = await supabase.auth.getUser();
    const userId = userSessionData?.user?.id;

    if (!userId || userSessionError) {
      setUserErrorMessage("couldn't retrieve your user session. please try logging in again.");
      setIsLoading(false);
      return;
    }

    const { data: skillData, error: skillFetchError } = await supabase.rpc("get_mystery_skill", { uid: userId });

    if (skillFetchError || !Array.isArray(skillData) || skillData.length === 0) {
      setUserErrorMessage("failed to load a new mystery skill. please try again.");
      setIsLoading(false);
      return;
    }

    const fetchedSkill = skillData[0];
    localStorage.setItem("mysterySkill", JSON.stringify(fetchedSkill));
    setCurrentMysterySkill(fetchedSkill);
    //reset quiz states
    setIsQuizActive(false);
    setQuizScore(null);
    setShowQuizFeedback(false);
    setQuizUserAnswers([]);
    setIsLoading(false);
  };

  //updates score once quiz completes
  const handleQuizCompletion = async (correctAnswersCount: number, quizResults: any[]) => {
    setQuizScore(correctAnswersCount);
    setTotalQuizQuestions(quizResults.length);
    setQuizUserAnswers(quizResults);
    setShowQuizFeedback(true);

    //if all answers are correct, skills is added to learned skills in profile page
    if (correctAnswersCount === quizResults.length && currentMysterySkill) {
      const { data: userDataForUpdate, error: authErrorForUpdate } = await supabase.auth.getUser();
      const userIdForUpdate = userDataForUpdate?.user?.id;

      if (!authErrorForUpdate && userIdForUpdate) {
        await supabase.from("users_learned_skills").insert({
          user_id: userIdForUpdate,
          skill_id: currentMysterySkill.id,
        });

        const { count: learnedSkillsCount, error: countError } = await supabase
          .from("users_learned_skills")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userIdForUpdate);

        if (!countError) {
          const skillsLearnedTotal = learnedSkillsCount ?? 0;
          const userPoints = skillsLearnedTotal * 20;
          const userLevel = Math.floor(userPoints / 100);

          await supabase
            .from("profiles")
            .update({ skills_learnt: skillsLearnedTotal, points: userPoints, level: userLevel })
            .eq("id", userIdForUpdate);
        }
      }
    }
  };

  //clears cached skill and fetches a new one
  const handleSkillRefresh = () => {
    localStorage.removeItem("mysterySkill");
    fetchNewMysterySkill();
  };

  //displays loading message
  if (isLoading) {
    return <div className="text-center mt-12 text-gray-500">loading mystery skill...</div>;
  }

  //displays error message if fetching fails
  if (userErrorMessage) {
    return <div className="text-center mt-12 text-red-600 font-semibold">{userErrorMessage}</div>;
  }

  return (
    <div className="flex flex-col items-center mt-[50px]">
      {currentMysterySkill && (
        <>
          <h1 className="text-3xl font-bold mb-4">{currentMysterySkill.title}</h1>

          {/* video player for the mystery skill */}
          <iframe
            width="700"
            height="394"
            src={currentMysterySkill.video_url}
            title={`${currentMysterySkill.title} video tutorial`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>

          {/* buttons to start quiz or refresh skill, shown before quiz starts */}
          {!isQuizActive && quizScore === null && (
            <>
              <button
                onClick={() => setIsQuizActive(true)}
                className="mt-6 bg-black text-white py-2 px-6 rounded-full"
              >
                i'm done
              </button>

              <button
                onClick={handleSkillRefresh}
                className="mt-4 bg-gray-800 text-white py-2 px-6 rounded-full hover:bg-gray-700"
              >
                refresh skill
              </button>
            </>
          )}

          {/* quiz component, shown when active and feedback is not yet displayed */}
          {isQuizActive && !showQuizFeedback && (
            <SkillQuiz
              skillId={currentMysterySkill.id}
              onComplete={handleQuizCompletion}
            />
          )}

          {/* quiz results and feedback, shown after quiz completion */}
          {quizScore !== null && showQuizFeedback && (
            <div className="text-center mt-6 mb-[50px]">
              <h2 className="text-xl font-bold mb-4">quiz completed</h2>
              <p className="mb-4">you scored {quizScore} out of {totalQuizQuestions}.</p>

              {/* iterates through user answers to show correct/incorrect status */}
              {quizUserAnswers.map((item, index) => (
                <div key={index} className="mb-2">
                  <p><strong>q:</strong> {item.question}</p>
                  <p>
                    {item.isCorrect
                      ? <span className="text-green-600">✅ correct</span>
                      : <span className="text-red-600">❌ incorrect</span>}
                  </p>
                </div>
              ))}

              {/* option to retry quiz if not all correct */}
              {quizScore < totalQuizQuestions && (
                <button
                  onClick={() => {
                    setQuizScore(null);
                    setIsQuizActive(true);
                    setQuizUserAnswers([]);
                    setShowQuizFeedback(false);
                  }}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-xl mr-4 hover:bg-yellow-700"
                >
                  retry quiz
                </button>
              )}

              {/* button to navigate to profile */}
              <button
                onClick={() => navigate("/nav/profile")}
                className="bg-blue-700 text-white px-4 py-2 rounded-xl hover:bg-blue-900"
              >
                go to profile
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MysteryPage;