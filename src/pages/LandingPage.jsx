import React, { useEffect, useState, useRef, useCallback } from 'react';
// Standard import for useNavigate
import { useNavigate } from 'react-router-dom'; 
// Import your logo image
import prospectRankerLogoSrc from '../assets/ProspectRanker-logo.png'; // Adjust path path for logo which was named differently.

// Defining constants outside the component to ensure stability.
const NUM_COLLAGE_ITEMS = 1; // Adjusted to 1 because of error/s.
const MEDIA_SOURCES = [ // Array of media sources for the collage
    { type: 'image', src: './src/assets/LandingPage-Image01.jpg' },
    { type: 'image', src: './src/assets/LandingPage-Image02.jpg' },
    { type: 'image', src: './src/assets/LandingPage-Image03.jpg' },
    { type: 'image', src: './src/assets/LandingPage-Image06.jpg' },
    { type: 'image', src: './src/assets/LandingPage-Image07.jpg' },
    { type: 'image', src: './src/assets/LandingPage-Image08.jpg' },
    { type: 'image', src: './src/assets/LandingPage-Image09.jpg' },
    { type: 'image', src: './src/assets/LandingPage-Image10.jpg' },
    { type: 'image', src: './src/assets/LandingPage-Image14.jpg' },
    { type: 'image', src: './src/assets/LandingPage-Image15.jpg' },
    { type: 'image', src: './src/assets/LandingPage-Image16.jpg' },
    { type: 'image', src: './src/assets/LandingPage-Image17.jpg' },
    { type: 'image', src: './src/assets/LandingPage-Image18.jpg' },
    { type: 'image', src: './src/assets/LandingPage-Image19.jpg' },
    { type: 'image', src: './src/assets/LandingPage-Image20.jpg' },
    // EFor video: { type: 'video', src: 'path/to/my/video1.mp4' }, 
];

const LandingPage = () => {
    const navigate = useNavigate();  // Call useNavigate at the top level, unconditionally.

    const collageBackgroundRef = useRef(null);
    const [collageItems, setCollageItems] = useState([]);
    
    const [isMessageBoxVisible, setIsMessageBoxVisible] = useState(false); //Message Box State.
    const [messageBoxContent, setMessageBoxContent] = useState({ title: '', text: '' });
    const [messageBoxOkCallback, setMessageBoxOkCallback] = useState(null); 

    const showMessage = useCallback((title, text, onOk) => {
        setMessageBoxContent({ title, text });
        setMessageBoxOkCallback(() => onOk); 
        setIsMessageBoxVisible(true);
    }, []); 

    const handleMessageBoxOk = () => {
        setIsMessageBoxVisible(false);
        if (typeof messageBoxOkCallback === 'function') {
            const onOkFunction = messageBoxOkCallback(); 
            if (typeof onOkFunction === 'function') {
                onOkFunction(); 
            }
        }
    };

    const updateCollageItem = useCallback((itemDiv, isInitial = false) => { // Function to update the single background item in the collage.
        if (!itemDiv) return; 

        const randomMedia = MEDIA_SOURCES[Math.floor(Math.random() * MEDIA_SOURCES.length)];
        
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
                    const img = document.createElement('img'); 
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
                }, 50); 
            }
        }, 500); 
    }, []); 

    useEffect(() => { // Implementing Collage component 
        if (!collageBackgroundRef.current) return; 

        const bgElement = collageBackgroundRef.current;
        while (bgElement.firstChild) { 
            bgElement.removeChild(bgElement.firstChild);
        }
        
        const newCollageItemElements = [];
        for (let i = 0; i < NUM_COLLAGE_ITEMS; i++) { // Using NUM_COLLAGE_ITEMS.
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
            setCollageItems([]); 
        };
    }, [updateCollageItem]); 

    useEffect(() => { // Code designed to periodically update the bg collage items.
        if (collageItems.length === 0) return () => {}; 

        const intervalId = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * collageItems.length);
            const itemToUpdate = collageItems[randomIndex];
            if (itemToUpdate) { 
                updateCollageItem(itemToUpdate);
            }
        }, 3000); // Alternate images every 3 seconds.

        return () => clearInterval(intervalId); 
    }, [collageItems, updateCollageItem]); 

    const handleLogoClick = () => { // This is the logo click cavigation handler. To take the User to the Home Page.
        console.log("LandingPage: Logo clicked. Preparing to show message and then navigate.");
        showMessage('Navigating...', 'You are being redirected to the ProspectRanker Home Page.', () => {
            console.log("LandingPage: Message box OK clicked. Executing navigate('/home').");
            try {
                if (typeof navigate === 'function') {
                    navigate('/home'); 
                    console.log("LandingPage: navigate('/home') call attempted.");
                } else {
                    console.error("LandingPage: Navigation function is not available. useNavigate() might have failed or was not correctly initialized at the top level.");
                }
            } catch (e) {
                console.error("LandingPage: Error occurred during navigate('/home') call:", e);
            }
        });
    };

    useEffect(() => { // Handler for window resize and collage opacity.
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
            }, 250); 
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize); 
    }, []); 


    return (
        <>
            {/* Embedded CSS styles. Exported css was causing errors. */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                
                body, #root, .App { 
                    height: 100%; 
                    margin: 0;
                    padding: 0; 
                }
                html {
                    height: 100%;
                }

                .landing-page-component-container { 
                    font-family: 'Inter', sans-serif;
                    background-color: #111827; 
                    color: #fff; 
                    overflow: hidden; 
                    height: 100vh; 
                    width: 100vw; 
                    display: flex;
                    align-items: center; 
                    justify-content: center; 
                    position: fixed; 
                    top: 0;
                    left: 0;
                }

                .landing-container-inner { 
                    position: relative; 
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .collage-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: grid;
                    /* If NUM_COLLAGE_ITEMS is 1, these specific grid template definitions are less critical 
                       as the single item will expand, but they are harmless. */
                    grid-template-columns: 1fr; /* Single column */
                    grid-template-rows: 1fr;    /* Single row */
                    gap: 0px; /* No gap needed for a single item */
                    opacity: 0.3; 
                    z-index: 1; 
                    overflow: hidden; 
                    transition: opacity 0.5s ease-in-out;
                    align-content: stretch; 
                    justify-content: stretch; 
                }

                .collage-item {
                    width: 100%;
                    height: 100%;
                    overflow: hidden; 
                    border-radius: 0px; /* No border radius needed if it's a full background image */
                    transition: opacity 0.5s ease-in-out; 
                }

                .collage-item img,
                .collage-item video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover; 
                    display: block; 
                }
                
                .collage-item.fade-out { opacity: 0; }
                .collage-item.fade-in { opacity: 1; }

                .logo-container {
                    position: relative; 
                    z-index: 10; 
                    text-align: center;
                    padding: 20px;
                    background-color: rgba(0, 0, 0, 0.3); 
                    border-radius: 16px; 
                    backdrop-filter: blur(5px); 
                    -webkit-backdrop-filter: blur(5px); 
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37); 
                }

                .logo img { /* Style the image within the logo div */
                    max-width: 900px; 
                    max-height: 450px; 
                    display: block; /* Remove extra space below image */
                    margin: 0 auto; /* Center if container is wider */
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }

                .logo img:hover {
                    transform: scale(1.05); 
                }

                .prompt {
                    font-size: clamp(0.8rem, 2vw, 1rem); 
                    color: #e0e0e0; 
                    margin-top: 15px;
                    opacity: 0; 
                    transition: opacity 0.3s ease-in-out;
                    pointer-events: none; 
                }

                .logo-container:hover .prompt { opacity: 3; } 

                .collage-item img[data-loading="true"] {
                    opacity: 0.5; 
                    filter: blur(5px); 
                }
                .collage-item img[data-loading="false"] {
                    opacity: 1; 
                    filter: blur(0); 
                    transition: opacity 0.5s ease-in-out, filter 0.5s ease-in-out;
                }

                .message-box-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7); 
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000; 
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s ease, visibility 0s 0.3s; 
                }

                .message-box-overlay.visible {
                    opacity: 1;
                    visibility: visible;
                    transition: opacity 0.3s ease, visibility 0s 0s; 
                }

                .message-box {
                    background-color: #2d3748; 
                    color: #e2e8f0; 
                    padding: 2rem;
                    border-radius: 0.5rem; 
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
                    text-align: center;
                    max-width: 90%; 
                    width: 400px; 
                }

                .message-box h3 {
                    font-size: 1.5rem; 
                    font-weight: 700; 
                    margin-bottom: 1rem; 
                }

                .message-box p { margin-bottom: 1.5rem; }

                .message-box button {
                    background-color: #4a5568; 
                    color: white;
                    padding: 0.75rem 1.5rem; 
                    border: none;
                    border-radius: 0.375rem; 
                    font-weight: 600; 
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
                .message-box button:hover { background-color: #2c5282; }
            `}</style>
            <div className="landing-page-component-container">
                <div className="landing-container-inner">
                    <div className="collage-background" ref={collageBackgroundRef}>
                    </div>

                    <div className="logo-container">
                        {/* Updated logo section to use an <img> tag with imported src. */}
                        <div 
                            className="logo" 
                            onClick={handleLogoClick} 
                            role="button" 
                            tabIndex={0}  
                            onKeyPress={(e) => e.key === 'Enter' && handleLogoClick()}
                        >
                            <img 
                                src={prospectRankerLogoSrc} 
                                alt="ProspectRanker Logo" 
                            />
                        </div>
                        <p className="prompt">Click to Enter</p>
                    </div>
                </div>

                {isMessageBoxVisible && (
                    <div className="message-box-overlay visible"> 
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
