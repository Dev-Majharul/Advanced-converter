import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [jobs, setJobs] = useState({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Create socket connection
    const socketInstance = io(process.env.REACT_APP_API_URL || 'http://localhost:5001', {
      transports: ['websocket'],
      autoConnect: true,
    });

    // Set up event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('conversionProgress', (data) => {
      console.log('Progress update:', data);
      setJobs(prev => ({
        ...prev,
        [data.jobId]: {
          ...prev[data.jobId],
          ...data,
        }
      }));
    });

    socketInstance.on('conversionComplete', (data) => {
      console.log('Conversion complete:', data);
      setJobs(prev => ({
        ...prev,
        [data.jobId]: {
          ...prev[data.jobId],
          ...data,
          status: 'completed',
          progress: 100,
        }
      }));
    });

    socketInstance.on('conversionError', (data) => {
      console.log('Conversion error:', data);
      setJobs(prev => ({
        ...prev,
        [data.jobId]: {
          ...prev[data.jobId],
          ...data,
          status: 'error',
        }
      }));
    });

    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('conversionProgress');
      socketInstance.off('conversionComplete');
      socketInstance.off('conversionError');
      socketInstance.disconnect();
    };
  }, []);

  const addJob = (jobId, initialData) => {
    setJobs(prev => ({
      ...prev,
      [jobId]: {
        id: jobId,
        progress: 0,
        status: 'pending',
        ...initialData
      }
    }));
  };

  const clearJob = (jobId) => {
    setJobs(prev => {
      const newJobs = { ...prev };
      delete newJobs[jobId];
      return newJobs;
    });
  };

  const clearAllJobs = () => {
    setJobs({});
  };

  const value = {
    socket,
    connected,
    jobs,
    addJob,
    clearJob,
    clearAllJobs
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext; 