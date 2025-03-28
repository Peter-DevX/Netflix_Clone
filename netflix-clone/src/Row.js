import React, { useEffect, useState } from 'react';
import axios from './axios';
import "./Row.css";
import YouTube from "react-youtube";
import movieTrailer from 'movie-trailer';

const base_url = "https://image.tmdb.org/t/p/original/";

function Row({ title, fetchUrl, isLargeRow }) {
    const [movies, setMovies] = useState([]);
    const [trailerUrl, setTrailerUrl] = useState("");
    const [currentMovieId, setCurrentMovieId] = useState(null); // Track which movie's trailer is playing

    useEffect(() => {
        async function fetchData() {
            const request = await axios.get(fetchUrl);
            setMovies(request.data.results);
            return request;
        }
        fetchData();
    }, [fetchUrl]);

    const opts = {
        height: '390',
        width: '100%',
        playerVars: {
            autoplay: 1,
        },
    };

    const handleClick = async (movie) => {
        // If clicking the same movie that's currently playing
        if (currentMovieId === movie.id) {
            setTrailerUrl('');
            setCurrentMovieId(null);
            return;
        }

        // If clicking a different movie
        setCurrentMovieId(movie.id);
        setTrailerUrl(''); // Clear previous trailer immediately

        try {
            const name = movie?.name || movie?.title || movie?.original_name || "";
            const url = await movieTrailer(name);

            if (url) {
                const urlParams = new URLSearchParams(new URL(url).search);
                const videoId = urlParams.get('v');
                
                if (videoId) {
                    setTrailerUrl(videoId);
                } else {
                    // Handle shortened YouTube URLs (e.g., youtu.be/VIDEO_ID)
                    const shortUrlId = url.split('/').pop()?.split('?')[0];
                    if (shortUrlId) setTrailerUrl(shortUrlId);
                }
            } else {
                console.log("No trailer found for:", name);
                setCurrentMovieId(null); // Reset if no trailer found
            }
        } catch (error) {
            console.log("Error fetching trailer:", error);
            setCurrentMovieId(null); // Reset on error
        }
    };

    return (
        <div className='row'>
            <h2 className='movie__title'>{title}</h2>

            <div className='row__posters'>
                {movies.map(movie => (
                    <img
                        key={movie.id}
                        onClick={() => handleClick(movie)}
                        className={`row__poster ${isLargeRow && "row__posterLarge"} ${
                            currentMovieId === movie.id ? 'active' : ''
                        }`}
                        src={`${base_url}${isLargeRow ? movie.poster_path : movie.backdrop_path}`}
                        alt={movie.name}
                    />
                ))}
            </div>

            {trailerUrl && <YouTube videoId={trailerUrl} opts={opts} />}
        </div>
    );
}

export default Row;