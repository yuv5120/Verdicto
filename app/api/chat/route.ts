/* export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📩 Received request body:", body); // Debug input

        // Ensure API key is available
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("❌ Missing OpenAI API Key");
            return Response.json({ error: "Server configuration error: API key missing." }, { status: 500 });
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4", // Preferred model
                messages: body.messages,
            }),
        });

        const data = await response.json();
        console.log("📤 OpenAI API response:", data); // Debug response

        // Handle OpenAI API errors
        if (!response.ok) {
            console.error("⚠️ OpenAI API error:", data);

            // If model is not found, fallback to GPT-3.5-turbo
            if (data.error?.code === "model_not_found") {
                console.warn("🔄 Falling back to GPT-3.5-turbo...");
                return await fetchFallback(body.messages, apiKey);
            }

            return Response.json({ error: "OpenAI API error", details: data }, { status: response.status });
        }

        return Response.json(data);

    } catch (error) {
        console.error("🔥 Server error:", error);

        return Response.json({ error: error instanceof Error ? error.message : "An internal server error occurred." }, { status: 500 });
    }
}

// Fallback function to use GPT-3.5-turbo
async function fetchFallback(messages: any, apiKey: string) {
    console.log("🔄 Retrying with GPT-3.5-turbo...");
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: messages,
        }),
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error("⚠️ OpenAI API error (Fallback failed):", data);
        return Response.json({ error: "OpenAI API error (Fallback failed)", details: data }, { status: response.status });
    }

    return Response.json(data);
} */
    import { NextRequest, NextResponse } from "next/server";
    import { GoogleGenerativeAI } from "@google/generative-ai";
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    
    export async function POST(req: NextRequest) {
      try {
        const { messages, category } = await req.json();
    
        if (!messages || !Array.isArray(messages)) {
          return NextResponse.json({ error: "Invalid request: 'messages' array is required" }, { status: 400 });
        }
    
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" }); // ✅ Use the latest working model
    
        const userMessage = messages[messages.length - 1]?.content || "Hello";
    
        const prompt = `You are a helpful ${
          category === "finance" ? "financial" : "legal"
        } advisor. Answer the following question: ${userMessage}`;
    
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
    
        const aiResponseRaw = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
const aiResponse = aiResponseRaw.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, "<br/>");

    
        return NextResponse.json({ response: aiResponse });
      } catch (error: any) {
        console.error("🔥 Gemini API Error:", error);
        return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
      }
    }
    
    