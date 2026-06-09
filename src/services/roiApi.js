const API_URL = 'http://localhost:5000/api/calculate'

export async function calculateRoi(inputs) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs),
  })

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`)
  }

  return response.json()
}
