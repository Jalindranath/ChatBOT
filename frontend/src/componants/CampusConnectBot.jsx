import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, ChevronDown, Maximize2, Minimize2, User, Clock, Info, Menu as MenuIcon, ArrowLeft, Mic, HelpCircle } from 'lucide-react';
import logo from "../assets/logo.jpeg";
import axios from 'axios';
import { franc } from 'franc';

const CampusConnectBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState([]);
  const [speechLang, setSpeechLang] = useState('en-US');
  const [detectedLang, setDetectedLang] = useState('en-US');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // const API_BASE = 'http://localhost:5000';
  const API_BASE = "https://aichatbotbackend-c3bee3gtbxfjf0bv.centralindia-01.azurewebsites.net";
  const axiosConfig = {
    withCredentials: true
  };

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'hi-IN', name: 'Hindi (India)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'fr-FR', name: 'French (France)' },
    { code: 'de-DE', name: 'German (Germany)' },
  ];

  const languageMap = {
    eng: 'en-US',
    hin: 'hi-IN',
    spa: 'es-ES',
    fra: 'fr-FR',
    deu: 'de-DE',
  };

  const faqs = [
    {
      question: "What courses are offered at Sanjivani College?",
      answer: "Sanjivani College offers a wide range of undergraduate and postgraduate programs including Engineering (B.Tech/M.Tech), Management (BBA/MBA), Computer Applications (BCA/MCA), Pharmacy, and more. Visit our website for the complete list of courses."
    },
    {
      question: "What are the admission requirements?",
      answer: "Admission requirements vary by program. Generally, you need to have completed 10+2 with specified minimum marks in relevant subjects. For engineering, you typically need to qualify through entrance exams like JEE. Please check the specific program requirements on our admissions page."
    },
    {
      question: "What is the fee structure?",
      answer: "Fee structures vary by program. For the 2025-26 academic year, undergraduate programs range from ₹80,000 to ₹1,50,000 per year. Various scholarships and financial aid options are available based on merit and need. Please contact the finance office for detailed information."
    },
    {
      question: "What facilities are available on campus?",
      answer: "Our campus features modern classrooms, well-equipped laboratories, a comprehensive library, sports facilities (indoor and outdoor), cafeteria, Wi-Fi throughout the campus, hostel accommodations, and 24/7 medical services."
    },
    {
      question: "How can I apply for hostel accommodation?",
      answer: "Hostel applications open after admission confirmation. You can apply through the student portal or by contacting the hostel administration office. Rooms are allocated based on availability and distance from hometown."
    },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);

      setTimeout(() => {
        const timestamp = new Date();
        setMessages([{
          text: "Hey I am Sanjivani CampusConnect Bot!",
          sender: "bot",
          timestamp: timestamp.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
          }),
          shortTime: timestamp.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          }),
          dateDisplay: timestamp.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
          })
        }]);

        setTimeout(() => {
          const timestamp = new Date();
          setMessages(prev => [...prev, {
            text: "How can I assist you today? Feel free to ask any questions about our institution or check out our FAQs section.",
            sender: "bot",
            timestamp: timestamp.toLocaleString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
              month: 'numeric',
              day: 'numeric',
              year: 'numeric'
            }),
            shortTime: timestamp.toLocaleString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            }),
            dateDisplay: timestamp.toLocaleDateString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric'
            })
          }]);
          setIsTyping(false);
        }, 2000);
      }, 1000);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (activeTab === "history") {
      const fetchHistory = async () => {
        try {
          const response = await axios.get(`${API_BASE}/history`, axiosConfig);
          setHistory(response.data);
        } catch (error) {
          console.error("Error fetching chat history:", error);
          setHistory([]);
        }
      };
      fetchHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen === false) {
      setIsSidebarOpen(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen && isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const toggleRecording = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use a supported browser like Chrome or Edge.");
      return;
    }

    setIsRecording(!isRecording);

    if (!isRecording) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = speechLang;
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInputValue(transcript);

        const detectedLangCode = franc(transcript, { minLength: 3 });
        const mappedLang = languageMap[detectedLangCode] || 'en-US';
        if (mappedLang !== detectedLang) {
          setDetectedLang(mappedLang);
          setSpeechLang(mappedLang);
          recognition.lang = mappedLang;
          console.log(`Detected language: ${mappedLang}`);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        setMessages(prev => [...prev, {
          text: `Speech recognition error: ${event.error}`,
          sender: "bot",
          timestamp: new Date().toLocaleString('en-US', {
            hour: 'numeric', minute: 'numeric', hour12: true, month: 'numeric', day: 'numeric', year: 'numeric'
          }),
          shortTime: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
          dateDisplay: new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
        }]);
      };

      recognition.onend = () => {
        if (isRecording) {
          recognition.start();
        } else {
          recognitionRef.current = null;
        }
      };

      recognition.start();
      console.log(`Speech recognition started in ${speechLang}`);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      console.log("Speech recognition stopped");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const currentTimestamp = new Date();
    const formattedTimestamp = currentTimestamp.toLocaleString('en-US', {
      hour: 'numeric', minute: 'numeric', hour12: true, month: 'numeric', day: 'numeric', year: 'numeric'
    });
    const shortTimestamp = currentTimestamp.toLocaleString('en-US', {
      hour: 'numeric', minute: 'numeric', hour12: true
    });
    const dateDisplay = currentTimestamp.toLocaleDateString('en-US', {
      month: 'numeric', day: 'numeric', year: 'numeric'
    });

    const userMessage = {
      text: inputValue,
      sender: "user",
      timestamp: formattedTimestamp,
      shortTime: shortTimestamp, // Fixed typo: shortTimestampRecognition to shortTimestamp
      dateDisplay: dateDisplay
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }

    setIsTyping(true);

    try {
      const response = await axios.post(
        `${API_BASE}/get_response`,
        { user_input: inputValue },
        axiosConfig
      );

      const botTimestamp = new Date();
      const botFormattedTimestamp = botTimestamp.toLocaleString('en-US', {
        hour: 'numeric', minute: 'numeric', hour12: true, month: 'numeric', day: 'numeric', year: 'numeric'
      });
      const botShortTime = botTimestamp.toLocaleString('en-US', {
        hour: 'numeric', minute: 'numeric', hour12: true
      });
      const botDateDisplay = botTimestamp.toLocaleDateString('en-US', {
        month: 'numeric', day: 'numeric', year: 'numeric'
      });

      setMessages(prev => [...prev, {
        text: response.data.response,
        sender: "bot",
        timestamp: botFormattedTimestamp,
        shortTime: botShortTime,
        dateDisplay: botDateDisplay
      }]);
    } catch (error) {
      console.error("API error:", error.response?.data || error.message);
      const errorTimestamp = new Date();
      const errorFormattedTimestamp = errorTimestamp.toLocaleString('en-US', {
        hour: 'numeric', minute: 'numeric', hour12: true, month: 'numeric', day: 'numeric', year: 'numeric'
      });
      const errorShortTime = errorTimestamp.toLocaleString('en-US', {
        hour: 'numeric', minute: 'numeric', hour12: true
      });
      const errorDateDisplay = errorTimestamp.toLocaleDateString('en-US', {
        month: 'numeric', day: 'numeric', year: 'numeric'
      });

      setMessages(prev => [...prev, {
        text: error.response?.data?.response || "Sorry, something went wrong. Please try again later.",
        sender: "bot",
        timestamp: errorFormattedTimestamp,
        shortTime: errorShortTime,
        dateDisplay: errorDateDisplay
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFaqSelect = async (faq) => {
    const currentTimestamp = new Date();
    const formattedTimestamp = currentTimestamp.toLocaleString('en-US', {
      hour: 'numeric', minute: 'numeric', hour12: true, month: 'numeric', day: 'numeric', year: 'numeric'
    });
    const shortTimestamp = currentTimestamp.toLocaleString('en-US', {
      hour: 'numeric', minute: 'numeric', hour12: true
    });
    const dateDisplay = currentTimestamp.toLocaleDateString('en-US', {
      month: 'numeric', day: 'numeric', year: 'numeric'
    });

    const newMessages = [...messages, {
      text: faq.question,
      sender: "user",
      timestamp: formattedTimestamp,
      shortTime: shortTimestamp,
      dateDisplay: dateDisplay
    }];

    setMessages(newMessages);
    setIsTyping(true);
    setActiveTab("chat");

    try {
      const response = await axios.post(
        `${API_BASE}/get_response`,
        { user_input: faq.question },
        axiosConfig
      );

      const botTimestamp = new Date();
      const botFormattedTimestamp = botTimestamp.toLocaleString('en-US', {
        hour: 'numeric', minute: 'numeric', hour12: true, month: 'numeric', day: 'numeric', year: 'numeric'
      });
      const botShortTime = botTimestamp.toLocaleString('en-US', {
        hour: 'numeric', minute: 'numeric', hour12: true
      });
      const botDateDisplay = botTimestamp.toLocaleDateString('en-US', {
        month: 'numeric', day: 'numeric', year: 'numeric'
      });

      setMessages([...newMessages, {
        text: response.data.response,
        sender: "bot",
        timestamp: botFormattedTimestamp,
        shortTime: botShortTime,
        dateDisplay: botDateDisplay
      }]);
    } catch (error) {
      console.error("API error for FAQ:", error.response?.data || error.message);
      const errorTimestamp = new Date();
      const errorFormattedTimestamp = errorTimestamp.toLocaleString('en-US', {
        hour: 'numeric', minute: 'numeric', hour12: true, month: 'numeric', day: 'numeric', year: 'numeric'
      });
      const errorShortTime = errorTimestamp.toLocaleString('en-US', {
        hour: 'numeric', minute: 'numeric', hour12: true
      });
      const errorDateDisplay = errorTimestamp.toLocaleDateString('en-US', {
        month: 'numeric', day: 'numeric', year: 'numeric'
      });

      setMessages([...newMessages, {
        text: error.response?.data?.response || "Sorry, something went wrong with the FAQ response.",
        sender: "bot",
        timestamp: errorFormattedTimestamp,
        shortTime: errorShortTime,
        dateDisplay: errorDateDisplay
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "history":
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Conversation History</h2>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-gray-500">No conversation history available.</p>
              ) : (
                history.map((entry, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
                  >
                    <p className="font-medium">User: {entry.user}</p>
                    <p className="text-sm text-gray-600">Bot: {entry.bot}</p>
                    <p className="text-sm text-gray-500">{new Date(entry.timestamp).toLocaleString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true
                    })}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case "about":
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">About CampusConnect Bot</h2>
            <p className="mb-3">CampusConnect Bot is your virtual assistant for all campus-related information.</p>
            <p className="mb-3">Our AI-powered bot can help with:</p>
            <ul className="list-disc pl-5 mb-3 space-y-1">
              <li>Admission inquiries</li>
              <li>Course information</li>
              <li>Fee structure details</li>
              <li>Campus facilities</li>
              <li>Event schedules</li>
              <li>Faculty information</li>
            </ul>
            <p>Version 2.1.0</p>
          </div>
        );
      case "faqs":
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 font-medium flex justify-between items-center"
                    onClick={() => handleFaqSelect(faq)}
                  >
                    <span className="flex-1 pr-2">{faq.question}</span>
                    <span className="text-blue-600 ml-2 flex-shrink-0">Ask →</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className="bg-white p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Chat with the CampusConnect Bot</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-white">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-6 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                        <img src={logo} alt="Bot Avatar" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  <div className={`max-w-md ${message.sender === 'user' ? 'order-1' : 'order-2'}`}>
                    <div
                      className={`px-4 py-3 rounded-lg ${message.sender === 'user'
                          ? 'bg-blue-100 text-gray-800 rounded-br-none'
                          : 'bg-blue-500 text-white rounded-bl-none'
                        }`}
                    >
                      {message.text}
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {message.shortTime} • {message.dateDisplay}
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <div className="flex-shrink-0 ml-3 order-2">
                      <div className="bg-gray-200 rounded-full p-2 flex items-center justify-center">
                        <User size={16} className="text-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="mb-6 flex justify-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                      <img src={logo} alt="Bot Avatar" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="max-w-md order-2">
                    <div className="px-4 py-3 rounded-lg bg-blue-500 text-white rounded-bl-none flex items-center">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={isMobile ? "Type message..." : "Type or speak your message..."}
                className="flex-1 border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={toggleRecording}
                className={`${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-200 hover:bg-gray-300'} text-${isRecording ? 'white' : 'gray-700'} rounded-lg p-3`}
              >
                <Mic size={20} />
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3"
              >
                <Send size={20} />
              </button>
            </form>
          </>
        );
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes typingAnimation {
          0% { opacity: 0.3; transform: translateY(0px); }
          50% { opacity: 1; transform: translateY(-2px); }
          100% { opacity: 0.3; transform: translateY(0px); }
        }
        .typing-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: white;
          margin: 0 2px;
          animation: typingAnimation 1s infinite ease-in-out;
        }
        .typing-dot:nth-child(1) {
          animation-delay: 0s;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
      `}</style>

      <div className={`fixed z-50 ${isFullScreen ? 'inset-0' : 'bottom-4 right-4'}`}>
        {!isOpen && (
          <button
            onClick={toggleChat}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-all duration-200"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <img src={logo} alt="Bot Avatar" className="w-full h-full object-cover" />
            </div>
          </button>
        )}
        {isOpen && (
          <div
            className={`flex bg-gray-50 rounded-lg shadow-xl overflow-hidden transition-all duration-300 ${isFullScreen
                ? 'w-full h-full'
                : isMobile ? 'w-full h-full mx-4 my-4' : 'w-96 h-128 border border-gray-200'
              }`}
          >
            {isMobile && isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-10"
                onClick={() => setIsSidebarOpen(false)}
              ></div>
            )}
            <div
              className={`bg-gray-800 flex flex-col text-white transition-all duration-300 z-20 ${isFullScreen || isMobile
                  ? isSidebarOpen
                    ? isMobile
                      ? 'absolute inset-y-0 left-0 w-4/5 max-w-xs'
                      : 'w-64'
                    : isMobile
                      ? 'absolute inset-y-0 left-0 w-0 overflow-hidden'
                      : 'w-0 overflow-hidden'
                  : 'hidden'
                }`}
            >
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-medium">Menu</h3>
                {isMobile && (
                  <button
                    onClick={toggleSidebar}
                    className="p-1 rounded hover:bg-gray-700"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              <div className="flex flex-col flex-1">
                <button
                  onClick={() => handleTabSelect("chat")}
                  className={`flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${activeTab === 'chat' ? 'bg-gray-700' : ''}`}
                >
                  <MessageSquare size={18} className="mr-3" />
                  <span>Chatbot</span>
                </button>
                <button
                  onClick={() => handleTabSelect("faqs")}
                  className={`flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${activeTab === 'faqs' ? 'bg-gray-700' : ''}`}
                >
                  <HelpCircle size={18} className="mr-3" />
                  <span>FAQs</span>
                </button>
                <button
                  onClick={() => handleTabSelect("history")}
                  className={`flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${activeTab === 'history' ? 'bg-gray-700' : ''}`}
                >
                  <Clock size={18} className="mr-3" />
                  <span>Conversation History</span>
                </button>
                <button
                  onClick={() => handleTabSelect("about")}
                  className={`flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${activeTab === 'about' ? 'bg-gray-700' : ''}`}
                >
                  <Info size={18} className="mr-3" />
                  <span>About Us</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <div className="flex items-center">
                  {activeTab !== "chat" && isMobile ? (
                    <button
                      onClick={() => setActiveTab("chat")}
                      className="p-1 mr-3 hover:bg-gray-700 rounded transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                  ) : (
                    (isFullScreen || isMobile) && (
                      <button
                        onClick={toggleSidebar}
                        className="p-1 mr-3 hover:bg-gray-700 rounded transition-colors"
                      >
                        <MenuIcon size={20} />
                      </button>
                    )
                  )}
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                    <img src={logo} alt="Bot Avatar" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-medium text-lg md:text-xl">CampusConnect Bot</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleFullScreen}
                    className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                    aria-label={isFullScreen ? "Exit full screen" : "Full screen"}
                  >
                    {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                  {!isMobile && (
                    <button
                      onClick={toggleChat}
                      className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <ChevronDown size={18} />
                    </button>
                  )}
                  <button
                    onClick={toggleChat}
                    className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                {renderTabContent()}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CampusConnectBot;