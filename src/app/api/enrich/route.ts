import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    //req.json() method will convert that JSON string back into a regular JavaScript object.
    const body = await req.json(); 
    const product = body.product; 

    const prompt = `
        You are an expert product data enricher. Given the product below, enrich it with the following attributes:

        - itemWeight: An object with "value" (number) and "unit" (string, e.g., "g")
        - ingredients: Array of strings (Only include this if the product is edible. Do NOT include it for non-edible products.)
        - description: Short paragraph describing the product
        - storage: Array of one or more values ONLY from:
            - Dry Storage
            - Deep Frozen
            - Ambient Storage
            - Frozen Food Storage
        - itemsPerPack: Number
        - color: String
        - material: String
        - width: An object with "value" (number) and "unit" (string, e.g., "cm")
        - height: An object with "value" (number) and "unit" (string, e.g., "cm")
        - warranty: A number representing number of years (e.g., 2 for 2 years)

        IMPORTANT:
        - Do NOT use strings like "2 years" for warranty—just use the number: 2.
        - Always return pure JSON that matches this structure.

        Product:
        ${JSON.stringify(product)}

        Respond ONLY in raw JSON format.
    `;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions",{
        method: "POST",
        headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        }),

    }); 

    if (!groqRes.ok) { // Check if the HTTP status code was in the 2xx range
    const errorText = await groqRes.text(); // Get the raw response text
    console.error("Groq API error status:", groqRes.status);
    console.error("Groq API error text:", errorText);
    // Return an error response to the client
    return NextResponse.json({ success: false, error: `Groq API error: ${errorText}`}, { status: groqRes.status });
    }

    const json = await groqRes.json();

    // 1. Get the raw content from the AI
    const rawAiContent = json.choices[0].message.content;
    console.log("Raw AI Content (before parsing):", rawAiContent);

    // 2. Use a regular expression to extract the JSON string
    // This regex looks for text between ```json and ```
    const jsonMatch = rawAiContent.match(/```(?:json)?\n([\s\S]*?)\n```/);

    let jsonString;
    if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1]; // The captured group [1] is the content inside the block
    } else {
        // Fallback: If no markdown block is found, assume it's pure JSON
        // (or handle other non-json responses as an error)
        console.warn("AI response did not contain a JSON markdown block. Attempting to parse as plain JSON.");
        jsonString = rawAiContent;
    }

    // 3. Parse the extracted (or assumed pure) JSON string
    let enriched;
    try {
        enriched = JSON.parse(jsonString);
        // *** IMPORTANT LOGGING ***
        console.log("SUCCESS: Enriched object prepared by /api/enrich:", JSON.stringify(enriched, null, 2));
    } catch (parseError) {
        console.error("JSON parsing error in /api/enrich:", parseError);
        console.error("String that caused parsing error:", jsonString);
        return NextResponse.json({ success: false, error: `Failed to parse AI response: ${parseError}` }, { status: 500 });
    }

    return NextResponse.json({ enriched });



}