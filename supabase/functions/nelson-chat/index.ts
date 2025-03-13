
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error("Missing Gemini API configuration");
      throw new Error('Missing Gemini API configuration');
    }
    console.log("Gemini API key is configured");

    // Get Supabase connection from environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Missing Supabase configuration");
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Parse request body
    const { message, userId } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the incoming request
    console.log(`Processing request from user ${userId}: "${message}"`);

    // Perform semantic search
    const { data: chapterChunks, error: chapterError } = await supabase
      .from('chapter_chunks')
      .select('content, chapter')
      .textSearch('content', message.split(' ').filter(word => word.length > 3).join(' | '), {
        type: 'websearch',
        config: 'english'
      })
      .limit(3);

    if (chapterError) {
      console.error("Chapter search error:", chapterError);
      throw new Error('Error searching chapter content');
    }

    const { data: nelsonChunks, error: nelsonError } = await supabase
      .from('nelson_chunks')
      .select('chunk_text')
      .textSearch('chunk_text', message.split(' ').filter(word => word.length > 3).join(' | '), {
        type: 'websearch',
        config: 'english'
      })
      .limit(3);

    if (nelsonError) {
      console.error("Nelson chunks search error:", nelsonError);
      throw new Error('Error searching Nelson content');
    }

    // Combine results from both tables
    const relevantChunks = [
      ...(chapterChunks || []).map(chunk => `From chapter "${chunk.chapter}": ${chunk.content}`),
      ...(nelsonChunks || []).map(chunk => chunk.chunk_text)
    ];

    // If no relevant chunks found, handle this case
    const context = relevantChunks.length > 0 
      ? relevantChunks.join('\n\n') 
      : "No specific information found in the Nelson Textbook database for this query.";

    console.log(`Found ${relevantChunks.length} relevant chunks from Nelson Textbook`);

    // Prepare prompt for Gemini
    const systemPrompt = `You are Nelson-GPT, a pediatric medical assistant based exclusively on the Nelson Textbook of Pediatrics. 
    Provide accurate, evidence-based answers using only the information provided in the context below. 
    Format your responses with markdown for readability including bullet points, bold, and headings when appropriate. 
    If the information to answer the question is not in the context, acknowledge that you don't have enough information from 
    the Nelson Textbook to answer the question accurately and suggest consulting a healthcare provider. 
    Always include a disclaimer that your responses are not a substitute for professional medical advice.
    
    Context from Nelson Textbook:
    ${context}`;

    try {
      console.log("Sending request to Gemini API");
      // Correct model name format for Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash/generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt }]
            },
            {
              role: "user",
              parts: [{ text: message }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error response:", errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const geminiResponse = await response.json();
      console.log("Received response from Gemini API");
      
      if (!geminiResponse.candidates || 
          geminiResponse.candidates.length === 0 || 
          !geminiResponse.candidates[0].content || 
          !geminiResponse.candidates[0].content.parts || 
          geminiResponse.candidates[0].content.parts.length === 0) {
        console.error("Invalid Gemini response format:", JSON.stringify(geminiResponse));
        throw new Error("Invalid response format from Gemini API");
      }

      const aiResponse = geminiResponse.candidates[0].content.parts[0].text;
      if (!aiResponse) {
        console.error("Empty text in Gemini response:", JSON.stringify(geminiResponse.candidates[0]));
        throw new Error("Empty response text from Gemini API");
      }

      console.log("Successfully generated response");

      return new Response(
        JSON.stringify({ 
          answer: aiResponse,
          context: relevantChunks
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (geminiError) {
      console.error("Gemini API error:", geminiError);
      throw new Error(`Error generating AI response: ${geminiError.message}`);
    }

  } catch (error) {
    console.error("Error in nelson-chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        answer: "I apologize, but I encountered an error processing your request. Please try again in a moment."
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
