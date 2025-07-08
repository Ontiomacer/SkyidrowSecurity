import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PublishNews: React.FC = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    setTitle('');
    setAuthor('');
    setCategory('');
    setContent('');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-900 text-white py-6">
        <div className="container mx-auto flex flex-col items-center justify-center">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Publish Cyber Security News</h1>
          <button
            className="mt-2 px-4 py-2 bg-blue-700 rounded text-white font-bold hover:bg-blue-800"
            onClick={() => navigate(-1)}
          >
            ← Back to News
          </button>
        </div>
      </header>
      <main className="container mx-auto py-8">
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-gray-100 rounded-lg shadow-lg p-8 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="px-4 py-2 rounded border border-blue-300 focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Author"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            className="px-4 py-2 rounded border border-blue-300 focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-4 py-2 rounded border border-blue-300 focus:outline-none"
            required
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="px-4 py-2 rounded border border-blue-300 focus:outline-none min-h-[120px]"
            required
          />
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded transition"
          >
            Publish News
          </button>
          {submitted && <div className="text-green-600 font-semibold">News published successfully!</div>}
        </form>
      </main>
    </div>
  );
};

export default PublishNews;
