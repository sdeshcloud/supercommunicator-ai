const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { scenario, correctType, userResponse } = JSON.parse(event.body);

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
            content: `You are evaluating workplace communication based on Charles Duhigg's "Supercommunicators" framework. There are three conversation types:

1. PRACTICAL/INFORMATION: Focused on exchanging facts, data, solving problems, making decisions
2. SOCIAL: Focused on building relationships, bonding, casual connection, shared experiences
3. EMOTIONAL: Focused on feelings, empathy, validation, emotional support

Scenario: "${scenario}"

Correct conversation type: ${correctType}

User's response: "${userResponse}"

Evaluate whether the user's response appropriately matches the ${correctType} conversation type using the matching principle. 

Provide your evaluation in this exact JSON format with no other text:
{
  "matches": true or false,
  "feedback": "2-3 sentences explaining why the response does or doesn't match the conversation type, with specific examples from their response"
}`
          }
        ]
      })
    });

    const data = await response.json();
    const textContent = data.content.find(item => item.type === 'text')?.text || '';
    
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const evaluation = JSON.parse(jsonMatch[0]);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluation)
      };
    } else {
      throw new Error('Could not parse AI response');
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to evaluate response' })
    };
  }
};
