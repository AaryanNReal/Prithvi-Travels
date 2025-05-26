'use client';
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, getDocs, doc, setDoc, serverTimestamp, query, orderBy, where, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { FirebaseFileUploader } from '@/components/FirebaseFileUploader';

interface Ticket {
  id: string;
  helpdeskID: string;
  category: string;
  status: 'opened' | 'resolved' | 'reopened' | 'closed' | 'pendingclosure';
  createdAt: any;
  resolvedAt?: any;
  updatedAt?: any;
  responses: {
    opened: {
      response: string;
      attachmentURL?: string;
      createdAt: any;
    };
    resolved?: {
      response: string;
      attachmentURL?: string;
      createdAt: any;
    };
    reopened?: {
      response: string;
      attachmentURL?: string;
      createdAt: any;
    };
    closed?: {
      response: string;
      attachmentURL?: string;
      createdAt: any;
    };
  };
  userDetails: {
    name: string;
    email: string;
    phone: string;
    uid: string;
    userID: string;
  };
}

const HelpDeskPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState({
    initial: true,
    refresh: false,
    submit: false,
    reopen: false,
  });
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [reopenAttachmentUrl, setReopenAttachmentUrl] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{
    success: { show: boolean; message: string };
    error: { show: boolean; message: string };
  }>({
    success: { show: false, message: '' },
    error: { show: false, message: '' },
  });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenMessage, setReopenMessage] = useState('');
  const router = useRouter();

  const [form, setForm] = useState({
    category: 'Account Related',
    description: '',
    errors: {
      category: '',
      description: '',
      form: '',
    },
    isSubmitted: false,
  });

  // Auth state management
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.uid) {
          await fetchTickets(currentUser.uid);
        }
      } else {
        router.push('/signup');
      }
      setAuthInitialized(true);
      setLoading(prev => ({ ...prev, initial: false }));
    });

    return () => unsubscribe();
  }, [router]);

  // Check for pending closures every minute
  useEffect(() => {
    if (!user?.uid) return;

    const interval = setInterval(() => {
      checkPendingClosures(user.uid);
    }, 60000);

    checkPendingClosures(user.uid);

    return () => clearInterval(interval);
  }, [user?.uid]);

  // Data fetching
  const fetchTickets = useCallback(async (userId: string) => {
    try {
      setLoading(prev => ({ ...prev, refresh: true }));
      
      const q = query(
        collection(db, 'helpdesk'),
        where('userDetails.uid', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const ticketList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          helpdeskID: data.helpdeskID,
          category: data.category,
          status: data.status || 'opened',
          createdAt: data.createdAt,
          resolvedAt: data.resolvedAt,
          updatedAt: data.updatedAt,
          responses: data.responses || {
            opened: {
              response: data.description || '',
              attachmentURL: data.attachmentURL || '',
              createdAt: data.createdAt
            }
          },
          userDetails: data.userDetails || {
            name: '',
            email: '',
            phone: '',
            uid: userId,
            userID: ''
          }
        };
      });
      
      setTickets(ticketList);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      showNotification('error', 'Failed to fetch tickets');
    } finally {
      setLoading(prev => ({ ...prev, refresh: false }));
    }
  }, []);

  const checkPendingClosures = useCallback(async (userId: string) => {
    try {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      const q = query(
        collection(db, 'helpdesk'),
        where('userDetails.uid', '==', userId),
        where('status', '==', 'resolved'),
        where('resolvedAt', '<=', threeDaysAgo)
      );

      const querySnapshot = await getDocs(q);
      const batchUpdates = querySnapshot.docs.map(doc => {
        return updateDoc(doc.ref, {
          status: 'closed',
          updatedAt: serverTimestamp(),
          responses: {
            ...doc.data().responses,
            closed: {
              response: 'Ticket automatically closed after 3 days of resolution',
              createdAt: serverTimestamp()
            }
          }
        });
      });

      await Promise.all(batchUpdates);
      if (batchUpdates.length > 0) {
        await fetchTickets(userId);
      }
    } catch (error) {
      console.error('Error checking pending closures:', error);
    }
  }, [fetchTickets]);

const handleReopenTicket = useCallback(async () => {
  if (!selectedTicket?.id || !user?.uid || !reopenMessage) {
    showNotification('error', 'Please provide a reason for reopening the ticket');
    return;
  }
  
  try {
    setLoading(prev => ({ ...prev, reopen: true }));
    const ticketRef = doc(db, 'helpdesk', selectedTicket.id);
    
    await updateDoc(ticketRef, {
      status: "reopened",
      updatedAt: serverTimestamp(),
      responses: {
        ...selectedTicket.responses,
        reopened: {
          response: reopenMessage,
          attachmentURL: reopenAttachmentUrl || "",
          createdAt: serverTimestamp()
        }
      }
    });

    showNotification('success', 'Ticket reopened successfully!');
    closeReopenModal();
    setSelectedTicket(null); // Add this line to ensure details modal doesn't open
    await fetchTickets(user.uid);
  } catch (error) {
    console.error('Error reopening ticket:', error);
    showNotification('error', 'Failed to reopen ticket');
  } finally {
    setLoading(prev => ({ ...prev, reopen: false }));
  }
}, [user?.uid, selectedTicket, reopenMessage, reopenAttachmentUrl, fetchTickets]);
 const canReopenTicket = (ticket: Ticket) => {
  return ticket.status === 'resolved' && 
         (!ticket.resolvedAt || 
          new Date(ticket.resolvedAt.toDate()) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000));
};


  const openReopenModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setReopenMessage('');
    setReopenAttachmentUrl(null);
    setIsReopenModalOpen(true);
  };

  const closeReopenModal = () => {
    setIsReopenModalOpen(false);
    setReopenMessage('');
    setReopenAttachmentUrl(null);
  };

  // Form handling
  const validateForm = useCallback(() => {
    const newErrors = {
      category: !form.category ? 'Category is required' : '',
      description: !form.description ? 'Description is required' : 
        form.description.length < 10 ? 'Description must be at least 10 characters' :
        form.description.length > 1000 ? 'Description must be less than 1000 characters' : '',
      form: ''
    };

    setForm(prev => ({ ...prev, errors: newErrors }));
    return !newErrors.category && !newErrors.description;
  }, [form.category, form.description]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setForm(prev => ({ ...prev, isSubmitted: true }));

    if (!user?.uid) {
      showNotification('error', 'You must be logged in to submit a ticket');
      return;
    }

    if (!validateForm()) return;

    try {
      setLoading(prev => ({ ...prev, submit: true }));
      
      const ticketId = generateTicketID();
      const usersQuery = query(collection(db, "users"), where("uid", "==", user.uid));
      const usersSnapshot = await getDocs(usersQuery);
      
      const userData = usersSnapshot.docs[0]?.data() || {};
      const ticketRef = doc(db, 'helpdesk', ticketId);
      
      await setDoc(ticketRef, {
        category: form.category,
        createdAt: serverTimestamp(),
        helpdeskID: ticketId,
        responses: {
          opened: {
            attachmentURL: attachmentUrl || "",
            createdAt: serverTimestamp(),
            response: form.description
          }
        },
        status: "opened",
        updatedAt: serverTimestamp(),
        userDetails: {
          name: user.displayName || '',
          email: user.email || '',
          phone: userData.phone || '',
          uid: user.uid,
          userID: userData.userID || ''
        }
      });

      showNotification('success', 'Ticket created successfully!');
      closeModal();
      await fetchTickets(user.uid);
    } catch (error) {
      console.error('Error creating ticket:', error);
      showNotification('error', 'Failed to create ticket. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  }, [user, form, attachmentUrl, validateForm, fetchTickets]);

  // Helper functions
  const generateTicketID = () => `HID${Date.now().toString().slice(-8)}`;

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotifications({
      ...notifications,
      [type]: { show: true, message }
    });
    setTimeout(() => {
      setNotifications(prev => ({
        ...prev,
        [type]: { ...prev[type], show: false }
      }));
    }, 5000);
  };

  const formatStatusDisplay = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'opened': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'reopened': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'pendingclosure': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeRemaining = (resolvedAt: any) => {
    if (!resolvedAt?.toDate) return '';
    const resolvedDate = resolvedAt.toDate();
    const closureDate = new Date(resolvedDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    if (now > closureDate) return 'Closed soon';
    
    const diff = closureDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `Closes in ${hours}h ${minutes}m`;
  };

  const formatDate = (date: any) => {
    if (!date?.toDate) return 'N/A';
    return date.toDate().toLocaleString();
  };

  // UI handlers
  const showModal = () => {
    setIsModalOpen(true);
    setForm(prev => ({ ...prev, isSubmitted: false, errors: { category: '', description: '', form: '' } }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm({
      category: 'Account Related',
      description: '',
      errors: { category: '', description: '', form: '' },
      isSubmitted: false
    });
    setAttachmentUrl(null);
  };

  const showTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const closeTicketDetails = () => {
    setSelectedTicket(null);
  };

  const handleUploadSuccess = (url: string) => {
    setAttachmentUrl(url);
  };

  const handleReopenUploadSuccess = (url: string) => {
    setReopenAttachmentUrl(url);
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload failed:', error);
    showNotification('error', 'File upload failed. Please try again.');
  };

  // Render logic
  if (!authInitialized || loading.initial) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-34 px-4 py-8 max-w-7xl">
      {/* Notifications */}
      {notifications.success.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-4 rounded-md shadow-lg flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>{notifications.success.message}</span>
          </div>
        </div>
      )}

      {notifications.error.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-500 text-white px-6 py-4 rounded-md shadow-lg flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span>{notifications.error.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Help Desk Tickets</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => fetchTickets(user.uid)}
              disabled={loading.refresh}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 mr-1 ${loading.refresh ? 'animate-spin' : ''}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              {loading.refresh ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={showModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Ticket
            </button>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initial Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No tickets found
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.helpdeskID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{ticket.helpdeskID}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{ticket.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {formatStatusDisplay(ticket.status)}
                        </span>
                        {ticket.status === 'resolved' && ticket.resolvedAt && (
                          <span className="ml-2 text-xs text-gray-500">
                            {getTimeRemaining(ticket.resolvedAt)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {ticket.responses.opened.response}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {canReopenTicket(ticket) && (
                          <button
                            onClick={() => openReopenModal(ticket)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Reopen
                          </button>
                        )}
                        <button
                          onClick={() => showTicketDetails(ticket)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="border-b px-6 py-1">
              <h2 className="text-xl font-semibold text-gray-800">Create New Ticket</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4" noValidate>
              <div className="mb-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-3 py-1 border ${form.errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Account Related">Account Related</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing Support">Billing Support</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Other">Other</option>
                </select>
                {form.errors.category && (
                  <p className="mt-1 text-sm text-red-600">{form.errors.category}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full px-3 py-2 border ${form.errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Describe your issue in detail (minimum 10 characters)"
                  required
                />
                {form.errors.description && (
                  <p className="mt-1 text-sm text-red-600">{form.errors.description}</p>
                )}
                <div className="text-right text-xs text-gray-500 mt-1">
                  {form.description.length}/1000 characters
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-1">
                  Attachment (Optional)
                </label>
                <FirebaseFileUploader
                  storagePath="prathviTravelsMedia/helpdesk"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  maxSizeMB={15}
                  disabled={false}
                  onUploadStart={() => console.log('Upload started')}
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 15MB)
                </p>
              </div>

              {form.errors.form && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  {form.errors.form}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.submit}
                  className={`px-4 py-2 rounded-md text-white ${loading.submit ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {loading.submit ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reopen Ticket Modal */}
      {isReopenModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="border-b px-6 py-1">
              <h2 className="text-xl font-semibold text-gray-800">Reopen Ticket #{selectedTicket.helpdeskID}</h2>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reopenMessage">
                  Reason for Reopening <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reopenMessage"
                  rows={4}
                  value={reopenMessage}
                  onChange={(e) => setReopenMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please explain why you're reopening this ticket"
                  required
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {reopenMessage.length}/1000 characters
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-1">
                  Attachment (Optional)
                </label>
                <FirebaseFileUploader
                  storagePath="prathviTravelsMedia/helpdesk"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  maxSizeMB={15}
                  disabled={false}
                  onUploadStart={() => console.log('Upload started')}
                  onUploadSuccess={handleReopenUploadSuccess}
                  onUploadError={handleUploadError}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 15MB)
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeReopenModal}
                  className="px-4 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReopenTicket}
                  disabled={loading.reopen || !reopenMessage}
                  className={`px-4 py-2 rounded-md text-white ${loading.reopen || !reopenMessage ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {loading.reopen ? 'Reopening...' : 'Reopen Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && !isReopenModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Ticket Details</h2>
              <button
                onClick={closeTicketDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Ticket ID</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedTicket.helpdeskID}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                      {formatStatusDisplay(selectedTicket.status)}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedTicket.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTicket.createdAt)}</p>
                </div>
                {selectedTicket.resolvedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Resolved At</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTicket.resolvedAt)}</p>
                  </div>
                )}
                {selectedTicket.updatedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTicket.updatedAt)}</p>
                  </div>
                )}
              </div>

              {/* Ticket Responses */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500">Initial Message</h3>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-900 whitespace-pre-line">{selectedTicket.responses.opened.response}</p>
                  {selectedTicket.responses.opened.attachmentURL && (
                    <div className="mt-2">
                      <a 
                        href={selectedTicket.responses.opened.attachmentURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {selectedTicket.responses.resolved && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500">Resolution Response</h3>
                  <div className="mt-1 p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-line">{selectedTicket.responses.resolved.response}</p>
                    {selectedTicket.responses.resolved.attachmentURL && (
                      <div className="mt-2">
                        <a 
                          href={selectedTicket.responses.resolved.attachmentURL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                          View Attachment
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedTicket.responses.reopened && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500">Reopened Response</h3>
                  <div className="mt-1 p-3 bg-orange-50 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-line">{selectedTicket.responses.reopened.response}</p>
                    {selectedTicket.responses.reopened.attachmentURL && (
                      <div className="mt-2">
                        <a 
                          href={selectedTicket.responses.reopened.attachmentURL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                          View Attachment
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
               {canReopenTicket(selectedTicket) && (
  <button
    onClick={() => {
      closeTicketDetails();
      openReopenModal(selectedTicket);
    }}
    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  >
    Reopen Ticket
  </button>
)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpDeskPage;