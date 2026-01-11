const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `You are creating training scenarios based on Charles Duhigg's "Supercommunicators" framework.

Generate ONE realistic workplace communication scenario. The scenario should clearly represent one of these three conversation types:

1. PRACTICAL/INFORMATION: Focused on exchanging facts, data, solving problems, making decisions
2. SOCIAL: Focused on building relationships, bonding, casual connection, shared experiences  
3. EMOTIONAL: Focused on feelings, empathy, validation, emotional support

Create a scenario that:
- Is realistic and relatable
- Clearly represents ONE conversation type
- Includes dialogue or specific context
- Is 2-4 sentences long
- Could happen in a modern workplace

Provide your response in this exact JSON format with no other text:
{
  "text": "The complete scenario text with dialogue",
  "correctType": "practical" or "social" or "emotional",
  "explanation": "2-3 sentences explaining why this scenario requires this specific conversation type"
}`
          }
        ]
      })
    });

    const data = await response.json();
    const textContent = data.content.find(item => item.type === 'text')?.text || '';
    
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const scenario = JSON.parse(jsonMatch[0]);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenario)
      };
    } else {
      throw new Error('Could not parse AI response');
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate scenario' })
    };
  }
};
