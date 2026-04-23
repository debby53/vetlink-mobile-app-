import { useState, useEffect } from "react";
import { Check, X, ArrowRight, Award } from "lucide-react";
import { toast } from "sonner";
import { quizAPI } from "@/lib/apiService";

interface QuizPlayerProps {
    lessonId: number;
    enrollmentId?: number;
    onPass: () => void;
    onCancel: () => void;
}

interface Question {
    id: number;
    questionText: string;
    options: string[];
}

interface Quiz {
    id: number;
    passingScore: number;
    questions: Question[];
}

export default function QuizPlayer({ lessonId, enrollmentId, onPass, onCancel }: QuizPlayerProps) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<number[]>([]); // Array of selected option indices
    const [result, setResult] = useState<{ passed: boolean; message: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadQuiz();
    }, [lessonId]);

    const loadQuiz = async () => {
        try {
            const data = await quizAPI.getQuiz(lessonId);
            if (data) {
                setQuiz(data);
                setAnswers(new Array(data.questions.length).fill(-1));
            }
        } catch (err) {
            console.error("Failed to load quiz", err);
            toast.error("Could not load quiz.");
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (qIndex: number, optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[qIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (answers.some((a) => a === -1)) {
            toast.error("Please answer all questions before submitting.");
            return;
        }

        setSubmitting(true);
        try {
            if (!quiz) return;

            const res = await quizAPI.submitQuiz(lessonId, quiz.id, answers, enrollmentId);
            setResult(res);

            if (res.passed) {
                toast.success("Congratulations! You passed the quiz.");
                setTimeout(() => {
                    onPass();
                }, 1500);
            } else {
                toast.error("You did not pass. Please review the material and try again.");
            }
        } catch (err) {
            console.error("Quiz submission error:", err);
            if (err instanceof Error && err.message.includes("Failed to parse response")) {
                toast.error("Server returned an invalid response. Please contact support or try again later.");
            } else if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to submit quiz.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Quiz...</div>;

    if (!quiz) {
        return (
            <div className="bg-white p-6 rounded-lg text-center">
                <p className="text-gray-500 mb-4">No quiz available for this lesson.</p>
                <button onClick={onPass} className="text-primary underline">Skip directly to completion</button>
            </div>
        );
    }

    if (result?.passed) {
        return (
            <div className="bg-white p-8 rounded-lg text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <Award className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-green-700">Quiz Passed!</h2>
                <p className="text-gray-600">Great job demonstrating your knowledge.</p>
                <div className="animate-pulse text-sm text-gray-400">Proceeding to next steps...</div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-auto shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Lesson Quiz</h2>
                    <p className="text-sm text-gray-500">Pass this quiz to complete the lesson.</p>
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="space-y-8">
                {quiz.questions.map((q, qIdx) => (
                    <div key={q.id || qIdx} className="space-y-3">
                        <h3 className="font-semibold text-lg text-gray-800">
                            {qIdx + 1}. {q.questionText}
                        </h3>
                        <div className="space-y-2 pl-4">
                            {q.options.map((opt, oIdx) => (
                                <label
                                    key={oIdx}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${answers[qIdx] === oIdx
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[qIdx] === oIdx ? "border-primary" : "border-gray-300"
                                        }`}>
                                        {answers[qIdx] === oIdx && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name={`q-${qIdx}`}
                                        checked={answers[qIdx] === oIdx}
                                        onChange={() => handleOptionSelect(qIdx, oIdx)}
                                        className="hidden"
                                    />
                                    <span className="text-gray-700">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t flex justify-end gap-3">
                {result && !result.passed && (
                    <p className="text-red-500 font-medium mr-auto self-center">
                        Score not met. Try again!
                    </p>
                )}

                <button onClick={onCancel} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 flex items-center gap-2"
                >
                    {submitting ? "Submitting..." : "Submit Answers"}
                    {!submitting && <ArrowRight className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
}
