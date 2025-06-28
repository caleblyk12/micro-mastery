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

const MAX_REFRESHES = 2;
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

function MysteryPage() {
  const [currentMysterySkill, setCurrentMysterySkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userErrorMessage, setUserErrorMessage] = useState("");
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [totalQuizQuestions, setTotalQuizQuestions] = useState(0);
  const [quizUserAnswers, setQuizUserAnswers] = useState<any[]>([]);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [shownSkills, setShownSkills] = useState<number[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [nextAvailableTime, setNextAvailableTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: userSessionData } = await supabase.auth.getUser();
      const uid = userSessionData?.user?.id;

      if (!uid) {
        setUserErrorMessage("Couldn't retrieve user session.");
        setIsLoading(false);
        return;
      }

      setUserId(uid);

      const key = (base: string) => `${uid}_${base}`;

      const completeUntil = localStorage.getItem(key("mysteryCompleteUntil"));
      const now = Date.now();
      if (completeUntil && parseInt(completeUntil) > now) {
        setNextAvailableTime(parseInt(completeUntil));
        setIsLoading(false);
        return;
      }

      const sessionStart = localStorage.getItem(key("mysterySkillTimestamp"));
      if (!sessionStart || now - parseInt(sessionStart) > SESSION_DURATION_MS) {
        localStorage.setItem(key("mysterySkillTimestamp"), now.toString());
        localStorage.setItem(key("mysterySkillRefreshCount"), "0");
        localStorage.setItem(key("mysterySkillHistory"), "[]");
        localStorage.removeItem(key("mysterySkill"));
        setRefreshCount(0);
        setShownSkills([]);
        fetchNewMysterySkill([], uid);
      } else {
        const cachedSkill = localStorage.getItem(key("mysterySkill"));
        const count = parseInt(localStorage.getItem(key("mysterySkillRefreshCount")) || "0");
        const history = JSON.parse(localStorage.getItem(key("mysterySkillHistory")) || "[]");

        setRefreshCount(count);
        setShownSkills(history);

        if (cachedSkill) {
          setCurrentMysterySkill(JSON.parse(cachedSkill));
          setIsLoading(false);
        } else {
          fetchNewMysterySkill(history, uid);
        }
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!nextAvailableTime) return;
    const interval = setInterval(() => {
      const diff = nextAvailableTime - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        if (userId) {
          const key = (base: string) => `${userId}_${base}`;
          localStorage.removeItem(key("mysterySkill"));
          localStorage.removeItem(key("mysterySkillRefreshCount"));
          localStorage.removeItem(key("mysterySkillHistory"));
          localStorage.removeItem(key("mysteryCompleteUntil"));
          localStorage.setItem(key("mysterySkillTimestamp"), Date.now().toString());
          setRefreshCount(0);
          setShownSkills([]);
          setNextAvailableTime(null);
          fetchNewMysterySkill([], userId);
        }
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [nextAvailableTime]);

  const fetchNewMysterySkill = async (history: number[], uid: string) => {
    setIsLoading(true);
    const { data: skillData, error: skillFetchError } = await supabase.rpc("get_mystery_skill", {
      uid,
      exclude_ids: history,
    });

    if (skillFetchError || !Array.isArray(skillData) || skillData.length === 0) {
      setUserErrorMessage("No more mystery skills available or failed to load. Please try again tomorrow.");
      setIsLoading(false);
      return;
    }

    const fetchedSkill = skillData[0];
    const key = (base: string) => `${uid}_${base}`;
    const newHistory = [...history, fetchedSkill.id];

    localStorage.setItem(key("mysterySkill"), JSON.stringify(fetchedSkill));
    localStorage.setItem(key("mysterySkillHistory"), JSON.stringify(newHistory));
    setCurrentMysterySkill(fetchedSkill);
    setShownSkills(newHistory);
    setIsQuizActive(false);
    setQuizScore(null);
    setShowQuizFeedback(false);
    setQuizUserAnswers([]);
    setIsLoading(false);
  };

  const handleQuizCompletion = async (correctAnswersCount: number, quizResults: any[]) => {
    setQuizScore(correctAnswersCount);
    setTotalQuizQuestions(quizResults.length);
    setQuizUserAnswers(quizResults);
    setShowQuizFeedback(true);

    if (correctAnswersCount === quizResults.length && currentMysterySkill && userId) {
      await supabase.from("users_learned_skills").insert({
        user_id: userId,
        skill_id: currentMysterySkill.id,
      });

      const { count: learnedSkillsCount } = await supabase
        .from("users_learned_skills")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const skillsLearnedTotal = learnedSkillsCount ?? 0;
      const userPoints = skillsLearnedTotal * 20;
      const userLevel = Math.floor(userPoints / 100);

      await supabase
        .from("profiles")
        .update({ skills_learnt: skillsLearnedTotal, points: userPoints, level: userLevel })
        .eq("id", userId);

      const key = (base: string) => `${userId}_${base}`;
      const expiry = Date.now() + SESSION_DURATION_MS;
      localStorage.setItem(key("mysteryCompleteUntil"), expiry.toString());
      setNextAvailableTime(expiry);
    }
  };

  const handleSkillRefresh = () => {
    if (!userId) return;
    const key = (base: string) => `${userId}_${base}`;
    if (refreshCount >= MAX_REFRESHES) {
      alert("You've reached the maximum refresh limit for today.");
      return;
    }
    const newCount = refreshCount + 1;
    localStorage.setItem(key("mysterySkillRefreshCount"), newCount.toString());
    setRefreshCount(newCount);
    localStorage.removeItem(key("mysterySkill"));
    fetchNewMysterySkill(shownSkills, userId);
  };

  if (isLoading) return <div className="text-center mt-12 text-gray-500">Loading mystery skill...</div>;
  if (userErrorMessage) return <div className="text-center mt-12 text-red-600 font-semibold">{userErrorMessage}</div>;
  if (nextAvailableTime) {
    return (
      <div className="flex flex-col items-center mt-[50px]">
        <h1 className="text-3xl font-bold mb-4">You've completed today's mystery challenge!</h1>
        <p className="text-lg text-gray-600">Next challenge available in:</p>
        <p className="text-2xl font-mono text-blue-600 mt-2">{countdown}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-[50px]">
      {currentMysterySkill && (
        <>
          <h1 className="text-3xl font-bold mb-4">{currentMysterySkill.title}</h1>

          <iframe
            width="700"
            height="394"
            src={currentMysterySkill.video_url}
            title={`${currentMysterySkill.title} video tutorial`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>

          {!isQuizActive && quizScore === null && (
            <>
              <button onClick={() => setIsQuizActive(true)} className="mt-6 bg-black text-white py-2 px-6 rounded-full cursor-pointer">
                I'm done
              </button>
              <button onClick={handleSkillRefresh} className="mt-4 bg-gray-800 text-white py-2 px-6 rounded-full hover:bg-gray-700 cursor-pointer">
                Refresh skill ({MAX_REFRESHES - refreshCount} left today)
              </button>
            </>
          )}

          {isQuizActive && !showQuizFeedback && (
            <SkillQuiz skillId={currentMysterySkill.id} onComplete={handleQuizCompletion} />
          )}

          {quizScore !== null && showQuizFeedback && (
            <div className="text-center mt-6 mb-[50px]">
              <h2 className="text-xl font-bold mb-4">Quiz completed</h2>
              <p className="mb-4">You scored {quizScore} out of {totalQuizQuestions}.</p>
              {quizUserAnswers.map((item, index) => (
                <div key={index} className="mb-2">
                  <p><strong>Q:</strong> {item.question}</p>
                  <p>
                    {item.isCorrect ? <span className="text-green-600">✅ Correct</span> : <span className="text-red-600">❌ Incorrect</span>}
                  </p>
                </div>
              ))}
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
                  Retry quiz
                </button>
              )}
              <button
                onClick={() => navigate("/nav/profile")}
                className="bg-blue-700 text-white px-4 py-2 rounded-xl hover:bg-blue-900"
              >
                Go to profile
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MysteryPage;