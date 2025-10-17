Technology Stack
1. Backend: Node.js, Express.js, MongoDB (using Mongoose)

2. Frontend: React.js, Material-UI, Axios

3. LLM Explanations: Hugging Face Inference API (distilgpt2) or robust local mock logic

4. Authentication: Uses sample user IDs for demonstration purposes

5. Dev Tools: Nodemon, dotenv, express-rate-limit, Joi

6. Deployment: Local or cloud (MongoDB Atlas, Vercel, Netlify)

Repository Structure

    ecommerce-recommender/
    ├── backend/
    │   ├── models/
    │   ├── routes/
    │   ├── services/
    │   ├── utils/
    │   ├── seed.js
    │   ├── index.js
    │   └── .env.example
    └── frontend/
        ├── src/
        │   ├── App.js
        │   └── index.js
        ├── package.json
    └── README.md


Getting Started
Prerequisites
Node.js (v18.x or newer), npm

MongoDB Atlas account (free tier), Hugging Face account (free tier for API key)

Backend Setup
Clone the repository and install dependencies:

bash
git clone https://github.com/avishkarchauhan001/ecommerce-recommender.git
cd ecommerce-recommender/backend
npm install
Copy .env.example to .env and fill in your MongoDB URI and Hugging Face API key:


MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
HUGGINGFACE_API_KEY=hf_your_key_here
PORT=5000


Seed the database (creates products and interactions for demo):

bash
node seed.js
Start the backend server:

bash
npm run dev
Frontend Setup
Install frontend dependencies:

bash
cd ../frontend
npm install
Start the React dashboard:

bash
npm start
By default, React runs on http://localhost:3000.

Usage
Access the dashboard at http://localhost:3000

Enter a sample user ID (see console output from seed.js, e.g., 507f1f77bcf86cd799439012)

Click "Get Recommendations" to view suggestions and explanations

Alternatively, view popular products or test REST API endpoints via Postman/cURL

API Documentation
POST /api/recommend
Get personalized recommendations and explanations for a user

Request Body

json
{
  "userId": "507f1f77bcf86cd799439012"
}
Response

json
{
  "success": true,
  "userId": "507f1f77bcf86cd799439012",
  "recommendations": [
    {
      "_id": "...",
      "name": "Denim Jacket",
      "description": "...",
      "category": "clothing",
      "price": 59.99,
      "tags": [ ... ],
      "explanation": "Based on your clothing purchases, the Denim Jacket offers casual style and durable layering to complement your everyday looks."
    },
    ...
  ],
  "count": 3
}
GET /api/popular?limit=5
Get popular products with explanations for new/cold-start users

Response

json
{
  "success": true,
  "recommendations": [
    {
      "_id": "...",
      "name": "...",
      "explanation": "This item is popular among similar users interested in electronics, featuring trending features."
    },
    ...
  ],
  "count": 5
}
Customization
LLM Provider: Swap Hugging Face for a local LLM (ex: Ollama) or use enhanced mock explanations in services/llm.js

Product catalog: Customize products and user behaviors in backend/seed.js for domain-specific demos

Recommendation logic: Tweak similarity thresholds/settings in backend/utils/recommendations.js for your needs

Styling: Update Material-UI components in the frontend for branding/theme

Testing
Backend and frontend unit tests can be added using Jest and React Testing Library

API can be tested via Swagger/postman or using included frontend dashboard

Deployment
Deploy backend on platforms like Render or Heroku; frontend on Vercel or Netlify

Configure CORS and environment variables for cloud setup

Credits
Project by avishkarchauhan001

Utilizes open models from Hugging Face and open-source MERN stack components

Special thanks to contributors/tools referenced throughout the project

License
This project is open source and available under the MIT license.