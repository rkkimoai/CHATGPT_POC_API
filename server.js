const express = require("express");
const axios = require("axios");
const { courses, results } = require("./test-data");

const app = express();
const port = 3001; // Set your desired port number
require("dotenv").config();
const token = process.env.CHATGPT_TOKEN;
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Middleware to parse JSON request bodies
app.use(express.json());

const query1 = `Given the following courses: ${JSON.stringify(
  courses
)} and user results: ${JSON.stringify(results)}, 
please return only the top 3 course names as a plain JSON array without any additional text or explanation. The format should be: ["course1", "course2", "course3"] and nothing else.`;

// POST endpoint to handle user queries
app.post("/api/query", async (req, res) => {
  const { query } = req.body;

  try {
    // Make a POST request to the ChatGPT API
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          {
            role: "user",
            content: `Given the following courses: ${JSON.stringify(
              courses
            )} and user results: ${JSON.stringify(results)}, 
            ${query}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Replace with your ChatGPT API key
          "Content-Type": "application/json",
        },
      }
    );
    
    console.log({ response: response.data.choices[0] });

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error.response.data);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
