import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate as useActualNavigate } from 'react-router-dom'; // Assuming you use React Router
import './LandingPage.css'; // Import the CSS file

const LandingPage = () => {
    // --- Navigation Hook Handling ---
    // Safely initialize useNavigate to prevent crashes if not within a <Router> context (e.g., in a preview environment)
    let navigate = (path) => {
        console.warn(
            `Navigation to "${path}" was attempted, but a router context was not found or useNavigate failed. ` +
            `This is a fallback. Ensure this component is rendered within a <Router> in your application.`
        );
        // Fallback behavior for previewing (e.g., hash change or just log)
        // window.location.hash = path; // Example: simple hash navigation
    };

    try {
        // Attempt to get the actual navigate function from React Router
        // useActualNavigate is imported to avoid naming collision if useNavigate was already declared
        const actualNavigate = useActualNavigate();
        navigate = actualNavigate; // If successful, use the real navigate function
    } catch (error) {
        // Log the error if useNavigate() fails (e.g., not in Router context)
        console.warn(
            "useNavigate() hook failed. This typically means the component is not rendered within a <Router> context. " +
            "Falling back to a mock navigation function. Error: ", error.message
        );
    }

    const collageBackgroundRef = useRef(null);
    const [collageItems, setCollageItems] = useState([]);
    
    // --- Message Box State ---
    const [isMessageBoxVisible, setIsMessageBoxVisible] = useState(false);
    const [messageBoxContent, setMessageBoxContent] = useState({ title: '', text: '' });
    const [messageBoxOkCallback, setMessageBoxOkCallback] = useState(null); // Stores the function that returns the actual onOk callback

    const showMessage = useCallback((title, text, onOk) => {
        setMessageBoxContent({ title, text });
        // Store a function that, when called, will return the original onOk callback.
        // This is to ensure the latest onOk is captured if showMessage is called multiple times
        // with different onOk functions before the previous one is dismissed.
        setMessageBoxOkCallback(() => () => onOk()); 
        setIsMessageBoxVisible(true);
    }, []);

    const handleMessageBoxOk = () => {
        setIsMessageBoxVisible(false);
        if (typeof messageBoxOkCallback === 'function') {
            const getOnOkFunction = messageBoxOkCallback(); // This will be () => onOk()
            if (typeof getOnOkFunction === 'function') {
                 const onOkFunction = getOnOkFunction(); // This will be the actual onOk passed to showMessage
                 if (typeof onOkFunction === 'function') {
                    onOkFunction(); // Execute the actual onOk callback
                 }
            }
        }
    };

    // --- Collage Configuration ---
    const numCollageItems = 12;
    const mediaSources = [ // Ensure these URLs are publicly accessible and correct
        { type: 'image', src: 'https://placehold.co/600x400/000000/FFFFFF?text=Tech+Abstract&font=inter' },
        { type: 'image', src: 'https://placehold.co/400x600/1E40AF/FFFFFF?text=Growth&font=inter' },
        { type: 'image', src: 'https://placehold.co/500x500/34D399/000000?text=Data&font=inter' },
        { type: 'image', src: 'https://placehold.co/600x300/F59E0B/FFFFFF?text=Connect&font=inter' },
        { type: 'image', src: 'https://placehold.co/450x650/7C3AED/FFFFFF?text=Innovation&font=inter' },
        { type: 'image', src: 'https://placehold.co/800x400/DC2626/FFFFFF?text=Strategy&font=inter' },
        { type: 'image', src: 'https://placehold.co/300x500/059669/FFFFFF?text=Clarity&font=inter' },
        { type: 'image', src: 'https://placehold.co/700x700/DB2777/FFFFFF?text=Insight&font=inter' },
        { type: 'image', src: 'https://placehold.co/600x450/4F46E5/FFFFFF?text=Future&font=inter' },
        { type: 'image', src: 'https://placehold.co/350x550/D97706/FFFFFF?text=Success&font=inter' },
        // { type: 'video', src: 'path/to/your/video1.mp4' }, // Ensure video paths are correct and files are hosted
    ];

    const updateCollageItem = useCallback((itemDiv, isInitial = false) => {
        if (!itemDiv) return; 

        const randomMedia = mediaSources[Math.floor(Math.random() * mediaSources.length)];
        
        itemDiv.classList.add('fade-out');

        setTimeout(() => {
            while (itemDiv.firstChild) {
                itemDiv.removeChild(itemDiv.firstChild);
            }

            if (randomMedia.type === 'image') {
                const img = document.createElement('img');
                img.alt = 'Collage background image';
                img.dataset.loading = 'true';
                img.onload = () => {
                    img.dataset.loading = 'false';
                    itemDiv.classList.remove('fade-out');
                    itemDiv.classList.add('fade-in');
                };
                img.onerror = () => {
                    console.error("Error loading image:", randomMedia.src);
                    img.src = 'https://placehold.co/400x300/CCCCCC/000000?text=Image+Load+Error&font=inter';
                    img.alt = 'Error loading image';
                    img.dataset.loading = 'false';
                    itemDiv.classList.remove('fade-out');
                    itemDiv.classList.add('fade-in');
                };
                img.src = randomMedia.src;
                itemDiv.appendChild(img);
            } else if (randomMedia.type === 'video') {
                const video = document.createElement('video');
                video.src = randomMedia.src;
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                video.onloadeddata = () => {
                    itemDiv.classList.remove('fade-out');
                    itemDiv.classList.add('fade-in');
                };
                video.onerror = () => {
                    console.error("Error loading video:", randomMedia.src);
                    const img = document.createElement('img'); // Fallback to an image on video error
                    img.src = 'https://placehold.co/400x300/CCCCCC/000000?text=Video+Load+Error&font=inter';
                    img.alt = 'Video error placeholder';
                    while (itemDiv.firstChild) { itemDiv.removeChild(itemDiv.firstChild); }
                    itemDiv.appendChild(img);
                    itemDiv.classList.remove('fade-out');
                    itemDiv.classList.add('fade-in');
                };
                itemDiv.appendChild(video);
            }
            
            if (!isInitial) {
                setTimeout(() => {
                    itemDiv.classList.remove('fade-out');
                    itemDiv.classList.add('fade-in');
                }, 50); // ms delay
            }
        }, 500); // Corresponds to fade-out duration
    }, [mediaSources]); 

    // --- Initialize Collage ---
    useEffect(() => {
        if (!collageBackgroundRef.current) return;

        const bgElement = collageBackgroundRef.current;
        while (bgElement.firstChild) {
            bgElement.removeChild(bgElement.firstChild);
        }
        
        const newCollageItemElements = [];
        for (let i = 0; i < numCollageItems; i++) {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('collage-item');
            updateCollageItem(itemDiv, true);
            bgElement.appendChild(itemDiv);
            newCollageItemElements.push(itemDiv);
        }
        setCollageItems(newCollageItemElements); 

        return () => {
            newCollageItemElements.forEach(item => {
                if (item.parentNode === bgElement) {
                    bgElement.removeChild(item);
                }
            });
            setCollageItems([]); // Clear state on unmount
        };
    }, [numCollageItems, updateCollageItem]); // updateCollageItem is memoized


    // --- Periodically Update Collage ---
    useEffect(() => {
        if (collageItems.length === 0) return () => {}; // Return empty cleanup if no items

        const intervalId = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * collageItems.length);
            const itemToUpdate = collageItems[randomIndex];
            if (itemToUpdate) {
                updateCollageItem(itemToUpdate);
            }
        }, 3000); // ms

        return () => clearInterval(intervalId); 
    }, [collageItems, updateCollageItem]); // updateCollageItem is memoized

    // --- Logo Click Navigation ---
    const handleLogoClick = () => {
        showMessage('Navigating...', 'You are being redirected to the ProspectRanker Home Page.', () => {
            navigate('/home'); // Uses the potentially fallback navigate function
        });
    };

    // --- Handle Window Resize ---
    useEffect(() => {
        let resizeTimer;
        const handleResize = () => {
            if (collageBackgroundRef.current) {
                collageBackgroundRef.current.style.opacity = '0';
            }
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (collageBackgroundRef.current) {
                    collageBackgroundRef.current.style.opacity = '0.3';
                }
            }, 250); // ms
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty dependency array: runs once on mount, cleans up on unmount


    return (
        <>
            {/* Styles are imported from LandingPage.css */}
            <div className="landing-page-component-container">
                <div className="landing-container-inner">
                    <div className="collage-background" ref={collageBackgroundRef}>
                        {/* Collage items are managed by useEffect and direct DOM manipulation */}
                    </div>

                    <div className="logo-container">
                        <div 
                            className="logo" 
                            id="prospectRankerLogo" // ID can be kept for consistency or specific targeting if needed
                            onClick={handleLogoClick} 
                            role="button" 
                            tabIndex={0}  // Makes it focusable
                            onKeyPress={(e) => e.key === 'Enter' && handleLogoClick()} // Keyboard accessibility
                        >
                            ProspectRanker
                        </div>
                        <p className="prompt">Click to Enter</p>
                    </div>
                </div>

                {/* Conditionally render Message Box */}
                {isMessageBoxVisible && (
                    <div className="message-box-overlay visible"> {/* Added 'visible' class directly */}
                        <div className="message-box">
                            <h3>{messageBoxContent.title}</h3>
                            <p>{messageBoxContent.text}</p>
                            <button onClick={handleMessageBoxOk}>OK</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default LandingPage;
