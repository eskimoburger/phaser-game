import StartGame from './game/main';

document.addEventListener('DOMContentLoaded', () => {
    // Get the app container
    // const appContainer = document.getElementById('app');
    
    // if (!appContainer) {
    //     console.error('App container not found');
    //     return;
    // }
    
    // // Create the start page
    // const startPage = document.createElement('div');
    // startPage.className = 'start-page';
    
    // // Add content to the start page
    // startPage.innerHTML = `
    //     <h1>Adventure Game</h1>
    //     <p>Embark on an epic journey in this exciting game. Explore new worlds, face challenges, and discover hidden treasures.</p>
    //     <button class="start-button">Start Game</button>
    // `;
    
    // // Clear existing content and add the start page
    // appContainer.innerHTML = '';
    // appContainer.appendChild(startPage);
    
    // // Add click event to the start button
    // const startButton = startPage.querySelector('.start-button');
    // if (!startButton) {
    //     console.error('Start button not found');
    //     return;
    // }
    
    // startButton.addEventListener('click', () => {
    //     // Remove start page
    //     appContainer.removeChild(startPage);
        
    //     // Create loading screen
    //     const loadingScreen = document.createElement('div');
    //     loadingScreen.className = 'loading-screen';
        
    //     // Add loading content
    //     loadingScreen.innerHTML = `
    //         <h2>Loading Game...</h2>
    //         <div class="loading-bar-container">
    //             <div class="loading-bar"></div>
    //         </div>
    //         <p class="loading-text">0%</p>
    //     `;
        
    //     appContainer.appendChild(loadingScreen);
        
    //     // Fake loading progress
    //     let progress = 0;
    //     const loadingBar = loadingScreen.querySelector('.loading-bar') as HTMLElement;
    //     const loadingText = loadingScreen.querySelector('.loading-text');
        
    //     if (!loadingBar || !loadingText) {
    //         console.error('Loading elements not found');
    //         return;
    //     }
        
    //     const interval = setInterval(() => {
    //         progress += Math.random() * 10;
            
    //         if (progress >= 100) {
    //             progress = 100;
    //             clearInterval(interval);
                
    //             // Small delay after reaching 100%
    //             setTimeout(() => {
    //                 // Remove loading screen
    //                 appContainer.removeChild(loadingScreen);
                    
    //                 // Create game container
    //                 const gameContainer = document.createElement('div');
    //                 gameContainer.id = 'game-container';
    //                 appContainer.appendChild(gameContainer);
                    
    //                 // Start the game
    //                 StartGame('game-container');
    //             }, 500);
    //         }
            
    //         loadingBar.style.width = `${progress}%`;
    //         loadingText.textContent = `${Math.round(progress)}%`;
    //     }, 200);
    // });

    StartGame('game-container');
});