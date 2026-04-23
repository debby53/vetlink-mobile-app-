import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Check, X } from "lucide-react";
import { toast } from "sonner";
import { quizAPI } from "@/lib/apiService";

interface QuizBuilderProps {
    lessonId: number;
    onClose: () => void;
}

interface Question {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
}

export default function QuizBuilder({ lessonId, onClose }: QuizBuilderProps) {
    const [passingScore, setPassingScore] = useState(70);
    const [questions, setQuestions] = useState<Question[]>([
        { questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 },
    ]);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExistingQuiz();
    }, [lessonId]);

    const loadExistingQuiz = async () => {
        try {
            const quiz = await quizAPI.getQuiz(lessonId);
            if (quiz) {
                setPassingScore(quiz.passingScore);
                if (quiz.questions && quiz.questions.length > 0) {
                    setQuestions(quiz.questions);
                }
            }
        } catch (err) {
            console.warn("No existing quiz found or failed to load");
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = () => {
        setQuestions([
            ...questions,
            { questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 },
        ]);
    };

    const removeQuestion = (index: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQuestions = [...questions];
        (newQuestions[index] as any)[field] = value;
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSave = async () => {
        // Validation
        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].questionText.trim()) {
                toast.error(`Question ${i + 1} is missing text`);
                return;
            }
            if (questions[i].options.some(opt => !opt.trim())) {
                toast.error(`Question ${i + 1} has empty options`);
                return;
            }
        }

        setIsSaving(true);
        try {
            await quizAPI.createQuiz(lessonId, {
                passingScore,
                questions
            });
            toast.success("Quiz saved successfully!");
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save quiz");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading quiz data...</div>;

    return (
        <div className="bg-white rounded-lg p-6 max-h-[80vh] overflow-y-auto w-full max-w-3xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Build Quiz</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <label className="font-medium">Passing Score (%):</label>
                    <input
                        type="number"
                        value={passingScore}
                        onChange={(e) => setPassingScore(Number(e.target.value))}
                        className="border rounded p-2 w-20"
                        min="0" max="100"
                    />
                </div>

                {questions.map((q, qIdx) => (
                    <div key={qIdx} className="border rounded-lg p-4 bg-gray-50 relative">
                        <button
                            onClick={() => removeQuestion(qIdx)}
                            className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>

                        <div className="mb-4 pr-8">
                            <label className="block text-sm font-medium mb-1">Question {qIdx + 1}</label>
                            <input
                                className="w-full border rounded p-2"
                                placeholder="Enter question text..."
                                value={q.questionText}
                                onChange={(e) => updateQuestion(qIdx, "questionText", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium mb-1">Options (Select the correct answer)</label>
                            {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name={`correct-${qIdx}`}
                                        checked={q.correctAnswerIndex === oIdx}
                                        onChange={() => updateQuestion(qIdx, "correctAnswerIndex", oIdx)}
                                        className="h-4 w-4 text-primary"
                                    />
                                    <input
                                        className="flex-1 border rounded p-2 text-sm"
                                        placeholder={`Option ${oIdx + 1}`}
                                        value={opt}
                                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    onClick={addQuestion}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="h-5 w-5" /> Add Question
                </button>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
                <button
                    onClick={onClose}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                >
                    {isSaving ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div> : <Save className="h-4 w-4" />}
                    Save Quiz
                </button>
            </div>
        </div>
    );
}
