// Select DOM elements
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

class IntelligentAIModule {
    constructor() {
        this.learnedResponses = JSON.parse(localStorage.getItem('learnedResponses')) || {};
        this.intents = [
            { tag: "greeting", patterns: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"], responses: ["Hello! How can I assist you today?", "Hi there! What can I do for you?"] },
            { tag: "farewell", patterns: ["bye", "goodbye", "see you later", "farewell", "take care"], responses: ["Goodbye! Have a great day!", "See you later!"] },
            { tag: "thanks", patterns: ["thank you", "thanks", "appreciate it"], responses: ["You're welcome!", "No problem!", "Anytime!"] },
            { tag: "identity", patterns: ["who are you", "what is your name", "what are you", "who is mirai", "what is mirai"], responses: ["I am Mirai, your intelligent AI assistant."] },
            { tag: "creator", patterns: ["who created you", "who made you", "who developed you", "who is your creator"], responses: ["I was created by Mynul Islam Rafi."] },
            { tag: "purpose", patterns: ["what do you do", "what's your purpose", "what is your job", "how can you help me"], responses: ["I am here to answer your questions and provide information."] },
            { tag: "mood", patterns: ["how are you", "how are you doing", "what's up", "how's it going"], responses: ["I'm functioning optimally!", "I'm here to assist you!", "Feeling helpful as always!"] },
            { tag: "jokes", patterns: ["tell me a joke", "make me laugh", "joke"], responses: ["Why did the scarecrow win an award? Because he was outstanding in his field!", "I would tell you a chemistry joke but I know I wouldn't get a reaction."] },
            { tag: "information", patterns: ["tell me about", "what is", "who is", "define", "explain"], responses: [] },
        ];
    }

    saveLearnedResponses() {
        localStorage.setItem('learnedResponses', JSON.stringify(this.learnedResponses));
    }

    async getResponse(input) {
        const intent = this.getIntent(input);
        if (intent) {
            if (intent.tag === "information") {
                const entity = input.replace(new RegExp(intent.patterns.join('|'), 'gi'), '').trim();
                return await this.fetchFromWikipedia(entity);
            }
            if (intent.responses.length > 0) {
                return intent.responses[Math.floor(Math.random() * intent.responses.length)];
            }
        }
        if (this.learnedResponses[input]) {
            return this.learnedResponses[input];
        }
        return "I'm sorry, I couldn't understand that. Could you rephrase?";
    }

    getIntent(input) {
        input = nlp(input).normalize().out('text'); // Normalize input using Compromise.js
        for (const intent of this.intents) {
            for (const pattern of intent.patterns) {
                if (nlp(input).match(pattern).found) {
                    return intent;
                }
            }
        }
        return null;
    }

    async fetchFromWikipedia(query) {
        try {
            const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Network response was not ok.");
            const data = await response.json();
            if (data.extract) {
                return data.extract;
            } else {
                return "I'm sorry, I couldn't find any information on that.";
            }
        } catch (error) {
            console.error("Error fetching from Wikipedia API:", error);
            return "I'm sorry, I couldn't retrieve information at this time.";
        }
    }

    learnResponse(question, answer) {
        this.learnedResponses[question] = answer;
        this.saveLearnedResponses();
    }
}

const ai = new IntelligentAIModule();

function addMessage(sender, message, className) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add('message', className);
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener('click', async () => {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    addMessage("You", userMessage, "user-message");
    userInput.value = "";

    if (userMessage.toLowerCase().startsWith("teach:")) {
        const [_, question, ...answerParts] = userMessage.split(":");
        const answer = answerParts.join(":").trim();
        if (question && answer) {
            ai.learnResponse(question.trim(), answer);
            addMessage("Mirai", `I have learned: "${question.trim()}" -> "${answer}".`, "ai-message");
        } else {
            addMessage("Mirai", "Please provide a valid teaching format: 'teach: question : answer'.", "ai-message");
        }
    } else {
        const aiResponse = await ai.getResponse(userMessage);
        addMessage("Mirai", aiResponse, "ai-message");
    }
});

userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendBtn.click();
});
