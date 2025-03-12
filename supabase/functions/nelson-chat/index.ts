
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
      throw new Error('Missing GEMINI_API_KEY');
    }

    // Get Supabase connection from environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
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

    // Perform semantic search to retrieve relevant chunks from Nelson textbook
    // For simplicity, we're searching in both tables: chapter_chunks and nelson_chunks
    const { data: chapterChunks, error: chapterError } = await supabase
      .from('chapter_chunks')
      .select('content, chapter')
      .textSearch('content', message.split(' ').filter(word => word.length > 3).join(' | '), {
        type: 'websearch',
        config: 'english'
      })
      .limit(3);

    const { data: nelsonChunks, error: nelsonError } = await supabase
      .from('nelson_chunks')
      .select('chunk_text')
      .textSearch('chunk_text', message.split(' ').filter(word => word.length > 3).join(' | '), {
        type: 'websearch',
        config: 'english'
      })
      .limit(3);

    if (chapterError || nelsonError) {
      console.error("Search error:", chapterError || nelsonError);
      throw new Error('Error searching for relevant medical information');
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

    // Call Gemini API
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
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const geminiResponse = await response.json();
    
    // Extract the text from the Gemini response
    const aiResponse = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I apologize, but I couldn't generate a response based on the Nelson Textbook. Please consult a healthcare provider for medical advice.";

    console.log("Successfully generated response");

    // Return the response
    return new Response(
      JSON.stringify({ 
        answer: aiResponse,
        context: relevantChunks
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in nelson-chat function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
