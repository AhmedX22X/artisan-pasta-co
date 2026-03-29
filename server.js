const express = require("express");
const path = require("path");
require("dotenv").config();
const nodemailer = require("nodemailer"); // ← Added here
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ reply: "No messages provided." });
    }

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `
You are an AI assistant for a pasta restaurant landing page.
Your job is to help users choose pasta, build an order step by step, and guide them toward confirmation.
Rules:
- Keep replies short, clear, and natural.
- Ask only one useful follow-up question at a time.
- Stay focused on pasta ordering only.
- Remember what the user already chose.
- If the user is unsure, suggest one popular option.
- Do not act like a general chatbot.
- Do not write long paragraphs.
- Do NOT confirm orders yourself.
Available menu:
- Pasta: spaghetti, penne, fettuccine, ravioli, lasagna
- Sauces: alfredo, tomato, creamy, spicy
- Add-ons: chicken, beef, cheese
Ordering flow:
1. Ask for pasta type if missing
2. Ask for sauce if missing
3. Ask for add-on if missing
4. Ask for quantity if missing
5. Once all details are collected, reply exactly in this format:
Order Summary:
Pasta: [value]
Sauce: [value]
Add-on: [value or None]
Quantity: [value]
Confirm your order?
Important:
- Once you show the order summary, do not finalize the order in chat.
- If the user says "yes", "confirm", "okay", or similar after the summary, reply exactly:
Please use the confirmation button below to complete your order.
- You do not process payments or actually place the order yourself.
`,
        },
        ...messages,
      ],
    });

    const reply = completion.choices?.[0]?.message?.content || "No reply received.";
    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error?.response?.data || error.message || error);
    res.status(500).json({ reply: "Something went wrong on the server." });
  }
});

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email endpoint
app.post("/send-order", async (req, res) => {
  try {
    const { customerEmail, customerName, customerPhone, orderDetails } = req.body;

    if (!customerEmail || !orderDetails) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const mailOptions = {
      from: `"Artisan Pasta Co." <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      cc: customerEmail,
      subject: `🍝 New Order from ${customerName || "Customer"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D9381E;">🍝 New Order Received!</h2>
          <hr>
          <h3>Customer Information:</h3>
          <p><strong>Name:</strong> ${customerName || "Not provided"}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Phone:</strong> ${customerPhone || "Not provided"}</p>
          <hr>
          <h3>Order Details:</h3>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px;">${orderDetails}</pre>
          <hr>
          <p style="color: #757575; font-size: 14px;">
            Order received on ${new Date().toLocaleString()}
          </p>
          <p style="color: #D9381E; font-weight: bold;">
            Please confirm this order with the customer.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Order email sent successfully!" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});