// game-core.js

// --- Core Game Variables ---
export const character = document.getElementById("character");
export const map = document.getElementById("map");
export const dialogueBox = document.getElementById("dialogueBox");
export const dialogueTextContainer = document.getElementById("dialogueText");
export const nextBtn = document.getElementById("nextBtn");
export const dialogueSound = document.getElementById("dialogueSound");

// Character position (pixel coordinates on the map)
// These variables are no longer exported.
let characterX = 90;
let characterY = 34;
export let held_directions = [];
export const characterSpeed = 0.25;

export let isTyping = false;
export let currentDialogueIndex = 0;
export let currentDialogueSet = [];
export let isDialogueActive = false;
export let onDialogueEndFunction = null;

// --- Utility Functions ---
export function getPixelSize() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--pixel-size'));
}

export function calculateDistance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = x1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

// --- Dialogue System ---
export function startDialogue(dialogueSet, onEndCallback = null) {
    isDialogueActive = true;
    currentDialogueSet = dialogueSet;
    currentDialogueIndex = 0;
    onDialogueEndFunction = onEndCallback;
    dialogueBox.style.display = 'block';
    nextDialogueLine();
}

export function nextDialogueLine() {
    if (isTyping) {
        clearTimeout(typeTextTimeout);
        dialogueTextContainer.innerHTML = currentDialogueSet[currentDialogueIndex - 1];
        isTyping = false;
        return;
    }

    if (currentDialogueIndex < currentDialogueSet.length) {
        typeText(currentDialogueSet[currentDialogueIndex]);
        playDialogueSound();
        currentDialogueIndex++;
    } else {
        endDialogue();
    }
}

let typeTextTimeout;

export function typeText(text) {
    dialogueTextContainer.innerHTML = "";
    let charIndex = 0;
    isTyping = true;

    function typeNextChar() {
        if (charIndex < text.length) {
            dialogueTextContainer.innerHTML += text[charIndex];
            charIndex++;
            typeTextTimeout = setTimeout(typeNextChar, 50);
        } else {
            isTyping = false;
        }
    }
    typeNextChar();
}

export function playDialogueSound() {
    dialogueSound.currentTime = 0;
    dialogueSound.play().catch(e => console.log("Audio play blocked:", e));
}

export function endDialogue() {
    dialogueBox.style.display = 'none';
    isDialogueActive = false;
    currentDialogueSet = [];

    if (onDialogueEndFunction && typeof onDialogueEndFunction === 'function') {
        onDialogueEndFunction();
        onDialogueEndFunction = null;
    }
}

// --- Character Movement Loop ---
const directions = {
    up: "up",
    down: "down",
    left: "left",
    right: "right",
};
export const keys = {
    38: directions.up,
    37: directions.left,
    39: directions.right,
    40: directions.down,
    69: "interact", // 'E' key for interaction
};

// EXPORT this function, which now contains and updates the variables
export function placeCharacter() {
    if (isDialogueActive) return;

    const pixelSize = getPixelSize();

    const held_direction = held_directions[0];
    if (held_direction) {
        if (held_direction === directions.right) { characterX += characterSpeed; }
        if (held_direction === directions.left) { characterX -= characterSpeed; }
        if (held_direction === directions.down) { characterY += characterSpeed; }
        if (held_direction === directions.up) { characterY -= characterSpeed; }
        character.setAttribute("facing", held_direction);
    }
    character.setAttribute("walking", held_direction ? "true" : "false");

    const leftLimit = -8;
    const rightLimit = (16 * 11) + 8;
    const topLimit = -8 + 32;
    const bottomLimit = (16 * 7);

    if (characterX < leftLimit) { characterX = leftLimit; }
    if (characterX > rightLimit) { characterX = rightLimit; }
    if (characterY < topLimit) { characterY = topLimit; }
    if (characterY > bottomLimit) { characterY = bottomLimit; }

    const camera_left = pixelSize * 66;
    const camera_top = pixelSize * 42;

    map.style.transform = `translate3d( ${-characterX * pixelSize + camera_left}px, ${-characterY * pixelSize + camera_top}px, 0 )`;
    character.style.transform = `translate3d( ${characterX * pixelSize}px, ${characterY * pixelSize}px, 0 )`;
}

// --- Game Loop ---
export const step = () => {
    placeCharacter();
    window.requestAnimationFrame(() => {
        step();
    })
}

// New function to get the current position for interactions
export function getCharacterPosition() {
    return { x: characterX, y: characterY };
}