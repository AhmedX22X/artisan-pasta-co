const express = require("express");
const path = require("path");
require("dotenv").config();
const nodemailer = require("nodemailer");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================
// OpenAI (Groq) Client
// ==========================
const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

// ==========================
// Middleware
// ==========================
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ==========================
// Health Check
// ==========================
app.get("/health", (req, res) => res.status(200).json({ status: "OK" }));

// ==========================
// Serve Frontend
// ==========================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==========================
// CHAT ENDPOINT
// ==========================
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
You are a friendly, expert pasta restaurant assistant. Your goal is to help customers order delicious pasta dishes naturally.

**Rules:**
- Be warm, concise, and helpful.
- If a user asks anything off-topic (weather, sports, etc.), politely redirect to pasta ordering.
- Understand variations: "I want spaghetti" = pasta=spaghetti, "tomato sauce" = sauce=tomato, "add chicken" = add-on=chicken.
- If user says "I'd like fettuccine Alfredo with shrimp", extract: pasta=fettuccine, sauce=alfredo, add-on=shrimp.
- Ask for missing info one at a time, but only if needed.

**Order flow (flexible):**
1. Pasta type (spaghetti, penne, fettuccine, ravioli, lasagna, or ask)
2. Sauce (alfredo, tomato, creamy, spicy, or ask)
3. Add-on (chicken, beef, cheese, shrimp, vegetables, or none)
4. Quantity (default 1 if not specified)

**When all info is collected**, reply EXACTLY with this format (and nothing else extra):
Order Summary:
Pasta: [value]
Sauce: [value]
Add-on: [value]
Quantity: [value]
Confirm your order? (yes/no)

If user says "confirm" or "yes", reply: "Great! I'll send your order to the kitchen. Please check your email for confirmation."

**Examples:**
User: "I want penne with creamy sauce and chicken"
Assistant: (already has all fields) -> Order Summary: Pasta: penne, Sauce: creamy, Add-on: chicken, Quantity: 1. Confirm?

User: "Spaghetti"
Assistant: Great choice! Which sauce would you like? (alfredo, tomato, creamy, spicy)

User: "Add beef"
Assistant: (if sauce missing) Got it. And which sauce for your spaghetti?

Always be helpful and never repeat the entire menu unless asked.
                    `,
                },
                ...messages,
            ],
        });
        const reply = completion.choices?.[0]?.message?.content || "No reply received.";
        res.json({ reply });
    } catch (error) {
        console.error("❌ Chat error:", error?.response?.data || error.message);
        res.status(500).json({ reply: "Server is waking up... try again in a few seconds ⏳" });
    }
});

// ==========================
// Email Transporter (with check)
// ==========================
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ Email credentials missing. Order emails will not be sent.");
}
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ==========================
// SEND ORDER
// ==========================
app.post("/send-order", async (req, res) => {
    try {
        const { customerEmail, customerName, customerPhone, orderDetails } = req.body;
        if (!customerEmail || !orderDetails) {
            return res.status(400).json({ success: false, message: "Missing fields" });
        }
        const mailOptions = {
            from: `"Artisan Pasta" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_TO || process.env.EMAIL_USER,
            cc: customerEmail,
            subject: `🍝 New Order from ${customerName || "Customer"}`,
            html: `
                <h2>New Order</h2>
                <p><b>Name:</b> ${customerName || "N/A"}</p>
                <p><b>Email:</b> ${customerEmail}</p>
                <p><b>Phone:</b> ${customerPhone || "N/A"}</p>
                <pre>${orderDetails}</pre>
            `,
        };
        await transporter.sendMail(mailOptions);
        res.json({ success: true });
    } catch (error) {
        console.error("❌ Email error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================
// NEWSLETTER SUBSCRIPTION
// ==========================
let subscribers = []; // in production, save to database
app.post("/subscribe", (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
        return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (!subscribers.includes(email)) {
        subscribers.push(email);
        console.log(`📧 New subscriber: ${email}`);
    }
    res.json({ success: true, message: "Subscribed!" });
});

// ==========================
// START SERVER
// ==========================
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    if (!process.env.GROQ_API_KEY) console.warn("⚠️ GROQ_API_KEY missing. Chatbot will fail.");
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) console.warn("⚠️ Email credentials missing.");
});