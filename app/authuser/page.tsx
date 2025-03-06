"use client"; // ✅ Ensures this is a Client Component (Required for Hooks like useState)

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ Import Next.js router
import axios from "axios";
import * as mammoth from "mammoth"; // ✅ DOCX Parsing Library
import { AiOutlinePlus } from "react-icons/ai"; // ✅ Import Plus Icon
import { Tooltip } from "react-tooltip"; // ✅ Tooltip for upload button
import * as pdfjsLib from "pdfjs-dist"; // ✅ PDF Processing     

// ✅ Define the structure for the expected API response
interface CommentAnalysisResult {
    platform: string;
    username: string;
    comment: string;
    sentiment: string;
    confidence?: number;
    purchase_intent: string;
}

// ✅ Smart Function to Extract Platform, Username, and Comment
const parseComment = (line: string): { platform: string; username: string; text: string } => { 
    // ✅ List of known platforms
    const platforms = ["Facebook", "TikTok", "X", "Instagram", "YouTube", "LinkedIn"];
    
    let detectedPlatform = "Unknown";
    platforms.forEach(platform => {
        if (line.includes(platform)) detectedPlatform = platform;
    });

    // ✅ Extract username (with or without @)
    let username = "Anonymous";

    // Match @username or a capitalized username (without spaces) at the beginning
    const usernameMatch = line.match(/(?:^|\s)(@\w+|[A-Z][a-zA-Z0-9_]+)/);

    if (usernameMatch) {
        username = usernameMatch[1] ? usernameMatch[1].trim() : usernameMatch[0].trim(); // Capture match

        // If username doesn't start with "@", add it for consistency
        if (!username.startsWith("@")) {
            username = `@${username}`;
        }

        // ✅ Remove username from the comment text
        line = line.replace(usernameMatch[0], "").trim();
    }

    // ✅ Remove platform name from the text
    platforms.forEach(platform => {
        line = line.replace(platform, "").trim();
    });

    // ✅ Remove any lingering punctuation
    const cleanedText = line.replace(/[,]/g, "").trim();

    return { platform: detectedPlatform, username, text: cleanedText };
};


export default function Home() {
    const [comments, setComments] = useState<string>("");
    const [results, setResults] = useState<CommentAnalysisResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter(); // ✅ Initialize useRouter inside the component    
      
    useEffect(() => {
        const auth = sessionStorage.getItem("auth");
      
          if (!auth) {
            router.push("/auth"); // Redirect if not authenticated
          }
        }, []);

    // ✅ Function to process and analyze comments
    const analyzeComments = async () => {
        if (!comments.trim()) return;
        setLoading(true);

        const commentList = comments.split("\n").map(parseComment).filter(c => c.text);

        if (commentList.length === 0) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post<CommentAnalysisResult[]>("http://localhost:5000/analyze", {
                comments: commentList,
            });

            setResults(response.data);
        } catch (error) {
            console.error("Error analyzing comments", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Handle File Upload (JSON, DOCX, PDF)
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileType = file.name.split(".").pop()?.toLowerCase();

        if (fileType === "json") {
            // ✅ Handle JSON Files
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target?.result as string);
                    if (Array.isArray(jsonData)) {
                        const formattedData = jsonData
                            .map((item: { platform?: string; username?: string; comment?: string }) => ({
                                platform: item.platform || "Unknown",
                                username: item.username || "Anonymous",
                                text: item.comment || "",
                            }))
                            .filter(c => c.text);

                        setComments(formattedData.map(c => `${c.platform} | ${c.username} | ${c.text}`).join("\n"));
                    }
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
            };
            reader.readAsText(file);
        } else if (fileType === "docx") {
            // ✅ Handle DOCX Files (MS Word)
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target?.result as ArrayBuffer;
                    const text = await mammoth.extractRawText({ arrayBuffer });
                    const formattedData = text.value
                        .split("\n")
                        .map(parseComment)
                        .filter(c => c.text);

                    setComments(formattedData.map(c => `${c.platform} | ${c.username} | ${c.text}`).join("\n"));
                } catch (error) {
                    console.error("Error parsing DOCX:", error);
                }
            };
            reader.readAsArrayBuffer(file);
        } else if (fileType === "pdf") {
            // ✅ Handle PDF Files
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    let extractedText = "";

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        extractedText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
                    }

                    const formattedData = extractedText
                        .split("\n")
                        .map(parseComment)
                        .filter(c => c.text);

                    setComments(formattedData.map(c => `${c.platform} | ${c.username} | ${c.text}`).join("\n"));
                } catch (error) {
                    console.error("Error parsing PDF:", error);
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert("Unsupported file format! Please upload a JSON, DOCX, or PDF file.");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl text-center font-bold mb-4">Bulk Comment Analyzer </h1>
            <div className= "bg-indigo-200" >
                <p className="text-xl text-center text-gray-700">
                This <span className="text-blue-600 font-semibold">AI-powered tool</span> analyzes comments to determine their sentiment 
                and intent. It classifies them as <span className="text-green-600 font-semibold">positive</span> or 
                <span className="text-red-600 font-semibold"> negative</span> while also assessing user intent.  
            
                <span className="text-green-600 font-semibold">"Yes"</span> indicates the commenter is willing to buy the product or service.  
                <span className="text-red-600 font-semibold">"No"</span> means they have no intent to purchase.
                </p>
            </div> 
           

            {/* ✅ User input textarea for pasting comments */}

            <div className="flex justify-center mt-4">
                <div className="relative w-2/3">
                {/* ✅ Textarea */}
                <textarea
                    className="w-full p-2 border rounded mt-4 min-h-[150px] pr-10 pb-10"
                    placeholder="Paste comments here"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                ></textarea>

                {/* ✅ File Upload Icon (Bottom Left) */}
                <label htmlFor="file-upload" className="absolute bottom-2 left-2 cursor-pointer">
                    <AiOutlinePlus className="text-2xl text-blue-500 hover:text-blue-700 transition" data-tooltip-id="upload-tooltip" />
                </label>

                <Tooltip id="upload-tooltip" place="top">
                    Upload JSON, PDF, or DOCX
                </Tooltip>

                {/* ✅ Hidden File Input */}
                <input
                    id="file-upload"
                    type="file"
                    accept=".json,.pdf,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>
        </div>                    

            {/* ✅ Button to analyze comments */}
            <div className="flex justify-center mt-2">
            <button
                className="mt-2 bg-blue-500 button-center text-white px-4 py-2 rounded"
                onClick={analyzeComments}
                disabled={loading}
            >
                {loading ? "Analyzing..." : "Analyze Comments"}
            </button>
            </div>            

            {/* ✅ Display results in a table */}
            {results.length > 0 && (
                <div className="mt-4 bg-indigo-100">
                    <h2 className="text-xl font-semibold">Results:</h2>
                    <div className="overflow-auto max-h-96 border rounded p-2">
                        <table className="w-full border-collapse">                       
                            <thead>
                                <tr className="bg-indigo-200">
                                    <th className="border p-2">Platform</th>
                                    <th className="border p-2">Username</th>
                                    <th className="border p-2">Comment</th>
                                    <th className="border p-2">Sentiment</th>
                                    <th className="border p-2">Purchase Intent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((res, index) => (
                                    <tr key={index} className="border">
                                        <td className="border p-2">{res.platform}</td>
                                        <td className="border p-2">{res.username}</td>
                                        <td className="border p-2">{res.comment}</td>
                                        <td className="border p-2">{res.sentiment}</td>
                                        <td className="border p-2">{res.purchase_intent}</td>
                                    </tr>
                                ))}
                            </tbody>                                                    
                        </table>
                    </div>
                </div>
            )}
            {/* ✅ Button to navigate to the Dashboard */}
            {results.length > 0 && (
                <button
                    className="mt-2 ml-4 bg-green-500 text-white px-4 py-2 rounded"
                    onClick={() => router.push("/dashboard")} //Dashboard only accessible after signing in. 
                >
                    View Dashboard
                </button>
            )}
        </div>
    );
}
