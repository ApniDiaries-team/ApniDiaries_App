// src/mock/posts.mock.js
export const MOCK_POSTS = Array.from({ length: 24 }).map((_, i) => ({
  id: i + 1,
  content: 'Planning a trip soon. Looking for travel buddies and local tips. Let me know if anyone is interested!',
  createdAt: `${i + 1}h ago`,
  likes: Math.floor(Math.random() * 10),
  comments: Math.floor(Math.random() * 5),
  city: ['Mumbai', 'Delhi', 'Bangalore', 'Jaipur', 'Kolkata', 'Goa'][i % 6],
  user: {
    name: ['AB', 'Hugo Walsid', 'Tusher Pandey', 'Mehika Raf', 'Robbie'][i % 5],
    avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
  },
}))
