// Curated title pools per genre. OMDb has no "trending" or "browse" endpoint,
// so recommend/top10 pick from these lists, then pull live details from OMDb.

export const movieLists = {
    action: [
        'Mad Max: Fury Road', 'John Wick', 'Die Hard', 'The Dark Knight',
        'Gladiator', 'Mission: Impossible - Fallout', 'The Raid', 'Heat',
        'Terminator 2: Judgment Day', 'Extraction'
    ],
    comedy: [
        'Superbad', 'The Grand Budapest Hotel', 'Bridesmaids', 'Step Brothers',
        'The Hangover', 'Knives Out', 'Game Night', 'Tropic Thunder',
        'Dodgeball: A True Underdog Story', 'What We Do in the Shadows'
    ],
    drama: [
        'The Shawshank Redemption', 'Forrest Gump', 'Fight Club',
        'The Godfather', 'Whiplash', 'Parasite', 'The Green Mile',
        'A Beautiful Mind', 'Good Will Hunting', 'Manchester by the Sea'
    ],
    scifi: [
        'Inception', 'Interstellar', 'Blade Runner 2049', 'The Matrix',
        'Arrival', 'Dune', 'Ex Machina', 'Edge of Tomorrow',
        'District 9', 'Children of Men'
    ],
    horror: [
        'Hereditary', 'The Conjuring', 'Get Out', 'A Quiet Place',
        'It Follows', 'The Babadook', 'Midsommar', 'Sinister',
        'The Witch', 'Insidious'
    ],
    animation: [
        'Spider-Man: Into the Spider-Verse', 'Spirited Away', 'Coco',
        'Up', 'Your Name', 'The Lion King', 'Toy Story',
        'How to Train Your Dragon', 'Inside Out', 'Wall-E'
    ],
    romance: [
        'The Notebook', 'Pride & Prejudice', 'La La Land',
        'Eternal Sunshine of the Spotless Mind', 'About Time',
        'Titanic', '500 Days of Summer', 'Before Sunrise',
        'Crazy Rich Asians', 'Notting Hill'
    ]
};

export const genres = Object.keys(movieLists);

export const getRandomTitle = (genre) => {
    const pool = genre && movieLists[genre] ? movieLists[genre] : Object.values(movieLists).flat();
    return pool[Math.floor(Math.random() * pool.length)];
};
