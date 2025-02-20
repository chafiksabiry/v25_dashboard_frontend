import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { vertexApi } from "../services/api/vertex";
import { Target, CheckCircle2, AlertTriangle, FileText, BookOpen, Volume2 } from 'lucide-react';

interface CallReport {
    "Agent fluency": { score: number; feedback: string };
    "Sentiment analysis": { score: number; feedback: string };
    "Fraud detection": { score: number; feedback: string };
    "overall": { score: number; feedback: string };
}

const initialReport: CallReport = {
    "Agent fluency": { score: 0, feedback: '' },
    "Sentiment analysis": { score: 0, feedback: '' },
    "Fraud detection": { score: 0, feedback: '' },
    "overall": { score: 0, feedback: '' }
};

function CallReportCard() {
    const [report, setReport] = useState<CallReport>(initialReport);
    const [transcription, setTranscription] = useState<string | null>(null);
    const [summary, setSummary] = useState<string | null>(null);

    const [loadingReport, setLoadingReport] = useState<boolean>(true);
    const [loadingTranscription, setLoadingTranscription] = useState<boolean>(true);
    const [loadingSummary, setLoadingSummary] = useState<boolean>(true);

    const [errorReport, setErrorReport] = useState<string | null>(null);
    const [errorTranscription, setErrorTranscription] = useState<string | null>(null);
    const [errorSummary, setErrorSummary] = useState<string | null>(null);


    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const recordingUrl = params.get('recording_url') || '';

    useEffect(() => {
        if (!recordingUrl) return;

        // Fetch Call Scoring
        const fetchScoring = async () => {
            try {
                setLoadingReport(true);
                const response = await vertexApi.getCallScoring({ file_uri: recordingUrl });
                setReport(response);
            } catch (err) {
                setErrorReport("Failed to analyze the call.");
            } finally {
                setLoadingReport(false);
            }
        };

        // Fetch Call Transcription
        const fetchTranscription = async () => {
            try {
                setLoadingTranscription(true);
                const response = await vertexApi.getCallTranscription({ file_uri: recordingUrl });
                setTranscription(response.transcription);
            } catch (err) {
                setErrorTranscription("Failed to transcribe the call.");
            } finally {
                setLoadingTranscription(false);
            }
        };

        // Fetch Call Summarization
        const fetchSummary = async () => {
            try {
                setLoadingSummary(true);
                const response = await vertexApi.getCallSummary({ file_uri: recordingUrl });
                console.log("response summary :", response)
                console.log("response summary :", response.parts[0].text)
                setSummary(response.parts[0].text);
            } catch (err) {
                setErrorSummary("Failed to generate call summary.");
            } finally {
                setLoadingSummary(false);
            }
        };

        fetchScoring();
        fetchTranscription();
        fetchSummary();
    }, []);

    // Spinner Component
    // **Spinner Component with Text**
    const LoadingSpinner = ({ text }: { text: string }) => (
        <div className="flex flex-col items-center py-4">
            <svg
                className="animate-spin h-10 w-10 text-blue-600 mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <p className="text-sm text-gray-600">{text}</p>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden p-4 space-y-6">
            {/* Call Recording */}
            <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                    <Volume2 className="h-5 w-5 text-blue-500" />
                    <h3 className="text-sm font-medium text-blue-900">Call Recording</h3>
                </div>

                {recordingUrl ? (
                    <audio controls className="w-full">
                        <source src={recordingUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                ) : (
                    <p className="text-red-500">Recording not available.</p>
                )}
            </div>

            {/* Call Transcription */}
            <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <h3 className="text-sm font-medium text-purple-900">Call Transcription</h3>
                </div>
                {loadingTranscription ? <LoadingSpinner text="Generating call transcription ..." /> : errorTranscription ? <p className="text-red-500">{errorTranscription}</p> : (
                    <div className="bg-gray-100 p-3 rounded-md text-sm text-gray-800">
                        {transcription}
                    </div>
                )}
            </div>

            {/* Call Summarization */}
            <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                    <BookOpen className="h-5 w-5 text-green-500" />
                    <h3 className="text-sm font-medium text-green-900">Call Summary</h3>
                </div>
                {loadingSummary ? <LoadingSpinner text="Generating call Summary ..." /> : errorSummary ? <p className="text-red-500">{errorSummary}</p> : (
                    <div className="bg-gray-100 p-3 rounded-md text-sm text-gray-800">
                        {summary}
                    </div>
                )}
            </div>
            {/* Call Report */}
            <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                    <Target className="h-5 w-5 text-blue-500" />
                    <h3 className="text-sm font-medium text-blue-900">Call Scoring metrix</h3>
                </div>

                {loadingReport ? <LoadingSpinner text="Generating call scoring ..." /> : errorReport ? <p className="text-red-500">{errorReport}</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {Object.entries(report)
                                .filter(([category]) => category !== "overall")
                                .map(([category, data]) => (
                                    <div key={category}>
                                        <label className="text-sm font-medium text-gray-700 mb-3 block">{category}</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full ${data.score >= 80 ? "bg-green-500" :
                                                        data.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                                                        }`}
                                                    style={{ width: `${data.score}%` }}
                                                />
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900">{data.score}</div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">{data.feedback}</p>
                                    </div>
                                ))}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Overall Score</h4>
                                <div className="text-4xl font-bold text-blue-600 mb-2">
                                    {report.overall.score}%
                                </div>
                                <p className="text-sm text-gray-600">{report.overall.feedback}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CallReportCard;
