const grid = document.querySelector('.grid');

for (let i = 0; i < 25; i++) {
    for (let j = 0; j < 25; j++) {
        const box = document.createElement('div');
        box.classList.add('box');
        grid.appendChild(box);
    } 
}
