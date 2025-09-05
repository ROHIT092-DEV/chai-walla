'use client';

import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { useEffect, useState } from 'react';
import { Star, MessageCircle, Coffee, Plus, Image, Video, Send, Heart, Smile, MoreVertical, Trash2, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

interface Post {
  _id: string;
  userId: string;
  content: string;
  image?: string;
  video?: string;
  likes: string[];
  reactions: { [emoji: string]: string[] };
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
  const [userRole, setUserRole] = useState<string>('user');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', image: '', video: '' });
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [expandedComments, setExpandedComments] = useState<{[key: string]: boolean}>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState<{[key: string]: boolean}>({});
  const [showLikesModal, setShowLikesModal] = useState<{[key: string]: boolean}>({});
  const [isPosting, setIsPosting] = useState(false);
  const [likingPosts, setLikingPosts] = useState<{[key: string]: boolean}>({});
  const [reactingPosts, setReactingPosts] = useState<{[key: string]: boolean}>({});
  const [commentingPosts, setCommentingPosts] = useState<{[key: string]: boolean}>({});
  const [showPostMenu, setShowPostMenu] = useState<{[key: string]: boolean}>({});
  const [deletingPosts, setDeletingPosts] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user/role');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role || 'user');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.likes-modal')) {
        setShowLikesModal({});
      }
      if (!(event.target as Element).closest('.emoji-picker')) {
        setShowEmojiPicker({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.post-menu')) {
        setShowPostMenu({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts?limit=5'); // Load only 5 posts initially
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
      // File size limit: 5MB for images, 10MB for videos
      const maxSize = file.type.startsWith('video/') ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File too large. Max size: ${file.type.startsWith('video/') ? '10MB' : '5MB'}`);
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setFilePreview(result);
        
        if (file.type.startsWith('image/')) {
          // Compress image
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            
            // Resize if too large
            const maxWidth = 800;
            const maxHeight = 600;
            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width *= ratio;
              height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            setNewPost({ ...newPost, image: compressed, video: '' });
          };
          img.src = result;
        } else if (file.type.startsWith('video/')) {
          setNewPost({ ...newPost, video: result, image: '' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const createPost = async () => {
    if (!user || !newPost.content.trim() || isPosting) return;
    
    setIsPosting(true);
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
    } finally {
      setIsPosting(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user || likingPosts[postId]) return;
    
    setLikingPosts({ ...likingPosts, [postId]: true });
    try {
      await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikingPosts({ ...likingPosts, [postId]: false });
    }
  };

  const addReaction = async (postId: string, emoji: string) => {
    if (!user || reactingPosts[postId]) return;
    
    setReactingPosts({ ...reactingPosts, [postId]: true });
    try {
      await fetch('/api/posts/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, emoji })
      });
      setShowEmojiPicker({ ...showEmojiPicker, [postId]: false });
      fetchPosts();
    } catch (error) {
      console.error('Error adding reaction:', error);
    } finally {
      setReactingPosts({ ...reactingPosts, [postId]: false });
    }
  };

  const addComment = async (postId: string) => {
    if (!user || !commentInputs[postId]?.trim() || commentingPosts[postId]) return;
    
    setCommentingPosts({ ...commentingPosts, [postId]: true });
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
    } finally {
      setCommentingPosts({ ...commentingPosts, [postId]: false });
    }
  };

  const deletePost = async (postId: string) => {
    if (deletingPosts[postId]) return;
    
    setDeletingPosts({ ...deletingPosts, [postId]: true });
    try {
      const response = await fetch('/api/posts/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      
      if (response.ok) {
        fetchPosts();
        setShowPostMenu({ ...showPostMenu, [postId]: false });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setDeletingPosts({ ...deletingPosts, [postId]: false });
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
    return <Loading />;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-16 pb-20 lg:pt-20 lg:pb-6">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-light mb-4">
              Community
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8 font-light">
              Share your tea moments and connect with fellow enthusiasts
            </p>
            
            {user && (
              <button
                onClick={() => setShowCreatePost(!showCreatePost)}
                className="bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>CREATE POST</span>
              </button>
            )}
          </div>
          
          {/* Create Post Form */}
          {showCreatePost && user && (
            <motion.div
              className="border border-gray-200 p-6 mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-sm">
                    {user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share your tea experience"
                    className="w-full p-4 border border-gray-200 resize-none focus:outline-none focus:border-black transition-colors"
                    rows={4}
                  />
                  
                  {filePreview && (
                    <div className="mt-4 relative">
                      {selectedFile?.type.startsWith('image/') ? (
                        <img src={filePreview} alt="Preview" className="w-full max-h-64 object-cover" loading="lazy" />
                      ) : (
                        <video src={filePreview} className="w-full max-h-64" controls preload="metadata" />
                      )}
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setFilePreview('');
                          setNewPost({ ...newPost, image: '', video: '' });
                        }}
                        className="absolute top-2 right-2 bg-black text-white w-6 h-6 flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 text-sm text-gray-500 hover:text-black cursor-pointer transition-colors">
                        <Image className="w-4 h-4" />
                        <span>PHOTO</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      
                      <label className="flex items-center space-x-2 text-sm text-gray-500 hover:text-black cursor-pointer transition-colors">
                        <Video className="w-4 h-4" />
                        <span>VIDEO</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setShowCreatePost(false);
                          setSelectedFile(null);
                          setFilePreview('');
                          setNewPost({ content: '', image: '', video: '' });
                        }}
                        className="text-sm text-gray-500 hover:text-black transition-colors"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={createPost}
                        disabled={!newPost.content.trim() || isPosting}
                        className="bg-black text-white px-6 py-2 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isPosting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>{isPosting ? 'POSTING...' : 'POST'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-light mb-3">
                No Posts Yet
              </h3>
              <p className="text-gray-500">
                Be the first to share your tea story
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  className="border-b border-gray-100 pb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-sm">
                          {post.user[0]?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-black">
                          {post.user[0]?.email?.split('@')[0] || 'Anonymous'}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Admin controls */}
                      {userRole === 'admin' && (
                        <div className="relative">
                          <button
                            onClick={() => setShowPostMenu({ ...showPostMenu, [post._id]: !showPostMenu[post._id] })}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                          
                          {showPostMenu[post._id] && (
                            <div className="post-menu absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-30 w-32">
                              <button
                                onClick={() => deletePost(post._id)}
                                disabled={deletingPosts[post._id]}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                              >
                                {deletingPosts[post._id] ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                                <span>{deletingPosts[post._id] ? 'Deleting...' : 'Delete'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed mb-3 lg:mb-4 text-sm lg:text-base">
                      {post.content}
                    </p>
                    
                    {post.image && (
                      <div className="mb-3 lg:mb-4">
                        <img
                          src={post.image}
                          alt="Post image"
                          loading="lazy"
                          className="w-full max-h-64 lg:max-h-96 object-cover rounded-lg lg:rounded-xl"
                        />
                      </div>
                    )}
                    
                    {post.video && (
                      <div className="mb-3 lg:mb-4">
                        <video
                          src={post.video}
                          controls
                          preload="metadata"
                          className="w-full max-h-64 lg:max-h-96 rounded-lg lg:rounded-xl"
                        />
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-3 lg:pt-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <button
                            onClick={() => toggleLike(post._id)}
                            disabled={likingPosts[post._id]}
                            className="relative transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                          >
                            {likingPosts[post._id] ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                            ) : (
                              <Heart className={`w-6 h-6 ${
                                post.likes.includes(user?.id || '') 
                                  ? 'text-red-500 fill-current' 
                                  : 'text-gray-900 hover:text-gray-600'
                              }`} />
                            )}
                            {post.likes.length > 0 && (
                              <span 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowLikesModal({ ...showLikesModal, [post._id]: !showLikesModal[post._id] });
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold cursor-pointer hover:bg-red-600"
                              >
                                {post.likes.length > 99 ? '99+' : post.likes.length}
                              </span>
                            )}
                          </button>
                          
                          {/* Likes modal */}
                          {showLikesModal[post._id] && (
                            <div className="likes-modal absolute top-8 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-48 max-h-40 overflow-y-auto">
                              <div className="p-3">
                                <h4 className="font-semibold text-sm text-gray-900 mb-2">Liked by</h4>
                                <div className="space-y-2">
                                  {post.likes.map((likeUserId, index) => (
                                    <div key={likeUserId} className="flex items-center space-x-2">
                                      <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-xs">
                                          {index + 1}
                                        </span>
                                      </div>
                                      <span className="text-sm text-gray-700 truncate">
                                        User {index + 1}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <button className="relative transition-transform hover:scale-110 active:scale-95">
                          <MessageCircle className="w-6 h-6 text-gray-900 hover:text-gray-600" />
                          {post.comments.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {post.comments.length > 99 ? '99+' : post.comments.length}
                            </span>
                          )}
                        </button>
                        
                        <div className="relative group">
                          <button
                            onClick={() => setShowEmojiPicker({ ...showEmojiPicker, [post._id]: !showEmojiPicker[post._id] })}
                            disabled={reactingPosts[post._id]}
                            className="relative transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                          >
                            {reactingPosts[post._id] ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                            ) : (
                              <Smile className="w-6 h-6 text-gray-900 hover:text-yellow-600" />
                            )}
                            {Object.values(post.reactions || {}).flat().length > 0 && (
                              <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                {Object.values(post.reactions || {}).flat().length}
                              </span>
                            )}
                          </button>
                          
                          {/* Hover tooltip showing user's reaction */}
                          {(() => {
                            const userReaction = Object.entries(post.reactions || {}).find(([emoji, users]) => 
                              users.includes(user?.id || '')
                            );
                            return userReaction && (
                              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                You reacted with {userReaction[0]}
                              </div>
                            );
                          })()}
                          
                          {showEmojiPicker[post._id] && (
                            <div className="emoji-picker absolute top-8 left-0 bg-white border border-gray-200 rounded-lg p-2 shadow-lg z-10 flex space-x-1">
                              {['😍', '😂', '😮', '😢', '😡', '👍'].map((emoji) => {
                                const isSelected = Object.entries(post.reactions || {}).some(([e, users]) => 
                                  e === emoji && users.includes(user?.id || '')
                                );
                                return (
                                  <button
                                    key={emoji}
                                    onClick={() => addReaction(post._id, emoji)}
                                    className={`text-xl hover:scale-125 transition-transform p-1 rounded ${
                                      isSelected 
                                        ? 'bg-yellow-200 ring-2 ring-yellow-400' 
                                        : 'hover:bg-gray-100'
                                    }`}
                                  >
                                    {emoji}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      

                    </div>
                    
                    {/* Reactions display */}
                    {post.reactions && Object.keys(post.reactions).length > 0 && (
                      <div className="flex items-center space-x-2 mt-2">
                        {Object.entries(post.reactions).map(([emoji, users]) => (
                          <div key={emoji} className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-1">
                            <span>{emoji}</span>
                            <span className="text-xs text-gray-600">{users.length}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    

                    
                    {/* Comments */}
                    {post.comments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {post.comments.length > 2 && !expandedComments[post._id] && (
                          <button
                            onClick={() => setExpandedComments({ ...expandedComments, [post._id]: true })}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                          >
                            View all {post.comments.length} comments
                          </button>
                        )}
                        
                        {(expandedComments[post._id] ? post.comments : post.comments.slice(-2)).map((comment) => (
                          <div key={comment._id} className="text-sm">
                            <span className="font-semibold text-gray-900 mr-2">user</span>
                            <span className="text-gray-900">{comment.comment}</span>
                          </div>
                        ))}
                        
                        {expandedComments[post._id] && post.comments.length > 2 && (
                          <button
                            onClick={() => setExpandedComments({ ...expandedComments, [post._id]: false })}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                          >
                            Hide comments
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Time ago */}
                    <div className="mt-1">
                      <span className="text-xs text-gray-500 uppercase">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Add Comment - Instagram style */}
                    {user && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={commentInputs[post._id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                            placeholder="Add a comment..."
                            className="flex-1 text-sm border-none outline-none bg-transparent placeholder-gray-500"
                            onKeyPress={(e) => e.key === 'Enter' && addComment(post._id)}
                          />
                          {commentInputs[post._id]?.trim() && (
                            <button
                              onClick={() => addComment(post._id)}
                              disabled={commentingPosts[post._id]}
                              className="text-blue-500 hover:text-blue-700 font-semibold text-sm disabled:opacity-50 flex items-center space-x-1"
                            >
                              {commentingPosts[post._id] && (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                              )}
                              <span>{commentingPosts[post._id] ? 'Posting...' : 'Post'}</span>
                            </button>
                          )}
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