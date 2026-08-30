import config from '../config.js';

const BASE_URL = 'https://www.omdbapi.com/';

/**
 * Search + fetch full details for a single movie title.
 * @param {string} title
 * @param {string} [year] optional year to disambiguate
 * @returns {Promise<object|null>} OMDb movie object, or null if not found/error
 */
export const fetchMovie = async (title, year = '') => {
    if (!config.omdbApiKey || config.omdbApiKey === 'YOUR_OMDB_API_KEY_HERE') {
        throw new Error('OMDb API key not set. Add your key to config.js (omdbApiKey).');
    }

    const params = new URLSearchParams({
        apikey: config.omdbApiKey,
        t: title,
        plot: 'full'
    });
    if (year) params.set('y', year);

    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    const data = await res.json();

    if (data.Response === 'False') return null;
    return data;
};

/**
 * Fetch a movie by exact IMDb ID (e.g. tt1375666).
 * @param {string} imdbId
 */
export const fetchMovieById = async (imdbId) => {
    if (!config.omdbApiKey || config.omdbApiKey === 'YOUR_OMDB_API_KEY_HERE') {
        throw new Error('OMDb API key not set. Add your key to config.js (omdbApiKey).');
    }

    const params = new URLSearchParams({
        apikey: config.omdbApiKey,
        i: imdbId,
        plot: 'full'
    });

    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    const data = await res.json();

    if (data.Response === 'False') return null;
    return data;
};

/**
 * Pull the Rotten Tomatoes score out of OMDb's Ratings array, if present.
 */
export const getRottenTomatoes = (movie) => {
    const rt = movie.Ratings?.find((r) => r.Source === 'Rotten Tomatoes');
    return rt ? rt.Value : 'N/A';
};
