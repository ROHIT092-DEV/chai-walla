'use client';

import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { Star, MessageCircle, ThumbsUp, ThumbsDown, Coffee, Plus, Image, Video, Send, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface Post {
  _id: string;
  userId: string;
  content: string;
  image?: string;
  video?: string;
  likes: string[];
  dislikes: string[];
  comments: Array<{
    _id: string;
    userId: string;
    comment: string;
    createdAt: string;
  }>;
  createdAt: string;
  user: Array<{ email: string }>;
}

export default function CommunityPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', image: '', video: '' });
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [expandedComments, setExpandedComments] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
        if (file.type.startsWith('image/')) {
          setNewPost({ ...newPost, image: reader.result as string, video: '' });
        } else if (file.type.startsWith('video/')) {
          setNewPost({ ...newPost, video: reader.result as string, image: '' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const createPost = async () => {
    if (!user || !newPost.content.trim()) return;
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      
      if (response.ok) {
        setNewPost({ content: '', image: '', video: '' });
        setSelectedFile(null);
        setFilePreview('');
        setShowCreatePost(false);
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleReaction = async (postId: string, reaction: 'like' | 'dislike') => {
    if (!user) return;
    
    try {
      await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reaction })
      });
      fetchPosts();
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const addComment = async (postId: string) => {
    if (!user || !commentInputs[postId]?.trim()) return;
    
    try {
      await fetch('/api/posts/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, comment: commentInputs[postId] })
      });
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 pb-20 lg:pt-20 lg:pb-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16 pb-20 lg:pt-20 lg:pb-6">
        <div className="max-w-4xl mx-auto px-3 lg:px-4 py-4 lg:py-8">
          <div className="text-center mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-3 lg:mb-4">
              Tea Community
            </h1>
            <p className="text-base lg:text-xl text-gray-600 max-w-2xl mx-auto mb-4 lg:mb-6 px-4">
              Share your tea moments and connect with fellow tea enthusiasts
            </p>
            
            {user && (
              <button
                onClick={() => setShowCreatePost(!showCreatePost)}
                className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl font-bold text-sm lg:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 lg:w-5 h-4 lg:h-5" />
                <span>Share Your Tea Story</span>
              </button>
            )}
          </div>
          
          {/* Create Post Form */}
          {showCreatePost && user && (
            <motion.div
              className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 p-4 lg:p-6 mb-6 lg:mb-8 mx-2 lg:mx-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm lg:text-lg">
                    {user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share your tea experience..."
                    className="w-full p-3 lg:p-4 border border-gray-200 rounded-lg lg:rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm lg:text-base"
                    rows={3}
                  />
                  
                  {filePreview && (
                    <div className="mt-3 relative">
                      {selectedFile?.type.startsWith('image/') ? (
                        <img src={filePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
                      ) : (
                        <video src={filePreview} className="w-full max-h-48 rounded-lg" controls />
                      )}
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setFilePreview('');
                          setNewPost({ ...newPost, image: '', video: '' });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mt-3 lg:mt-4 space-y-3 lg:space-y-0">
                    <div className="flex items-center space-x-2 lg:space-x-4">
                      <label className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg cursor-pointer transition-colors">
                        <Image className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      
                      <label className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg cursor-pointer transition-colors">
                        <Video className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Video</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <button
                        onClick={() => {
                          setShowCreatePost(false);
                          setSelectedFile(null);
                          setFilePreview('');
                          setNewPost({ content: '', image: '', video: '' });
                        }}
                        className="px-3 lg:px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createPost}
                        disabled={!newPost.content.trim()}
                        className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white px-4 lg:px-6 py-2 rounded-lg lg:rounded-xl font-medium text-sm lg:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Post</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Posts Yet
              </h3>
              <p className="text-gray-600">
                Be the first to share your tea story!
              </p>
            </div>
          ) : (
            <div className="space-y-4 lg:space-y-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 mx-2 lg:mx-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="p-4 lg:p-6">
                    <div className="flex items-start space-x-3 lg:space-x-4 mb-3 lg:mb-4">
                      <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm lg:text-lg">
                          {post.user[0]?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm lg:text-base truncate">
                          {post.user[0]?.email?.split('@')[0] || 'Anonymous'}
                        </h4>
                        <span className="text-xs lg:text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed mb-3 lg:mb-4 text-sm lg:text-base">
                      {post.content}
                    </p>
                    
                    {post.image && (
                      <div className="mb-3 lg:mb-4">
                        <img
                          src={post.image}
                          alt="Post image"
                          className="w-full max-h-64 lg:max-h-96 object-cover rounded-lg lg:rounded-xl"
                        />
                      </div>
                    )}
                    
                    {post.video && (
                      <div className="mb-3 lg:mb-4">
                        <video
                          src={post.video}
                          controls
                          className="w-full max-h-64 lg:max-h-96 rounded-lg lg:rounded-xl"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 lg:pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 lg:space-x-6">
                        <button
                          onClick={() => handleReaction(post._id, 'like')}
                          className={`flex items-center space-x-1.5 lg:space-x-2 transition-colors ${
                            post.likes.includes(user?.id || '') 
                              ? 'text-blue-600' 
                              : 'text-gray-500 hover:text-blue-600'
                          }`}
                        >
                          <ThumbsUp className={`w-4 lg:w-5 h-4 lg:h-5 ${
                            post.likes.includes(user?.id || '') ? 'fill-current' : ''
                          }`} />
                          <span className="font-medium text-sm lg:text-base">{post.likes.length}</span>
                        </button>
                        
                        <button
                          onClick={() => handleReaction(post._id, 'dislike')}
                          className={`flex items-center space-x-1.5 lg:space-x-2 transition-colors ${
                            (post.dislikes || []).includes(user?.id || '') 
                              ? 'text-red-600' 
                              : 'text-gray-500 hover:text-red-600'
                          }`}
                        >
                          <ThumbsDown className={`w-4 lg:w-5 h-4 lg:h-5 ${
                            (post.dislikes || []).includes(user?.id || '') ? 'fill-current' : ''
                          }`} />
                          <span className="font-medium text-sm lg:text-base">{(post.dislikes || []).length}</span>
                        </button>
                        
                        <div className="flex items-center space-x-1.5 lg:space-x-2 text-gray-500">
                          <MessageCircle className="w-4 lg:w-5 h-4 lg:h-5" />
                          <span className="font-medium text-sm lg:text-base">{post.comments.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Comments */}
                    {post.comments.length > 0 && (
                      <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-100 space-y-2 lg:space-y-3">
                        {(expandedComments[post._id] ? post.comments : post.comments.slice(0, 2)).map((comment) => (
                          <div key={comment._id} className="flex items-start space-x-2 lg:space-x-3">
                            <div className="w-7 lg:w-8 h-7 lg:h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xs lg:text-sm">
                                {comment.userId?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 bg-gray-50 rounded-lg px-3 py-2">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-xs lg:text-sm text-gray-900">
                                  User
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs lg:text-sm text-gray-700 break-words">{comment.comment}</p>
                            </div>
                          </div>
                        ))}
                        
                        {post.comments.length > 2 && (
                          <button
                            onClick={() => setExpandedComments({ ...expandedComments, [post._id]: !expandedComments[post._id] })}
                            className="text-gray-500 hover:text-gray-700 text-sm font-medium ml-10 lg:ml-11"
                          >
                            {expandedComments[post._id] 
                              ? 'View less' 
                              : `View ${post.comments.length - 2} more comments`
                            }
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Add Comment */}
                    {user && (
                      <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-100">
                        <div className="flex items-start space-x-2 lg:space-x-3">
                          <div className="w-8 lg:w-9 h-8 lg:h-9 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs lg:text-sm">
                              {user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 flex items-center space-x-2">
                            <input
                              type="text"
                              value={commentInputs[post._id] || ''}
                              onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                              placeholder="Write a comment..."
                              className="flex-1 px-3 lg:px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
                              onKeyPress={(e) => e.key === 'Enter' && addComment(post._id)}
                            />
                            <button
                              onClick={() => addComment(post._id)}
                              disabled={!commentInputs[post._id]?.trim()}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-full transition-all duration-300 flex-shrink-0"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}