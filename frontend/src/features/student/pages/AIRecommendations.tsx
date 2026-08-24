import { useState } from 'react'
import { askAITutor, ChatMessage } from '@/api/ai.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Bot, Send, Sparkles, User, Loader2 } from 'lucide-react'

export function AIRecommendations() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your Alma AI Tutor & Academic Assistant. How can I help you with your courses, study concepts, or assignment preparation today?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState('CSE101')

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: ChatMessage = { role: 'user', content: input.trim() }
    const updatedHistory = [...messages, userMsg]
    setMessages(updatedHistory)
    setInput('')
    setLoading(true)

    try {
      const res = await askAITutor(userMsg.content, selectedCourse, updatedHistory)
      const aiReply = res.data?.reply || 'I am processing your query. Please review your course materials.'
      setMessages([...updatedHistory, { role: 'assistant', content: aiReply }])
    } catch (err) {
      setMessages([
        ...updatedHistory,
        { role: 'assistant', content: 'Apologies, I encountered an issue connecting to the AI tutor service.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader label="Smart Learning" title="Alma AI Academic Tutor" />

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Interactive Chat Panel */}
        <Card className="p-0 flex flex-col h-[600px] overflow-hidden border border-gray-200">
          {/* Header Bar */}
          <div className="p-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/30 rounded-lg backdrop-blur-sm">
                <Bot className="w-5 h-5 text-indigo-200" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Alma AI Assistant</h3>
                <p className="text-xs text-indigo-200">Powered by Groq LLM</p>
              </div>
            </div>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-indigo-950/80 border border-indigo-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="CSE101">CSE101 - Programming</option>
              <option value="CSE102">CSE102 - Data Structures</option>
              <option value="MAT101">MAT101 - Calculus</option>
              <option value="General">General Inquiries</option>
            </select>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 text-sm text-indigo-600 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Alma AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your course, code, or exams..."
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </Card>

        {/* Sidebar Prompts */}
        <div className="space-y-4">
          <Card className="p-5 border border-indigo-100 bg-indigo-50/50">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Suggested Queries
            </div>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => setInput('Explain recursion in data structures with a simple example')}
                className="w-full text-left p-2.5 bg-white hover:bg-indigo-100 text-gray-800 rounded-lg border border-indigo-100 transition-colors"
              >
                💡 Explain recursion with an example
              </button>
              <button
                onClick={() => setInput('What are the key concepts I should study for my upcoming calculus midterm?')}
                className="w-full text-left p-2.5 bg-white hover:bg-indigo-100 text-gray-800 rounded-lg border border-indigo-100 transition-colors"
              >
                📚 Study tips for calculus midterm
              </button>
              <button
                onClick={() => setInput('How do I structure a proper Python class with inheritance?')}
                className="w-full text-left p-2.5 bg-white hover:bg-indigo-100 text-gray-800 rounded-lg border border-indigo-100 transition-colors"
              >
                🐍 Python class inheritance tutorial
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
