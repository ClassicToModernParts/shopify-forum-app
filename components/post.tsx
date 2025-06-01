"use client"

interface PostProps {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  category?: string
  replies?: number
  className?: string
  onClick?: () => void
}

export function Post({
  id,
  title,
  content,
  author,
  createdAt,
  category,
  replies = 0,
  className = "",
  onClick,
}: PostProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{title}</h3>
        {category && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2 flex-shrink-0">
            {category}
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{content}</p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>By {author}</span>
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>

        {replies > 0 && (
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {replies} {replies === 1 ? "reply" : "replies"}
          </span>
        )}
      </div>
    </div>
  )
}
