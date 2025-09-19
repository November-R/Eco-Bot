    import express from 'express';
    import axios from 'axios';
    import 'dotenv/config'; // Loads environment variables from .env

    const app = express();
    const port = 3000;



    app.use(express.json()); // Enable JSON body parsing for POST requests

    app.use(express.static("public"));

    const HF_API_URL = "https://huggingface.co/eci-io/climategpt-7b"; // Replace YOUR_MODEL_ID
    const HF_HEADERS = {
        "Authorization": `Bearer ${process.env.HF_API_TOKEN}`,
        "Content-Type": "application/json" // Important for POST requests
    };

    // GET method example (for simple information or if your model supports GET)
    app.get("/", async (req, res) => {
        try {
            // This is a placeholder; Hugging Face Inference API typically uses POST for model inference.
            // You might use GET for internal status checks or if a specific HF endpoint allows it.
            res.json({ message: "Hugging Face API integration is ready." });
        } catch (error) {
            console.error("Error in GET /api/status:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    // POST method for Hugging Face model inference
    app.post("/send", async (req, res) => {
        const { inputs } = req.body; // Expecting 'inputs' in the request body

        if (!inputs) {
            return res.status(400).json({ error: "Input text is required." });
        }

        try {
            const response = await axios.post(
                HF_API_URL,
                { inputs: inputs },
                { headers: HF_HEADERS }
            );
            res.json(response.data);
        } catch (error) {
            console.error("Error calling Hugging Face API:", error.response ? error.response.data : error.message);
            res.status(500).json({ error: "Failed to get inference from Hugging Face." });
        }
    });

    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });